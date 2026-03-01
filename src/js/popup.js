// JS for popup.html

import {
    linkClick,
    saveOptions,
    showToast,
    updateManifest,
    updateOptions,
} from './export.js'

document.addEventListener('DOMContentLoaded', initPopup)
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', (e) => linkClick(e, true)))
document
    .querySelectorAll('#options-form input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    updateManifest().catch((e) => console.warn(e))

    chrome.storage.sync.get(['options']).then((items) => {
        // console.debug('options:', items.options)
        updateOptions(items.options)
    })

    if (chrome.runtime.lastError) {
        showToast(chrome.runtime.lastError.message, 'warning')
    }
}
