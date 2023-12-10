// JS for text.html

document.addEventListener('DOMContentLoaded', initWindow)

document.getElementById('close').addEventListener('click', () => {
    chrome.windows.remove(chrome.windows.WINDOW_ID_CURRENT)
})

/**
 * Initialize Window
 * @function initWindow
 */
async function initWindow() {
    console.log('initWindow')
    const { options } = await chrome.storage.sync.get(['options'])
    console.log('options:', options)
}
