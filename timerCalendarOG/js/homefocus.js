const homelink = document.getElementById('homelink')
const regexCmds = document.getElementById('regexCmds')
addEventListener('keydown',e  => {
    let letter = e.key.toLowerCase()
    if(letter == 'h'){
        homelink.focus()
    } 
    if(letter == 'r'){
        regexCmds.focus()
    } 
});