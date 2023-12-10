// JS for page.html

import { processText } from './export.js'

document.addEventListener('DOMContentLoaded', initPage)

document.getElementById('length').addEventListener('change', saveLength)
document.getElementById('paste').addEventListener('click', pasteBtn)
document.getElementById('process').addEventListener('click', processBtn)
document.getElementById('copy').addEventListener('click', copyBtn)
document.getElementById('undo').addEventListener('click', undoBtn)
document.getElementById('clear').addEventListener('click', clearBtn)

document.getElementById('length-form').addEventListener('submit', addLength)

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

    // if (options.textLengths?.length) {
    //     document.getElementById('no-filters').remove()
    //     options.textLengths.forEach(function (value, i) {
    //         createFilterLink(i.toString(), value)
    //     })
    // }
    updateLengthsDropdown(options.textLengths)
    updateTable(options.textLengths)
}

function updateLengthsDropdown(lengths) {
    if (lengths?.length) {
        document.getElementById('filters-ul').innerHTML = ''
        lengths.forEach(function (value, i) {
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
        }
    }
    element.value = ''
    element.focus()
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
        const svg = document.getElementById('bi-trash3').cloneNode(true)
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
    console.log('deleteHost:', event)
    event.preventDefault()
    const anchor = event.target.closest('a')
    const filter = anchor?.dataset?.value
    console.log(`filter: ${filter}`)
    const { options } = await chrome.storage.sync.get(['options'])
    // console.log('patterns:', patterns)
    if (filter && options.textLengths.includes(filter)) {
        const index = options.textLengths.indexOf(filter)
        console.log(`index: ${index}`)
        if (index !== undefined) {
            options.textLengths.splice(index, 1)
            await chrome.storage.sync.set({ options })
            console.log('options.textLengths:', options.textLengths)
            updateTable(options.textLengths)
            document.getElementById('add-length').focus()
        }
    }
    updateLengthsDropdown(options.textLengths)
}
