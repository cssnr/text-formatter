// JS Exports

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
 * @param {InputEvent} event
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
        const number = parseInt(event.target.value, 10)
        console.log('number:', number)
        console.log('!isNaN(number):', !isNaN(number))
        console.log('number >= 0:', number >= 0)
        console.log('if', !isNaN(number) || number >= 0)
        let min = 1
        let max = 999
        if (!isNaN(number) && number >= min && number <= max) {
            event.target.value = number.toString()
            options[event.target.id] = number
        } else {
            event.target.value = options[event.target.id]
            // TODO: Add Error Handling
            // showToast(`Value ${number} Out of Range for ${event.target.id}`,'warning')
            return
        }
        value = number.toString()
    } else {
        value = event.target.value
    }
    if (value !== undefined) {
        options[key] = value
        console.info(`Set: ${key}:`, value)
        await chrome.storage.sync.set({ options })
    } else {
        console.warn('No Value for key:', key)
    }
}

/**
 * Update Options based on typeof
 * @function initOptions
 * @param {Object} options
 */
export function updateOptions(options) {
    for (const [key, value] of Object.entries(options)) {
        // console.debug(`${key}: ${value}`)
        const el = document.getElementById(key)
        if (el) {
            if (typeof value === 'boolean') {
                el.checked = value
            } else if (typeof value === 'string') {
                el.value = value
            }
        }
        // el.classList.remove('is-invalid')
    }
}

/**
 * Update DOM with Manifest Details
 * @function updateManifest
 */
export function updateManifest() {
    const manifest = chrome.runtime.getManifest()
    document
        .querySelectorAll('.version')
        .forEach((el) => (el.textContent = manifest.version))
    document
        .querySelectorAll('[href="homepage_url"]')
        .forEach((el) => (el.href = manifest.homepage_url))
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
