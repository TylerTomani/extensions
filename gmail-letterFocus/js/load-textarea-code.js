export const nxtBtn = document.querySelector('#nxtBtn')
const mainScript = document.querySelector('#mainScript')
const versionTitle = document.querySelector('#versionTitle')

const mainScriptJsFile = 'main-script.js'
const draftScriptJsFile = 'versions/draft-script.js'
const workingScript = 'versions/working-script.js'
const filesArr = [mainScriptJsFile,draftScriptJsFile,workingScript]
// Change this for default script on home
let iFile = 0
let filePath = filesArr[iFile]

loadTextAreaCode(mainScriptJsFile)
nxtBtn.addEventListener('click', e => {
    changeScript()   
})
nxtBtn.addEventListener('keydown', e => {
    let key = e.keyCode
    if(key === 13){
        changeScript()
    }
})
function changeScript(){
    
    let r = Math.floor(Math.random() * 50)
    let g = Math.floor(Math.random() * 50)
    let b = Math.floor(Math.random() * 50)
    loadTextAreaCode(filesArr[iFile])
    iFile = (iFile + 1) % filesArr.length
    // console.log(`rgb(${r},${g},${b},.5)`)
    // mainScript.style.background = `rgb(${r},${g},${b},.5)`
    // switchBackground(r,g,b)
    
}
function switchBackground(r,g,b){
    switch (iFile){
        case 0 :
            mainScriptJsFile.style.background = `rgb(5,35,47,.5)`
            break
        case 1 :
            mainScriptJsFile.style.background = `rgb(32,27,5,.5)`
            break
    }
}
function loadTextAreaCode(filePath){
    fetch(filePath)
    .then(response => response.text())
    .then(jsCode => {
        mainScript.innerHTML = jsCode
    })
    .catch(err =>{
        console.log('failed ot load code', err)
    })
}
