// JS for split.html

import { processText } from './export.js'

document.addEventListener('DOMContentLoaded', initPage)

const textInput = document.getElementById('textInput')
const textOutput = document.getElementById('textOutput')
const lengthRange = document.getElementById('lengthSlider')
const lengthInput = document.getElementById('length')

textInput.addEventListener('input', processForm)
lengthRange.addEventListener('change', saveLength)
lengthRange.addEventListener('input', processForm)
lengthInput.addEventListener('change', saveLength)
lengthInput.addEventListener('input', processForm)

document.getElementById('paste').addEventListener('click', pasteBtn)
// document.getElementById('process').addEventListener('click', processForm)
document.getElementById('copy').addEventListener('click', copyBtn)
document.getElementById('clear').addEventListener('click', clearBtn)
document.getElementById('close').addEventListener('click', closeBtn)
document.getElementById('readOnly').addEventListener('change', toggleReadOnly)
document.getElementById('length-form').addEventListener('submit', addLength)

/**
 * Initialize Page
 * @function initPage
 */
async function initPage(event) {
    console.log('initPage:', event)
    const { options } = await chrome.storage.sync.get(['options'])
    console.log('options:', options)

    lengthInput.value = options.textSplitLength
    lengthRange.value = options.textSplitLength
    lengthRange.min = options.textSliderMin
    lengthRange.max = options.textSliderMax

    const urlParams = new URLSearchParams(window.location.search)
    const text = urlParams.get('text') || textInput.value
    if (text) {
        // console.log('urlParams text:', text)
        textInput.value = text
        await processForm(event)
    }
    updateLengthsDropdown(options.textLengths)
    updateTable(options.textLengths)
}

async function saveLength(event) {
    // console.log('saveLength', event)
    const length = event.target.value
    // console.log('length:', length)
    lengthRange.value = length
    lengthInput.value = length
    try {
        let { options } = await chrome.storage.sync.get(['options'])
        options.textSplitLength = length
        await chrome.storage.sync.set({ options })
    } catch (error) {
        console.log(error)
    }
}

async function pasteBtn(event) {
    console.log('pasteBtn:', event)
    try {
        const clipboardContents = await navigator.clipboard.readText()
        console.log('clipboardContents:', clipboardContents)
        textInput.value = clipboardContents
        await processForm(event)
    } catch (error) {
        showToast('Clipboard Read Failed!', 'danger')
        console.log(error)
    }
}

async function processForm(event) {
    // console.log('processForm:', event)
    let length
    if (event.target?.dataset?.pattern) {
        // console.log('FROM: event.target.dataset.pattern')
        length = event.target.dataset.pattern
    } else if (event.target.classList?.contains('length')) {
        // console.log('FROM: event.target.value')
        length = event.target.value
    } else {
        // console.log('FROM: lengthInput.value')
        length = lengthInput.value
    }
    // console.log('length:', length)
    lengthRange.value = length
    lengthInput.value = length
    const text = textInput.value
    // console.log('text:', text)
    const result = processText(text, length)
    textOutput.value = result
    // await writeText(result)
    document.getElementById('charsCount').textContent = result.length.toString()
    document.getElementById('wordsCount').textContent = result
        .split(/\s+/)
        .filter((i) => i)
        .length.toString()
    document.getElementById('linesCount').textContent = result
        .split(/\r\n?|\n/g)
        .filter((i) => i)
        .length.toString()
}

async function copyBtn(event) {
    console.log('copyBtn:', event)
    await writeText(textOutput.value)
}

async function clearBtn(event) {
    console.log('clearBtn:', event)
    textInput.value = ''
    await processForm(event)
}

async function closeBtn(event) {
    console.log('closeBtn:', event)
    window.close()
}

function toggleReadOnly(event) {
    console.log('toggleReadOnly:', event)
    if (event.target.checked) {
        textOutput.setAttribute('readonly', 'readonly')
    } else {
        textOutput.removeAttribute('readonly')
    }
}

/**
 * Add Length Submit
 * @function addLength
 * @param {SubmitEvent} event
 */
async function addLength(event) {
    console.log('addLength:', event)
    event.preventDefault()
    const element = document.querySelector('#length-form input')
    const length = element.value.replace(/^0+/, '')
    console.log('length:', length)
    if (parseInt(length) && parseInt(length) > 0) {
        const { options } = await chrome.storage.sync.get(['options'])
        if (!options.textLengths.includes(length)) {
            options.textLengths.push(length)
            options.textLengths.sort(function (a, b) {
                return a - b
            })
            console.log('options.textLengths:', options.textLengths)
            await chrome.storage.sync.set({ options })
            updateTable(options.textLengths)
            updateLengthsDropdown(options.textLengths)
            showToast(`Added Length: ${length}`, 'success')
        } else {
            showToast(`Length Exists: ${length}`, 'warning')
        }
    } else {
        showToast(`Invalid Length: ${length}`, 'warning')
    }
    element.value = ''
    element.focus()
}

function updateLengthsDropdown(lengths) {
    document.getElementById('lengths-ul').innerHTML = ''
    if (lengths?.length) {
        lengths.forEach(function (value, i) {
            createLink(i.toString(), value)
        })
    }
}

/**
 * Create Link Element
 * @function createLink
 * @param {String} number
 * @param {String} value
 */
function createLink(number, value = '') {
    const ul = document.getElementById('lengths-ul')
    const li = document.createElement('li')
    ul.appendChild(li)
    const a = document.createElement('a')
    a.textContent = value
    a.dataset.pattern = value
    a.classList.add('dropdown-item', 'small')
    a.setAttribute('role', 'button')
    a.addEventListener('click', processForm)
    li.appendChild(a)
}

/**
 * Update Lengths Table with Data
 * @function updateTable
 * @param {Object} data
 */
function updateTable(data) {
    const tbody = document.querySelector('#lengths-table tbody')
    tbody.innerHTML = ''

    data.forEach(function (value) {
        const row = tbody.insertRow()

        const button = document.createElement('a')
        const svg = document.getElementById('bi-trash3').cloneNode(true)
        svg.removeAttribute('id')
        button.appendChild(svg)
        button.title = 'Delete'
        button.dataset.value = value
        button.classList.add('link-danger')
        button.setAttribute('role', 'button')
        button.addEventListener('click', deleteLength)
        const cell1 = row.insertCell()
        cell1.classList.add('text-center')
        cell1.appendChild(button)

        const link = document.createElement('a')
        link.dataset.clipboardText = value
        link.text = value
        link.title = value
        link.classList.add(
            'clip',
            'link-body-emphasis',
            'link-underline',
            'link-underline-opacity-0'
        )
        link.setAttribute('role', 'button')
        const cell2 = row.insertCell()
        cell2.appendChild(link)
    })
}

/**
 * Delete Length
 * @function deleteLength
 * @param {MouseEvent} event
 */
async function deleteLength(event) {
    console.log('deleteLength:', event)
    event.preventDefault()
    const anchor = event.target.closest('a')
    const length = anchor?.dataset?.value
    console.log('length:', length)
    const { options } = await chrome.storage.sync.get(['options'])
    // console.log('options.textLengths:', options.textLengths)
    if (length && options.textLengths.includes(length)) {
        const index = options.textLengths.indexOf(length)
        console.log('index:', index)
        if (index !== undefined) {
            options.textLengths.splice(index, 1)
            await chrome.storage.sync.set({ options })
            console.log('options.textLengths:', options.textLengths)
            updateTable(options.textLengths)
            document.getElementById('add-length').focus()
            showToast(`Removed Length: ${length}`, 'warning')
        }
    }
    updateLengthsDropdown(options.textLengths)
}

async function writeText(text) {
    try {
        await navigator.clipboard.writeText(text)
        showToast('Text Copied.', 'success')
    } catch (error) {
        console.log(error)
        showToast('Clipboard Write Failed!', 'danger')
    }
}

/**
 * Show Bootstrap Toast
 * @function showToast
 * @param {String} message
 * @param {String} bsClass
 */
function showToast(message, bsClass = 'success') {
    const element = document.getElementById('toast').cloneNode(true)
    element.classList.add(`text-bg-${bsClass}`)
    element.querySelector('.toast-body').innerText = message
    element.removeAttribute('id')
    document.getElementById('toast-container').appendChild(element)
    const toast = new bootstrap.Toast(element)
    toast.show()
}
