import { nxtBtn, backBtn, mainScript } from "./load-textarea-code-draft.js";
const copyCodes = document.querySelectorAll('.copy-code')
function copyTextToClipboard(text) {
    return navigator.clipboard.writeText(text).catch(err => {
        console.error("Unable to copy text to clipboard:", err);
    });
}

function animate(element) {
    element.classList.remove('decopied', 'copied'); // reset classes fast
    element.classList.add('copied');
    setTimeout(() => {
        element.classList.remove('copied');
        element.classList.add('decopied');
    }, 250);
}

copyCodes.forEach(el => {
    el.addEventListener('keydown', e => {
        if(e.key == 'c' && e.metaKey){
            e.stopPropagation()
            handleCopy(e.target)
            if(e.target.value){
                copyTextToClipboard(e.target.value)
            }
            if(e.target.innerText){
                copyTextToClipboard(e.target.innerText)
                
            }
        }
    })
})
function handleCopy(el) {
    const textToCopy = el.innerText
    // Always copy the text from mainScript if nxt btn or back
    if(el.id == 'nxtBtn' || el.id == 'backBtn' || el.id == 'mainScript'){
        copyTextToClipboard(mainScript.value);
        animate(mainScript);
    } else {
        copyTextToClipboard(textToCopy);
        animate(el);
    }
}

function setupCopyShortcut(element) {
    element.addEventListener('keydown', e => {
        // Check Command (metaKey) + C (case-insensitive)
        if (e.metaKey && e.key.toLowerCase() === 'c') {
            e.preventDefault(); // prevent default copy just to be safe
            handleCopy(e.target,true);
        }
    });

    // Optional: animate on click for code elements as you had
    element.addEventListener('click', e => {
        e.preventDefault()
        if(e.id == 'mainScript'){
            handleCopy(e.taget, false);
            return
        }
        // handleCopy(e.taget, true);
        
    });
}

// Setup for mainScript and both buttons
setupCopyShortcut(mainScript);
setupCopyShortcut(nxtBtn);
setupCopyShortcut(backBtn);
