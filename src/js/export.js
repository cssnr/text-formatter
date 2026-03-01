// JS Exports

export const githubURL = 'https://github.com/cssnr/text-formatter'

/**
 * Process Text
 * @function processText
 * @param {String} text
 * @param {String} length
 * @return {String}
 */
export function processText(text, length) {
    // console.debug('processText: length:', length)
    // console.debug('input text:', text)
    text = text.replace(/\s\s+/g, ' ').replace(/\n+/g, ' ')
    // console.debug('processed text:', text)
    const split = text.split(' ')
    const results = []
    let line = ''
    for (const word of split) {
        const current = line.length + word.length
        if (current > parseInt(length)) {
            results.push(line.trim())
            line = `${word} `
            continue
        }
        line += `${word} `
    }
    results.push(line.trim())
    return results.join('\n').trim()
    // let result = results.join('\n').trim()
    // console.debug('result text:', result)
    // return result
}

/**
 * Save Options Callback
 * @function saveOptions
 * @param {UIEvent} event
 */
export async function saveOptions(event) {
    console.debug('saveOptions:', event)
    const { options } = await chrome.storage.sync.get(['options'])
    let key = event.target.id
    let value
    if (event.target.type === 'radio') {
        key = event.target.name
        const radios = document.getElementsByName(key)
        for (const input of radios) {
            if (input.checked) {
                value = input.id
                break
            }
        }
    } else if (event.target.type === 'checkbox') {
        value = event.target.checked
    } else if (event.target.type === 'number') {
        const number = Number.parseFloat(event.target.value)
        let min = event.target.min ? Number.parseFloat(event.target.min) : -Infinity
        let max = event.target.max ? Number.parseFloat(event.target.max) : Infinity
        if (!Number.isNaN(number) && number >= min && number <= max) {
            event.target.value = number.toString()
            value = number
        } else {
            event.target.value = options[event.target.id]
            return
        }
    } else {
        value = event.target.value
    }
    if (value !== undefined) {
        options[key] = value
        console.log(`Set %c${key}:`, 'color: Khaki', value)
        await chrome.storage.sync.set({ options })
    } else {
        console.warn(`No Value for key: ${key}`)
    }
}

/**
 * Update Options
 * @function initOptions
 * @param {Object} options
 */
export function updateOptions(options) {
    console.debug('updateOptions:', options)
    for (let [key, value] of Object.entries(options)) {
        if (value === undefined) {
            console.warn('Value undefined for key:', key)
            continue
        }
        // Option Key should be `radioXXX` and values should be the option IDs
        if (key.startsWith('radio')) {
            key = value //NOSONAR
            value = true //NOSONAR
        }
        // console.debug(`${key}: ${value}`)
        const el = document.getElementById(key)
        if (!el) {
            continue
        }
        if (el.tagName !== 'INPUT') {
            el.textContent = value.toString()
        } else if (typeof value === 'boolean') {
            el.checked = value
        } else {
            el.value = value
        }
        if (el.dataset.related) {
            hideShowElement(`#${el.dataset.related}`, value)
        }
    }
}

/**
 * Hide or Show Element with JQuery
 * @function hideShowElement
 * @param {String} selector
 * @param {Boolean} [show]
 * @param {String} [speed]
 */
function hideShowElement(selector, show, speed = 'fast') {
    const element = $(`${selector}`)
    // console.debug('hideShowElement:', show, element)
    if (show) {
        element.show(speed)
    } else {
        element.hide(speed)
    }
}

/**
 * Link Click Callback
 * Note: Firefox popup requires a call to window.close()
 * @function linkClick
 * @param {MouseEvent|Event} event
 * @param {Boolean} [close]
 */
export async function linkClick(event, close = false) {
    console.debug('linkClick:', close, event)
    const target = event.currentTarget
    const href = target.getAttribute('href').replace(/^\.+/, '')
    console.debug('href:', href)
    let url
    if (href.startsWith('#')) {
        console.debug('return on anchor link')
        return
    }
    event.preventDefault()
    if (href.endsWith('html/options.html')) {
        await chrome.runtime.openOptionsPage()
        if (close) window.close()
        return
    } else if (href.startsWith('http') || href.includes('/html/page.html?url=')) {
        url = href
    } else {
        url = chrome.runtime.getURL(href)
    }
    console.debug('url:', url)
    await activateOrOpen(url)
    if (close) window.close()
}

/**
 * Activate or Open Tab from URL
 * @function activateOrOpen
 * @param {String} url
 * @param {Boolean} [open]
 * @return {Promise<chrome.tabs.Tab>}
 */
export async function activateOrOpen(url, open = true) {
    console.debug('activateOrOpen:', url, open)
    // Note: To Get Tab from Tabs (requires host permissions or tabs)
    const tabs = await chrome.tabs.query({ currentWindow: true })
    console.debug('tabs:', tabs)
    for (const tab of tabs) {
        if (tab.url === url) {
            console.debug('%cTab found, activating:', 'color: Lime', tab)
            return await chrome.tabs.update(tab.id, { active: true })
        }
    }
    if (open) {
        console.debug('%cTab not found, opening url:', 'color: Yellow', url)
        return await chrome.tabs.create({ active: true, url })
    }
    console.warn('tab not found and open not set!')
}

/**
 * Update DOM with Manifest Details
 * @function updateManifest
 */
export async function updateManifest() {
    const manifest = chrome.runtime.getManifest()
    console.debug('updateManifest:', manifest)
    document.querySelectorAll('.version').forEach((el) => {
        el.textContent = manifest.version
    })
    document.querySelectorAll('[href="homepage_url"]').forEach((el) => {
        el.href = manifest.homepage_url
    })
    document.querySelectorAll('[href="version_url"]').forEach((el) => {
        el.href = `${githubURL}/releases/tag/${manifest.version}`
    })
}

/**
 * Show Bootstrap Toast
 * @function showToast
 * @param {String} message
 * @param {String} type
 */
export function showToast(message, type = 'success') {
    console.debug(`showToast: ${type}: ${message}`)
    const clone = document.querySelector('.d-none > .toast')
    const container = document.getElementById('toast-container')
    if (!clone || !container) {
        return console.warn('Missing clone or container:', clone, container)
    }
    const element = clone.cloneNode(true)
    element.querySelector('.toast-body').innerHTML = message
    element.classList.add(`text-bg-${type}`)
    container.appendChild(element)
    const toast = new bootstrap.Toast(element)
    element.addEventListener('mousemove', () => toast.hide())
    toast.show()
}
