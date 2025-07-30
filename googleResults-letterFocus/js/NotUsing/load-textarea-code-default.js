// Script Manager with Input Selection and Persistence
// File list
const workingScriptInputNum = document.querySelector('#workingScriptInputNum')
const newVersion = 'versions/new.js'
const workingVersion = 'versions/working-version.js'
const draft = 'versions/draft.js'
const draft2 = 'versions/draft2.js'
const draftWorking = 'versions/draft-working.js'
const navToQuestionsBookmarkFinal = '../1b-navToQuestions-bookmarks.js'

const filesArr = [navToQuestionsBookmarkFinal, draft2, draftWorking, workingVersion, newVersion]

// DOM elements
export const nxtBtn = document.querySelector('#nxtBtn')
export const backBtn = document.querySelector('#backBtn')
const body = document.querySelector('body')
export const mainScript = document.querySelector('#mainScript')
const versionTitle = document.querySelector('#versionTitle')
const pageHeader = document.querySelector('#pageHeader')
export const defaultScriptInputBox = document.querySelector('#defaultScriptInputBox')

// Load saved index or default to 1
// let iFile = parseInt(localStorage.getItem('defaultScriptIndex')) || 1
let iFile =0
let filePath = filesArr[iFile]
let defaultScriptIndex
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
    if (defaultScriptInputBox) {
        defaultScriptInputBox.value = iFile
        defaultScriptInputBox.min = 0
        defaultScriptInputBox.max = filesArr.length - 1
        defaultScriptInputBox.step = 1

        // defaultScriptInputBox.addEventListener('change', () => {
        //     const newIndex = parseInt(defaultScriptInputBox.value)
        //     if (!isNaN(newIndex) && newIndex >= 0 && newIndex < filesArr.length) {
        //         iFile = newIndex
        //         localStorage.setItem('defaultScriptIndex', iFile)

        //         loadTextAreaCode(filesArr[iFile])
        //         changeBackground()
        //     } else {
        //         alert(`Please enter a number between 0 and ${filesArr.length - 1}`)
        //         defaultScriptInputBox.value = iFile
        //     }
        // })
    }
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

    localStorage.setItem('defaultScriptIndex', iFile)
    if (defaultScriptInputBox) defaultScriptInputBox.value = iFile
    loadTextAreaCode(filesArr[iFile])
    changeBackground()
    console.log(filesArr[iFile], iFile)
}

// Color background based on current file
function changeBackground() {
    if (iFile <= 1) {
        mainScript.style.background = 'rgb(3,100,22,.45)'
    } else if (iFile === 2) {
        mainScript.style.background = 'lightgrey'
    } else if (iFile >=3) {
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
