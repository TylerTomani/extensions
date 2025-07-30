import { nxtBtn, backBtn, mainScript } from "./load-textarea-code.js";

const copyCodes = document.querySelectorAll('.copy-code');

function copyTextToClipboard(text) {
    return navigator.clipboard.writeText(text).catch(err => {
        console.error("Unable to copy text to clipboard:", err);
    });
}

function animate(element) {
    element.classList.remove('decopied', 'copied'); // reset fast
    element.classList.add('copied');
    setTimeout(() => {
        element.classList.remove('copied');
        element.classList.add('decopied');
    }, 250);
}

function handleCopy(el, animateCode = true) {
    const textToCopy = el.value || el.innerText || "";
    copyTextToClipboard(textToCopy);
    if (animateCode) {
        animate(el);
    }
}

// ✅ Command + C on any `.copy-code`
copyCodes.forEach(el => {
    el.addEventListener('keydown', e => {
        if (e.metaKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            handleCopy(el, true); // Animate the element itself
        }
    });
});

// ✅ Support for `mainScript`, `nxtBtn`, and `backBtn`
function setupCopyShortcut(element) {
    element.addEventListener('keydown', e => {
        if (e.metaKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();

            // Always animate if it's mainScript
            if (e.target === mainScript) {
                handleCopy(mainScript, true);
            }

            // Only copy/animate mainScript if it has .copy-code
            else if ((e.target === nxtBtn || e.target === backBtn) && mainScript.classList.contains('copy-code')) {
                handleCopy(mainScript, true);
            }
        }
    });

    // Click behavior
    if (element === mainScript) {
        element.addEventListener('click', () => {
            handleCopy(mainScript, true);
        });
    }
}

// Setup shortcuts
setupCopyShortcut(mainScript);
setupCopyShortcut(nxtBtn);
setupCopyShortcut(backBtn);
