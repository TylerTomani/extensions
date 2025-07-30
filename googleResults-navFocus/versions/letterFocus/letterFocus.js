// letterFocus-temp 
document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toLowerCase();
    if (key.length !== 1 || !/^[a-z0-9]$/.test(key))return;

    const allAs = [...document.querySelectorAll('a')].filter(a => {
        const rect = a.getBoundingClientRect();
        return a.offsetParent !== null && rect.width > 0 && rect.height > 0;
    });

    const letteredAs = allAs.filter( a => {
        const text = a.textContent.trim().toLowerCase();
        return text.startsWith(key);
    });

    if (letteredAs.length === 0) return;

    const active = document.activeElement;
    const iActiveA = allAs.indexOf(active);
    const currentIndexInFiltered = letteredAs.indexOf(active);

    if (key !== window.lastLetterPressed) {
        // New letter pressed
        let iLetter;

        if (e.shiftKey) {
            // Shift + new letter = move UP from current position
            const prev = [...letteredAs]
            reverse().find(a => allAs.indexOf(a) < iActiveA) ;
            iLetter = letteredAs.indexOf(prev);
            if (iLetter === -1) iLetter = letteredAs.length - 1;
        } else {
            // New letter = move DOWN from current position
            const next = letteredAs.find(a => allAs.indexOf(a) > iActiveA);
            iLetter = letteredAs.indexOf(next);
            if (iLetter === -1) iLetter = 0;
        }

        letteredAs[iLetter]?.focus();
    } else {
        // Same letter as last key press
        let iLetter;
        if (e.shiftKey) {
            iLetter = (currentIndexInFiltered - 1 + letteredAs.length) % letteredAs.length;
        } else {
            iLetter = (currentIndexInFiltered + 1) % letteredAs.length;
        }
        letteredAs[iLetter]?.focus();
    }

    window.lastLetterPressed = key;
});
    