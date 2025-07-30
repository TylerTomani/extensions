import { nxtBtn } from "./load-textarea-code-draft.js"
import { backBtn } from "./load-textarea-code-draft.js"
const mainScript = document.querySelector('#mainScript')
// let elementImg = document.querySelector('#elementImg')
const homelink = document.querySelector('#homelink')
const backToTopBtn = document.querySelector('#backToTopBtn')
const textarea = document.querySelector('textarea')
const codeElementsContainer = document.querySelector('.code-elements-container')
const btmPageCopyCodes = document.querySelectorAll('.code-elements-container .copy-code')
const blackBoxesToggleImg = document.querySelectorAll('.black-click-img-box')
const xBtnPopup = document.getElementById('xBtnPopup')
let iCopyCodes = 0
let elsArr = [nxtBtn, backBtn, backToTopBtn]
let iEl = 0
let lastCopyCode = null

let focusedMainScript = false
let popup = false
textarea.addEventListener('focus', e => {
    e.target.scrollTop = 0;
});
textarea.addEventListener('keydown', e => {
    let key = e.key.toLowerCase()
    if (key === 'm') {
        scrollTo(0, 0)
    }
})
mainScript.addEventListener('focus', (e) => {
    focusedMainScript = true
})
mainScript.addEventListener('focusout', () => { focusedMainScript = false })
mainScript.addEventListener('keydown', e => { 
    let key = e.key.toLowerCase()
    if(e.shiftKey && key === 'b'){
        focusedMainScript = false
        backBtn.focus()
    }

})
addEventListener('keydown', e => {
    let key = e.key.toLowerCase()
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key == 'x') {
        focusedMainScript = false
        elsArr[iEl].focus()
        iEl = (iEl + 1) % elsArr.length
    }
    // I don't know what this line is doing 
    if (focusedMainScript && !e.shiftKey) {
        return
    }
    if (key === 'p' && e.shiftKey) {
        denlargeAllImgs()
        scrollTo(0, 0)
        togglePopup()
        
        if (!popup && lastCopyCode) {
            lastCopyCode.focus()
        } else if(!popup){
            btmPageCopyCodes[0].focus()
        }
    }

    focusKeyToEls(e,key)
    if (!isNaN(key)) {
        let intlet = parseInt(key)
        btmPageCopyCodes[intlet - 1]?.focus()
        let iCopyCodes = intlet - 1
    }
    // Handles copy-code focus in code-elements-container
    if (key === 'c') {
        if (e.metaKey) return;

        // Always sync index manually based on focused element
        const active = document.activeElement;
        btmPageCopyCodes.forEach((el, idx) => {
            if (el === active) {
                iCopyCodes = idx;
            }
        });
        if (e.shiftKey) {
            // code
            iCopyCodes = (iCopyCodes - 1 + btmPageCopyCodes.length) % btmPageCopyCodes.length;
        } else {
            iCopyCodes = (iCopyCodes + 1) % btmPageCopyCodes.length;
        }
        btmPageCopyCodes[iCopyCodes].focus();
        


    }
    if(e.metaKey && key === 'arrowup'){
        focusedMainScript = false 
        e.preventDefault()
        
    }

});
function focusKeyToEls(e,key) {
    if (key === 'm') {
        mainScript.focus()
        scrollTo(0, 0)
    }
    if (key === 'b') {
        e.preventDefault()
        backBtn.focus()
    }
    if (key === 'n') {
        e.preventDefault()
        nxtBtn.focus()
    }
    if (key === 'h') {
        if (!homelink.hasAttribute('tabindex')) {
            homelink.setAttribute('tabindex', '0')
        }
        console.log(homelink)
        homelink.focus()
    }
    if (key === 'e') {
        if (!backToTopBtn.hasAttribute('tabindex')) {
            backToTopBtn.setAttribute('tabindex', '0')
        }
        backToTopBtn.focus()
    }
    if (key === 't') {
        nxtBtn.focus()

    }
    if (key === 'i') {
        const index2 = document.querySelector('#index2')
        index2.focus()
    }
}


backToTopBtn.addEventListener('keydown', e => {
    let key = e.keyCode
    if (key === 13) {
        console.log(backToTopBtn)
        backToTopBtn.click()
    }
})
let elementImg; // define globally
btmPageCopyCodes.forEach((el, index,arr) => {
    el.addEventListener('focus', e => {
        iCopyCodes = index; // ✅ Sync the index
        lastCopyCode = arr[index]
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    elementImg = document.getElementById("elementImg"); // assign global
    let isImgVisible = false;
    elementImg.addEventListener('click', e => {
        e.preventDefault()
        elementImg.classList.toggle('enlarge')
        console.log('click') // ✅ should work now
    });
    document.querySelectorAll(".code-elements-container .copy-code").forEach((el) => {
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const newSrc = el.dataset.img;
                if (newSrc) {
                    elementImg.src = newSrc;
                }
                toggleImg(elementImg)
            }
        });

        el.addEventListener("focus", (e) => {
            e.preventDefault();
            const newSrc = el.dataset.img;
            if (newSrc) {
                elementImg.src = newSrc;
            }

            if (isImgVisible) {
                denlargeAllImgs();
                elementImg.classList.add('enlarge');
            }
        });
    });
});
function toggleImg(img) {img.classList.toggle('enlarge')}
// Add click-to-toggle once, not inside toggleImg()
if (elementImg) {
    elementImg.addEventListener('click', e => {
        e.preventDefault()
        elementImg.classList.toggle('enlarge')
        console.log('click')
    })
}
codeElementsContainer.addEventListener('focusin', e => { popup = true })
codeElementsContainer.addEventListener('focusout', e => {popup = false })

function denlargeAllImgs() {
    btmPageCopyCodes.forEach(el => {
        if (el.classList.contains('enlarge')){
            el.classList.remove('enlarge')
        }
    })
}
blackBoxesToggleImg.forEach(el => {
    el.addEventListener('click', e => {
        const codeContainer = el.closest('.code-container');
        const copyCode = codeContainer?.querySelector('.copy-code');

        if (copyCode) {
            const newSrc = copyCode.dataset.img;
            if (newSrc) {
                elementImg.src = newSrc;
            }
            toggleImg(elementImg);
            copyCode.focus(); // optional: for visual consistency
        }
    });
});
xBtnPopup.addEventListener('click', e =>{
    e.preventDefault()
    if (codeElementsContainer.classList.contains('popup')) {
        codeElementsContainer.classList.remove('popup')
    }
})
function togglePopup(){
    console.log(xBtnPopup)
    if(codeElementsContainer.classList.contains('popup')){
        codeElementsContainer.classList.remove('popup')
        xBtnPopup.classList.add('hide')
    } else {
        codeElementsContainer.classList.add('popup')
        xBtnPopup.classList.remove('hide')

    }
}