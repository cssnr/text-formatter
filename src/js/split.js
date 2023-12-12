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
document.getElementById('process').addEventListener('click', processForm)
document.getElementById('copy').addEventListener('click', copyBtn)
document.getElementById('clear').addEventListener('click', clearBtn)
document.getElementById('readOnly').addEventListener('change', toggleReadOnly)
document.getElementById('length-form').addEventListener('submit', addLength)

/**
 * Initialize Page
 * @function initPage
 */
async function initPage(event) {
    console.log('initPage')
    const { options } = await chrome.storage.sync.get(['options'])
    console.log('options:', options)

    lengthInput.value = options.textSplitLength
    lengthRange.value = options.textSplitLength
    lengthRange.min = options.textSliderMin
    lengthRange.max = options.textSliderMax

    const urlParams = new URLSearchParams(window.location.search)
    const text = urlParams.get('text')
    if (text) {
        console.log('urlParams text:', text)
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
    console.log('pasteBtn')
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
    // console.log('processForm', event)
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

async function copyBtn() {
    console.log('copyBtn')
    await writeText(textOutput.value)
}

async function clearBtn(event) {
    console.log('clearBtn')
    textInput.value = ''
    await processForm(event)
}

function toggleReadOnly(event) {
    if (event.target.checked) {
        console.log('readonly = true')
        textOutput.setAttribute('readonly', 'readonly')
    } else {
        console.log('removeAttribute readonly')
        textOutput.removeAttribute('readonly')
    }
}

/**
 * Add Length Submit
 * @function addLength
 * @param {SubmitEvent} event
 */
async function addLength(event) {
    // console.log('addFilter:', event)
    event.preventDefault()
    const element = document.querySelector('#length-form input')
    const filter = element.value
    if (filter) {
        console.log(`filter: ${filter}`)
        const { options } = await chrome.storage.sync.get(['options'])
        if (!options.textLengths.includes(filter)) {
            options.textLengths.push(filter)
            options.textLengths.sort()
            console.log('options.textLengths:', options.textLengths)
            await chrome.storage.sync.set({ options })
            updateTable(options.textLengths)
            updateLengthsDropdown(options.textLengths)
            showToast(`Added Length: ${filter}`, 'success')
        }
    }
    element.value = ''
    element.focus()
}

function updateLengthsDropdown(lengths) {
    if (lengths?.length) {
        document.getElementById('filters-ul').innerHTML = ''
        lengths.forEach(function (value, i) {
            createFilterLink(i.toString(), value)
        })
    }
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
    a.addEventListener('click', processForm)
    li.appendChild(a)
}

/**
 * Update Filters Table with Data
 * @function updateTable
 * @param {Object} data
 */
function updateTable(data) {
    const tbody = document.querySelector('#filters-table tbody')
    tbody.innerHTML = ''

    data.forEach(function (value) {
        const row = tbody.insertRow()

        const deleteBtn = document.createElement('a')
        const svg = document.querySelector('.bi-trash3').cloneNode(true)
        deleteBtn.appendChild(svg)
        deleteBtn.title = 'Delete'
        deleteBtn.dataset.value = value
        deleteBtn.classList.add('link-danger')
        deleteBtn.setAttribute('role', 'button')
        deleteBtn.addEventListener('click', deleteHost)
        const cell1 = row.insertCell()
        cell1.classList.add('text-center')
        cell1.appendChild(deleteBtn)

        const filterLink = document.createElement('a')
        filterLink.dataset.clipboardText = value
        filterLink.text = value
        filterLink.title = value
        filterLink.classList.add(
            'clip',
            'link-body-emphasis',
            'link-underline',
            'link-underline-opacity-0'
        )
        filterLink.setAttribute('role', 'button')
        const cell2 = row.insertCell()
        cell2.appendChild(filterLink)
    })
}

/**
 * Delete Host
 * @function deleteHost
 * @param {MouseEvent} event
 */
async function deleteHost(event) {
    // console.log('deleteHost:', event)
    event.preventDefault()
    const anchor = event.target.closest('a')
    const filter = anchor?.dataset?.value
    console.log(`filter: ${filter}`)
    const { options } = await chrome.storage.sync.get(['options'])
    // console.log('options.textLengths:', options.textLengths)
    if (filter && options.textLengths.includes(filter)) {
        const index = options.textLengths.indexOf(filter)
        console.log(`index: ${index}`)
        if (index !== undefined) {
            options.textLengths.splice(index, 1)
            await chrome.storage.sync.set({ options })
            console.log('options.textLengths:', options.textLengths)
            updateTable(options.textLengths)
            document.getElementById('add-length').focus()
            showToast(`Removed Length: ${filter}`, 'warning')
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
