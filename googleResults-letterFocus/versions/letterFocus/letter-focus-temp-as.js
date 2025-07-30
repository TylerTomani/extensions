// letterFocus-temp 
document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toLowerCase();
    if (key.length !== 1 || !/^[a-z0-9]$/.test(key)) return;

    const allAs = [...document.querySelectorAll('a')].filter(a => {
        const rect = a.getBoundingClientRect();
        return a.offsetParent !== null && rect.width > 0 && rect.height > 0;
    });

    const letteredAs = allAs.filter(a => {
        const text = a.textContent.trim().toLowerCase();
        return text.startsWith(key);
    });

    if (letteredAs.length === 0) return;

    const active = document.activeElement;
    const iActiveAll = allAs.indexOf(active);
    const iActiveLettered = letteredAs.indexOf(active);

    // === NEW LETTER PRESS ===
    if (key !== window.lastLetterPressed) {
        let target;
        if (e.shiftKey) {
            // Search UP for first match
            target = [...letteredAs].reverse().find(a => allAs.indexOf(a) < iActiveAll);
            if (!target) target = letteredAs[letteredAs.length - 1];
        } else {
            // Search DOWN for first match
            target = letteredAs.find(a => allAs.indexOf(a) > iActiveAll);
            if (!target) target = letteredAs[0];
        }
        target?.focus();
    }

    // === SAME LETTER PRESSED ===
    else {
        const aboveMatch = (() => {
            for (let i = 1; i <= 5; i++) {
                const index = iActiveAll - i;
                if (index < 0) break;
                const el = allAs[index];
                if (el && el.textContent.trim().toLowerCase().startsWith(key)) {
                    return { el, distance: i };
                }
            }
            return null;
        })();

        const belowMatch = (() => {
            for (let i = iActiveAll + 1; i < allAs.length; i++) {
                const el = allAs[i];
                if (el && el.textContent.trim().toLowerCase().startsWith(key)) {
                    return { el, distance: i - iActiveAll };
                }
            }
            return null;
        })();

        // Priority Rules
        let target;
        if (aboveMatch?.distance === 1) {
            target = aboveMatch.el;
        } else if (belowMatch) {
            target = belowMatch.el;
        } else if (aboveMatch) {
            target = aboveMatch.el;
        }

        if (target) {
            target.focus();
        }
    }

    window.lastLetterPressed = key;
});
