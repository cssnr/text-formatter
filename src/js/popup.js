// JS for popup.html

import { checkPerms, saveOptions, updateOptions } from './export.js'

document.addEventListener('DOMContentLoaded', initPopup)

document
    .querySelectorAll('[data-href]')
    .forEach((el) => el.addEventListener('click', popupLinks))
document
    .querySelectorAll('#options-form input')
    .forEach((el) => el.addEventListener('change', saveOptions))

document.getElementById('grant-perms').onclick = grantPermsBtn
// document.getElementById('revoke-perms').onclick = revokePermsBtn
document.getElementById('inject-script').onclick = injectScript

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.log('initPopup')
    document.getElementById('version').textContent =
        chrome.runtime.getManifest().version

    const { options } = await chrome.storage.sync.get(['options'])
    console.log('options:', options)
    updateOptions(options)

    await checkPerms()

    // const views = chrome.extension.getViews()
    // console.log('views:', views)

    // const tabs = await chrome.tabs.query({ highlighted: true })
    // console.log('tabs:', tabs)
}

/**
 * Popup Links Click Callback
 * Firefox requires a call to window.close()
 * @function popupLinks
 * @param {MouseEvent} event
 */
async function popupLinks(event) {
    console.log('popupLinks:', event)
    event.preventDefault()
    const anchor = event.target.closest('a')
    let url
    if (anchor?.dataset?.href.startsWith('http')) {
        url = anchor.dataset.href
    } else if (anchor?.dataset?.href === 'homepage') {
        url = chrome.runtime.getManifest().homepage_url
    } else if (anchor?.dataset?.href === 'options') {
        chrome.runtime.openOptionsPage()
        return window.close()
    } else if (anchor?.dataset?.href === 'open_window') {
        await chrome.windows.create({
            type: 'detached_panel',
            url: '/html/window.html',
            width: 720,
            height: 480,
        })
        return window.close()
    } else if (anchor?.dataset?.href) {
        url = chrome.runtime.getURL(anchor.dataset.href)
    }
    console.log('url:', url)
    if (!url) {
        return console.error('No dataset.href for anchor:', anchor)
    }
    await chrome.tabs.create({ active: true, url })
    return window.close()
}

/**
 * Grant Permissions Button Click Callback
 * @function grantPerms
 * @param {Event} event
 */
function grantPermsBtn(event) {
    console.log('permissions click:', event)
    chrome.permissions.request({
        origins: ['https://*/*', 'http://*/*'],
    })
    window.close()
}

// /**
//  * Revoke Permissions Button Click Callback
//  * TODO: Determine how to remove host permissions on chrome
//  * @function revokePermsBtn
//  * @param {Event} event
//  */
// async function revokePermsBtn(event) {
//     const permissions = await chrome.permissions.getAll()
//     console.log('permissions:', permissions)
//     await chrome.permissions.remove({
//         origins: permissions.origins,
//     })
//     window.close()
// }

/**
 * Grant Permissions Button Click Callback
 * @function injectScript
 * @param {MouseEvent} event
 */
async function injectScript(event) {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true })
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: alertFunction,
    })
    window.close()
}

function alertFunction() {
    alert('Inject Script Success')
}
