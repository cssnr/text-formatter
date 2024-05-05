// JS Background Service Worker

import { processText } from './export.js'

chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.commands.onCommand.addListener(onCommand)
chrome.storage.onChanged.addListener(onChanged)

/**
 * On Startup Callback
 * @function onStartup
 */
async function onStartup() {
    console.log('onStartup')
    if (typeof browser !== 'undefined') {
        console.log('Firefox CTX Menu Workaround')
        const { options, patterns } = await chrome.storage.sync.get([
            'options',
            'patterns',
        ])
        console.debug('options:', options)
        if (options.contextMenu) {
            createContextMenus(patterns)
        }
    }
}

/**
 * On Install Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const githubURL = 'https://github.com/cssnr/text-formatter'
    const options = await Promise.resolve(
        setDefaultOptions({
            contextMenu: true,
            showUpdate: false,
            textSplitLength: '50',
            textSliderMin: '20',
            textSliderMax: '80',
            textLengths: ['30', '40', '60', '70'],
        })
    )
    console.log('options:', options)
    if (options.contextMenu) {
        createContextMenus()
    }
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.openOptionsPage()
        const url = chrome.runtime.getURL('/html/split.html')
        await chrome.tabs.create({ active: false, url })
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        if (options.showUpdate) {
            const manifest = chrome.runtime.getManifest()
            if (manifest.version !== details.previousVersion) {
                const url = `${githubURL}/releases/tag/${manifest.version}`
                await chrome.tabs.create({ active: false, url })
            }
        }
    }
    await chrome.runtime.setUninstallURL(`${githubURL}/issues`)
}

/**
 * On Clicked Callback
 * @function onClicked
 * @param {OnClickData} ctx
 * @param {chrome.tabs.Tab} tab
 */
async function onClicked(ctx, tab) {
    console.log('onClicked:', ctx, tab)
    if (ctx.menuItemId === 'options') {
        chrome.runtime.openOptionsPage()
    } else if (ctx.menuItemId === 'open_text') {
        console.log('open_text: ctx.selectionText:', ctx.selectionText)
        const text = ctx.selectionText
        const url = new URL(chrome.runtime.getURL('/html/split.html'))
        url.searchParams.set('text', text)
        await chrome.tabs.create({ active: true, url: url.toString() })
    } else if (ctx.menuItemId === 'open_paragraphs') {
        console.log('open_paragraphs: ctx.selectionText:', ctx.selectionText)
        const [tab] = await chrome.tabs.query({
            currentWindow: true,
            active: true,
        })
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractSelection,
        })
        if (!results.length || !results[0].result) {
            return console.log('No Selection Text.')
        }
        console.log('results.result', results[0].result)
        for (let text of results[0].result.split('\n')) {
            text = text.replace(/[\r\n]+/g, '')
            if (text.length && !text.startsWith('"')) {
                console.log(`text: "${text}"`)
                const url = new URL(chrome.runtime.getURL('/html/split.html'))
                url.searchParams.set('text', text)
                await chrome.tabs.create({ active: false, url: url.toString() })
            }
        }
    } else if (ctx.menuItemId === 'split_text') {
        console.log('split_text: ctx.selectionText:', ctx.selectionText)
        let { options } = await chrome.storage.sync.get(['options'])
        const text = processText(ctx.selectionText, options.textSplitLength)
        console.log('text:', text)
        await clipboardWrite(text)
    } else if (ctx.menuItemId === 'open_page') {
        const url = chrome.runtime.getURL('/html/split.html')
        await chrome.tabs.create({ active: true, url })
    } else {
        console.error(`Unknown ctx.menuItemId: ${ctx.menuItemId}`)
    }
}

/**
 * On Command Callback
 * @function onCommand
 * @param {String} command
 */
async function onCommand(command) {
    console.log(`onCommand: ${command}`)
    if (command === 'open_page') {
        const url = chrome.runtime.getURL('/html/split.html')
        await chrome.tabs.create({ active: true, url })
    } else {
        console.error(`Unknown command: ${command}`)
    }
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    // console.log('onChanged:', changes, namespace)
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options' && oldValue && newValue) {
            if (oldValue.contextMenu !== newValue.contextMenu) {
                if (newValue?.contextMenu) {
                    console.log('Enabled contextMenu...')
                    createContextMenus()
                } else {
                    console.log('Disabled contextMenu...')
                    chrome.contextMenus.removeAll()
                }
            }
        }
    }
}

/**
 * A Function
 * @function extractSelection
 * @return {String}
 */
function extractSelection() {
    console.log('extractSelection')
    const selection = window.getSelection()
    console.log('selection:', selection)
    return selection.toString()
}

/**
 * Create Context Menus
 * @function createContextMenus
 */
function createContextMenus() {
    console.log('createContextMenus')
    chrome.contextMenus.removeAll()
    const ctx = ['all']
    const contexts = [
        [['selection'], 'open_text', 'normal', 'Open Text in Page'],
        [['selection'], 'open_paragraphs', 'normal', 'Open Paragraphs in Page'],
        [['selection'], 'split_text', 'normal', 'Split Text and Copy'],
        [['selection'], 'separator-2', 'separator', 'separator'],
        [ctx, 'open_page', 'normal', 'Text Split Page'],
        [ctx, 'separator-1', 'separator', 'separator'],
        [ctx, 'options', 'normal', 'Open Options'],
    ]
    contexts.forEach((context) => {
        chrome.contextMenus.create({
            contexts: context[0],
            id: context[1],
            type: context[2],
            title: context[3],
        })
    })
}

/**
 * Set Default Options
 * @function setDefaultOptions
 * @param {Object} defaultOptions
 * @return {Object}
 */
async function setDefaultOptions(defaultOptions) {
    console.log('setDefaultOptions', defaultOptions)
    let { options } = await chrome.storage.sync.get(['options'])
    options = options || {}
    let changed = false
    for (const [key, value] of Object.entries(defaultOptions)) {
        // console.log(`${key}: default: ${value} current: ${options[key]}`)
        if (options[key] === undefined) {
            changed = true
            options[key] = value
            console.log(`Set ${key}:`, value)
        }
    }
    if (changed) {
        await chrome.storage.sync.set({ options })
        console.log('changed:', options)
    }
    return options
}

/**
 * Write value to Clipboard for Firefox and Chrome
 * @function clipboardWrite
 * @param {String} value
 */
async function clipboardWrite(value) {
    console.log('clipboardWrite:', value)
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(value)
    } else {
        await chrome.offscreen.createDocument({
            url: 'html/offscreen.html',
            reasons: [chrome.offscreen.Reason.CLIPBOARD],
            justification: 'Write text to the clipboard.',
        })
        await chrome.runtime.sendMessage({
            type: 'copy-data-to-clipboard',
            target: 'offscreen-doc',
            data: value,
        })
    }
}
