// JS Exports

/**
 * Process Text
 * @function processText
 * @param {String} text
 * @param {String} length
 * @return {String}
 */
export function processText(text, length) {
    console.log('processText: length:', length)
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
    return results.join('\n')
}

/**
 * Save Options Callback
 * @function saveOptions
 * @param {InputEvent} event
 */
export async function saveOptions(event) {
    console.log('saveOptions:', event)
    const { options } = await chrome.storage.sync.get(['options'])
    let value
    if (event.target.type === 'checkbox') {
        value = event.target.checked
    } else if (event.target.type === 'text') {
        value = event.target.value
    }
    if (value !== undefined) {
        options[event.target.id] = value
        console.log(`Set: ${event.target.id}:`, value)
        await chrome.storage.sync.set({ options })
    }
}

/**
 * Update Options based on typeof
 * @function initOptions
 * @param {Object} options
 */
export function updateOptions(options) {
    for (const [key, value] of Object.entries(options)) {
        // console.log(`${key}: ${value}`)
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
