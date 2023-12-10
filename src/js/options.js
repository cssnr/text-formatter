// JS for options.html

import { checkPerms, saveOptions, updateOptions } from './export.js'

document.addEventListener('DOMContentLoaded', initOptions)

chrome.storage.onChanged.addListener(onChanged)

document.getElementById('grant-perms').addEventListener('click', grantPermsBtn)

document
    .querySelectorAll('#options-form input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .getElementById('options-form')
    .addEventListener('submit', (e) => e.preventDefault())

document.querySelectorAll('[data-href]').forEach((el) =>
    el.addEventListener('click', async (e) => {
        console.log('clicked')
        const url = chrome.runtime.getURL(e.target.dataset.href)
        await chrome.tabs.create({ active: true, url })
        window.close()
    })
)

/**
 * Initialize Options
 * @function initOptions
 */
async function initOptions() {
    console.log('initOptions')
    document.getElementById('version').textContent =
        chrome.runtime.getManifest().version

    await setShortcuts({
        mainKey: '_execute_action',
        openPage: 'open_page',
        showWindow: 'show_window',
    })

    const { options } = await chrome.storage.sync.get(['options'])
    console.log('options:', options)
    updateOptions(options)
    await checkPerms()
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    // console.log('onChanged:', changes, namespace)
    for (const [key, { newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options') {
            console.log('newValue:', newValue)
            updateOptions(newValue)
        }
    }
}

/**
 * Grant Permissions Button Click Callback
 * @function grantPermsBtn
 * @param {MouseEvent} event
 */
async function grantPermsBtn(event) {
    console.log('grantPermsBtn:', event)
    await chrome.permissions.request({
        origins: ['https://*/*', 'http://*/*'],
    })
    await checkPerms()
}

/**
 * Set Keyboard Shortcuts
 * @function setShortcuts
 * @param {Object} mapping { elementID: name }
 */
async function setShortcuts(mapping) {
    const commands = await chrome.commands.getAll()
    for (const [elementID, name] of Object.entries(mapping)) {
        // console.log(`${elementID}: ${name}`)
        const command = commands.find((x) => x.name === name)
        if (command?.shortcut) {
            console.log(`${elementID}: ${command.shortcut}`)
            const el = document.getElementById(elementID)
            if (el) {
                el.textContent = command.shortcut
            }
        }
    }
}
