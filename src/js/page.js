// JS for page.html

import { processText } from './export.js'

document.addEventListener('DOMContentLoaded', initPage)

document.getElementById('length').addEventListener('change', saveLength)
document.getElementById('paste').addEventListener('click', pasteBtn)
document.getElementById('process').addEventListener('click', processBtn)
document.getElementById('copy').addEventListener('click', copyBtn)
document.getElementById('undo').addEventListener('click', undoBtn)
document.getElementById('clear').addEventListener('click', clearBtn)

let previousText = ''

/**
 * Initialize Page
 * @function initPage
 */
async function initPage() {
    console.log('initPage')
    const { options } = await chrome.storage.sync.get(['options'])
    console.log('options:', options)
    document.getElementById('length').value = options.textSplitLength

    if (options.textLengths?.length) {
        document.getElementById('no-filters').remove()
        options.textLengths.forEach(function (value, i) {
            createFilterLink(i.toString(), value)
        })
    }
}

async function saveLength() {
    console.log('save')
    const length = document.querySelector('input').value
    let { options } = await chrome.storage.sync.get(['options'])
    options.textSplitLength = length
    await chrome.storage.sync.set({ options })
}

async function pasteBtn() {
    console.log('paste')
    const clipboardContents = await navigator.clipboard.readText()
    console.log('clipboardContents:', clipboardContents)
    document.querySelector('textarea').value = clipboardContents
}

async function processBtn(event) {
    console.log('process', event)
    let length
    if (event.target.dataset.pattern) {
        length = event.target.dataset.pattern
    } else {
        length = document.querySelector('input').value
    }
    console.log('length:', length)
    const text = document.querySelector('textarea').value
    previousText = text
    const result = processText(text, length)
    console.log(result)
    document.querySelector('textarea').value = result
    await navigator.clipboard.writeText(result)
}

async function copyBtn() {
    console.log('copy')
    await navigator.clipboard.writeText(
        document.querySelector('textarea').value
    )
}

async function undoBtn() {
    console.log('undo')
    document.querySelector('textarea').value = previousText
}

async function clearBtn() {
    console.log('clear')
    document.querySelector('textarea').value = ''
}

/**
 * Add Form Input for a Filter
 * @function createFilterLink
 * @param {String} number
 * @param {String} value
 */
function createFilterLink(number, value = '') {
    const ul = document.getElementById('filters-ul')
    const li = document.createElement('li')
    ul.appendChild(li)
    const a = document.createElement('a')
    a.textContent = value
    a.dataset.pattern = value
    a.classList.add('dropdown-item', 'small')
    a.setAttribute('role', 'button')
    a.addEventListener('click', processBtn)
    li.appendChild(a)
}
