// JS Background Service Worker

import { processText } from './export.js'

chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(contextMenusClicked)
chrome.commands.onCommand.addListener(onCommand)
chrome.runtime.onMessage.addListener(onMessage)
chrome.storage.onChanged.addListener(onChanged)

/**
 * On Startup Callback
 * @function onStartup
 */
function onStartup() {
    console.log('onStartup')
}

/**
 * On Install Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const githubURL = 'https://github.com/smashedr/web-tools-extension'
    const options = await Promise.resolve(
        setDefaultOptions({
            contextMenu: true,
            showUpdate: false,
            textSplitLength: '30',
        })
    )
    console.log('options:', options)
    if (options.contextMenu) {
        createContextMenus()
    }
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // chrome.runtime.openOptionsPage()
        const url = chrome.runtime.getURL('/html/oninstall.html')
        await chrome.tabs.create({ url, active: true })
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        if (options.showUpdate) {
            const manifest = chrome.runtime.getManifest()
            if (manifest.version !== details.previousVersion) {
                const url = `${githubURL}/releases/tag/${manifest.version}`
                await chrome.tabs.create({ url, active: false })
            }
        }
    }
    await chrome.runtime.setUninstallURL(`${githubURL}/issues`)
}

/**
 * On Clicked Callback
 * @function contextMenusClicked
 * @param {OnClickData} ctx
 * @param {chrome.tabs.Tab} tab
 */
async function contextMenusClicked(ctx, tab) {
    console.log('contextMenusClicked:', ctx, tab)
    if (ctx.menuItemId === 'options') {
        chrome.runtime.openOptionsPage()
    } else if (ctx.menuItemId === 'split_text') {
        console.log('ctx.selectionText:', ctx.selectionText)
        let { options } = await chrome.storage.sync.get(['options'])
        const text = processText(ctx.selectionText, options.textSplitLength)
        console.log('text:', text)
        await clipboardWrite(text)
    } else if (ctx.menuItemId === 'open_page') {
        // const views = chrome.extension.getViews()
        // const result = views.find((item) => item.location.href.endsWith('html/page.html'))
        // console.log('result:', result)
        const url = chrome.runtime.getURL('/html/page.html')
        await chrome.tabs.create({ active: true, url })
    } else if (ctx.menuItemId === 'open_window') {
        await chrome.windows.create({
            type: 'detached_panel',
            url: '/html/window.html',
            width: 720,
            height: 480,
        })
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
        const url = chrome.runtime.getURL('/html/page.html')
        await chrome.tabs.create({ active: true, url })
    } else if (command === 'open_window') {
        await chrome.windows.create({
            type: 'detached_panel',
            url: '/html/window.html',
            width: 480,
            height: 360,
        })
    }
}

/**
 * Handle Messages
 * @function onMessage
 * @param {Object} message
 * @param {MessageSender} sender
 * @param {Function} sendResponse
 */
function onMessage(message, sender, sendResponse) {
    console.log('onMessage: message, sender:', message, sender)
    sendResponse('success')
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
 * Create Context Menus
 * @function createContextMenus
 */
function createContextMenus() {
    console.log('createContextMenus')
    chrome.contextMenus.removeAll()
    const ctx = ['all']
    const contexts = [
        [['selection'], 'split_text', 'normal', 'Split Text'],
        [['selection'], 'separator-2', 'separator', 'separator'],
        [ctx, 'open_page', 'normal', 'Main Page'],
        // [ctx, 'open_window', 'normal', 'Main Window'],
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
        // Firefox
        await navigator.clipboard.writeText(value)
    } else {
        // Chrome
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
