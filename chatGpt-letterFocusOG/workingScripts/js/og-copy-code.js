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
            if(e.target.value){
                copyTextToClipboard(e.target.value)

            }
            if(e.target.innerText){
                copyTextToClipboard(e.target.innerText)
                
            }
            animate(e.target)
            // copyTextToClipboard(e.target.innerText)
        }
    })
})
function handleCopy(el,animateCode) {
    // Always copy the text from mainScript regardless of source
    const textToCopy = mainScript.value || mainScript.innerText || "";
    copyTextToClipboard(textToCopy);
    if(!animateCode){
        return 
    }
    animate(mainScript);
}

function setupCopyShortcut(element) {
    element.addEventListener('keydown', e => {
        // Check Command (metaKey) + C (case-insensitive)
        if (e.metaKey && (e.key === 'c' || e.key === 'C')) {
            e.preventDefault(); // prevent default copy just to be safe
            handleCopy(e.target);
        }
    });

    // Optional: animate on click for code elements as you had
    element.addEventListener('click', e => {
        e.preventDefault()
        handleCopy(e.taget,false);
    });
}

// Setup for mainScript and both buttons
setupCopyShortcut(mainScript);
setupCopyShortcut(nxtBtn);
setupCopyShortcut(backBtn);
