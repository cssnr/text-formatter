// JS for options.html

import { checkPerms, saveOptions, updateOptions } from './export.js'

document.addEventListener('DOMContentLoaded', initOptions)

chrome.storage.onChanged.addListener(onChanged)

document.getElementById('grant-perms').addEventListener('click', grantPermsBtn)

document.getElementById('length-form').addEventListener('submit', addLength)

document
    .querySelectorAll('#options-form input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .getElementById('options-form')
    .addEventListener('submit', (e) => e.preventDefault())

document.querySelectorAll('[data-href]').forEach((el) =>
    el.addEventListener('click', async (e) => {
        console.log('clicked')
        const url = chrome.runtime.getURL(e.target.dataset.href)
        await chrome.tabs.create({ active: true, url })
        window.close()
    })
)

/**
 * Initialize Options
 * @function initOptions
 */
async function initOptions() {
    console.log('initOptions')
    document.getElementById('version').textContent =
        chrome.runtime.getManifest().version

    await setShortcuts({
        mainKey: '_execute_action',
        openPage: 'open_page',
        showWindow: 'show_window',
    })

    const { options } = await chrome.storage.sync.get(['options'])
    console.log('options:', options)
    updateOptions(options)
    updateTable(options.textLengths)
    await checkPerms()
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    // console.log('onChanged:', changes, namespace)
    for (const [key, { newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options') {
            console.log('newValue:', newValue)
            updateOptions(newValue)
        }
    }
}

/**
 * Grant Permissions Button Click Callback
 * @function grantPermsBtn
 * @param {MouseEvent} event
 */
async function grantPermsBtn(event) {
    console.log('grantPermsBtn:', event)
    await chrome.permissions.request({
        origins: ['https://*/*', 'http://*/*'],
    })
    await checkPerms()
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
}

/**
 * Set Keyboard Shortcuts
 * @function setShortcuts
 * @param {Object} mapping { elementID: name }
 */
async function setShortcuts(mapping) {
    const commands = await chrome.commands.getAll()
    for (const [elementID, name] of Object.entries(mapping)) {
        // console.log(`${elementID}: ${name}`)
        const command = commands.find((x) => x.name === name)
        if (command?.shortcut) {
            console.log(`${elementID}: ${command.shortcut}`)
            const el = document.getElementById(elementID)
            if (el) {
                el.textContent = command.shortcut
            }
        }
    }
}
