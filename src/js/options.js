// JS for options.html

import { saveOptions, updateManifest, updateOptions } from './export.js'

chrome.storage.onChanged.addListener(onChanged)
document.addEventListener('DOMContentLoaded', initOptions)
document
    .querySelectorAll('#options-form input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .getElementById('options-form')
    .addEventListener('submit', (e) => e.preventDefault())
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

/**
 * Initialize Options
 * @function initOptions
 */
async function initOptions() {
    console.debug('initOptions')

    updateManifest().catch((e) => console.warn(e))
    setShortcuts().catch((e) => console.warn(e))

    chrome.storage.sync.get(['options']).then((items) => {
        // console.debug('options:', items.options)
        updateOptions(items.options)
    })
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    // console.debug('onChanged:', changes, namespace)
    for (const [key, { newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options') {
            updateOptions(newValue)
        }
    }
}

/**
 * Set Keyboard Shortcuts
 * @function setShortcuts
 * @param {String} [selector]
 */
async function setShortcuts(selector = '#keyboard-shortcuts') {
    if (!chrome.commands) {
        return console.debug('Skipping: chrome.commands')
    }
    const table = document.querySelector(selector)
    table.classList.remove('d-none')
    const tbody = table.querySelector('tbody')
    const source = table.querySelector('tfoot > tr').cloneNode(true)
    const commands = await chrome.commands.getAll()
    for (const command of commands) {
        // console.debug('command:', command)
        const row = source.cloneNode(true)
        let description = command.description
        // Note: Chrome does not parse the description for _execute_action in manifest.json
        if (!description && command.name === '_execute_action') {
            description = 'Open Popup' // NOTE: Also defined in: manifest.json
        }
        row.querySelector('.description').textContent = description
        row.querySelector('kbd').textContent = command.shortcut || 'Not Set'
        tbody.appendChild(row)
    }
}
