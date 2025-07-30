const questionTxt = document.querySelector('.drop-question')
const homelink = document.querySelector('#homelink')
const endToTopBtn = document.querySelector('#endToTopBtn')
 const top = document.querySelector('#top')
/* I will figure out how to focus with number to questions in different page that will require unknown 
 amount of questions / drop-questions, probably in myChatgpt project */

 
// const answerTxtsChildren = document.querySelectorAll('.answer-txt *')
// let answerTxtFocused = false
// answerTxtsChildren.forEach(el => {
//     el.addEventListener('focus', e => {
//         // answerTxtFocused = true
//         console.log('in')
//     })
//     el.addEventListener('focusout', e => {
//         // answerTxtFocused = false
//         console.log('out')
//     })
// })

document.addEventListener('keydown', e => {
    let letter = e.key.toLowerCase()
    if(letter == 'h'){
        e.preventDefault()
        homelink.focus()
    }
    if(letter == 'm'){
        e.preventDefault()
        if(!questionTxt.hasAttribute('tabindex')){
            questionTxt.setAttribute('tabindex','0')
        }
        questionTxt.focus()
    }
    if(letter == 'e'){
        // e.preventDefault()
        console.log(endToTopBtn)
        if (!endToTopBtn.hasAttribute('tabindex')) {
             endToTopBtn.setAttribute('tabindex', '0')
        }
        endToTopBtn.focus()
    }
})
top.addEventListener('keydown', e => {
    let letter = e.key.toLowerCase()
    if(letter == 'enter'){scrollTo(0,200)}
    
})
endToTopBtn.addEventListener('keydown', e => {
    let letter = e.key.toLowerCase()
    if(letter == 'enter'){
        top.focus()      
    }
})