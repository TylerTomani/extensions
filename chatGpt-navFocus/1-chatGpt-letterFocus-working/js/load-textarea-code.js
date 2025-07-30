// Script Manager with Input Selection and Persistence
// File list
const workingScriptInputNum = document.querySelector('#workingScriptInputNum')
const newVersion = 'versions/new.js'
const workingVersion = 'versions/working-version.js'
const draft = 'versions/draft.js'
const draftWorking = 'versions/draft-working.js'


const filesArr = [workingVersion, draft, draftWorking, newVersion]

// DOM elements
export const nxtBtn = document.querySelector('#nxtBtn')
export const backBtn = document.querySelector('#backBtn')
const body = document.querySelector('body')
export const mainScript = document.querySelector('#mainScript')
const versionTitle = document.querySelector('#versionTitle')
const pageHeader = document.querySelector('#pageHeader')
// export const defaultScriptInputBox = document.querySelector('#defaultScriptInputBox')

// Load saved index or default to 1
let iFile = 0
let filePath = filesArr[iFile]
// let defaultScriptIndex
// DOM Ready
addEventListener('DOMContentLoaded', () => {
    // Load the script at index
    if (workingScriptInputNum){
        loadTextAreaCode(filesArr[0])
        return
    }
    loadTextAreaCode(filesArr[iFile])
    changeBackground()

    // Setup the input box
    
})

// Button click/keydown for next/back
nxtBtn.addEventListener('click', e => {
    e.preventDefault()
    changeScript(0)
})
nxtBtn.addEventListener('keydown', e => {
    if (e.keyCode === 13) {
        scrollTo(0, 0)
        changeScript(0)
    }
})
backBtn.addEventListener('click', e => {
    e.preventDefault()
    changeScript(1)
})
backBtn.addEventListener('keydown', e => {
    if (e.keyCode === 13) {
        scrollTo(0, 0)
        changeScript(1)
    }
})

// Script navigation
function changeScript(reverse) {
    if (!reverse) {
        iFile = (iFile + 1) % filesArr.length
    } else {
        iFile = (iFile - 1 + filesArr.length) % filesArr.length
    }

    
    loadTextAreaCode(filesArr[iFile])
    changeBackground()
    
}

// Color background based on current file
function changeBackground() {
    if (iFile === 0) {
        mainScript.style.background = 'rgb(3,100,22,.45)'
    } else if (iFile === 1) {
        mainScript.style.background = 'lightgrey'
    } else if (iFile === 2) {
        mainScript.style.background = 'rgb(14,42,47,.35)'
    } else {
        mainScript.style.background = 'rgb(3,98,22,.25)'
    }
}

// Load script into textarea
function loadTextAreaCode(filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(jsCode => {
            mainScript.value = jsCode

            const firstLine = jsCode.split('\n').find(line => line.trim().length > 0)?.trim()
            const displayLine = firstLine?.startsWith('//') ? firstLine.replace(/^\/\/\s*/, '') : firstLine
            if (displayLine) {
                versionTitle.innerText = displayLine
            }
        })
        .catch(err => {
            console.log('failed to load code', err)
        });
}
