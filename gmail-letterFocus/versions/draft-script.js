// draft - script
(() => {
    let navMode = false;
    let targets = [];
    let lastKeyPressed = null;
    let currentOffset = 0;

    const getTargets = () =>
        Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"] .whitespace-pre-wrap')).filter(Boolean);

    function updateTargets() {
        targets = getTargets();
        targets.forEach(t => t.setAttribute('tabindex', '-1'));
        console.log(`[NAV MODE] Updated targets: ${targets.length}`);
    }

    function scrollToTarget(index) {
        const el = targets[index];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus({ preventScroll: true });
            const originalOutline = el.style.outline;
            el.style.outline = '3px solid orange';
            setTimeout(() => (el.style.outline = originalOutline), 1500);
        }
    }

    function toggleNavMode() {
        navMode = !navMode;
        console.log(`[NAV MODE] ${navMode ? 'Activated' : 'Deactivated'}`);
        if (navMode) {
            updateTargets();
            if (targets.length) {
                const lastIndex = targets.length - 1;
                scrollToTarget(lastIndex);
                scrollStates.set(targets[lastIndex], 1);
                showQuestionBanner(lastIndex + 1);
            }
            showPopup('Navigation mode ON');
        } else {
            const prompt = document.getElementById('prompt-textarea');
            if (prompt) prompt.focus();
            showPopup('Navigation mode OFF');
        }
    }

    function showPopup(message) {
        let popup = document.getElementById('nav-help-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'nav-help-popup';
            popup.style.position = 'fixed';
            popup.style.bottom = '20px';
            popup.style.right = '20px';
            popup.style.padding = '10px 15px';
            popup.style.background = 'rgba(0,0,0,0.8)';
            popup.style.color = 'white';
            popup.style.borderRadius = '6px';
            popup.style.zIndex = 9999;
            popup.style.fontFamily = 'Arial, sans-serif';
            popup.style.fontSize = '14px';
            popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            document.body.appendChild(popup);
        }
        popup.textContent = message;
        clearTimeout(popup._timeout);
        popup.style.opacity = '1';
        popup._timeout = setTimeout(() => {
            popup.style.opacity = '0';
        }, 2000);
    }

    const scrollCycleOrder = ['start', 'center', 'end'];
    const scrollStates = new WeakMap();

    const questionBanner = document.createElement('div');
    questionBanner.style.position = 'fixed';
    questionBanner.style.top = '40px';
    questionBanner.style.right = '10px';
    questionBanner.style.background = '#444';
    questionBanner.style.color = 'white';
    questionBanner.style.padding = '5px 10px';
    questionBanner.style.borderRadius = '6px';
    questionBanner.style.fontSize = '13px';
    questionBanner.style.zIndex = 9999;
    questionBanner.style.opacity = 0;
    questionBanner.style.transition = 'opacity 0.2s ease';
    questionBanner.style.pointerEvents = 'none';
    document.body.appendChild(questionBanner);

    let questionBannerTimeout;
    function showQuestionBanner(number) {
        questionBanner.textContent = `Question #${number}`;
        questionBanner.style.opacity = 1;
        clearTimeout(questionBannerTimeout);
        questionBannerTimeout = setTimeout(() => {
            questionBanner.style.opacity = 0;
        }, 2000);
    }

    const observer = new MutationObserver((mutations) => {
        const hasNewTurns = mutations.some(m =>
            Array.from(m.addedNodes).some(n =>
                n.nodeType === 1 && n.querySelector?.('.whitespace-pre-wrap')
            )
        );
        if (hasNewTurns) updateTargets();
    });

    const chatContainer = document.querySelector('main');
    if (chatContainer) {
        observer.observe(chatContainer, { childList: true, subtree: true });
        updateTargets();
    } else {
        console.warn("Could not find chat container to observe.");
    }

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        if ((e.metaKey || e.ctrlKey) && e.shiftKey && key === 'x') {
            e.preventDefault();
            toggleNavMode();
            return;
        }

        if (key === '?') {
            e.preventDefault();
            togglePopup();
            return;
        }

        if (!navMode) return;
        if (key === 'tab') return;

        if (key === 'e') {
            e.preventDefault();
            if (!targets.length) updateTargets();
            const lastIndex = targets.length - 1;
            if (lastIndex >= 0) {
                scrollToTarget(lastIndex);
                scrollStates.set(targets[lastIndex], 1);
                showPopup('Last question');
                showQuestionBanner(lastIndex + 1);
            }
            return;
        }

        const digitMatch = e.code.match(/^Digit([0-9])$/);
        if (digitMatch) {
            const digit = parseInt(digitMatch[1]);
            e.preventDefault();
            e.stopPropagation();
            if (!targets.length) updateTargets();
            const total = targets.length;

            const positionInRange = digit === 0 ? 9 : digit - 1;

            if (e.shiftKey) {
                // SHIFT + digit: move back 10 items, cycling if needed
                currentOffset -= 10;
                if (currentOffset < 0) {
                    // cycle to last block that has the digit position
                    const maxOffset = Math.floor((total - 1 - positionInRange) / 10) * 10;
                    currentOffset = Math.max(0, maxOffset);
                }
                lastKeyPressed = digit; // keep last key for consistency
            } else if (lastKeyPressed === digit) {
                // same digit pressed again → move forward 10 items, cycling if needed
                currentOffset += 10;
                // Wrap around to start if beyond total
                if (currentOffset + positionInRange >= total) {
                    currentOffset = 0;
                }
            } else {
                // Different digit pressed → stay in current block, just move to that digit index
                // Calculate current block start:
                const blockStart = Math.floor(currentOffset / 10) * 10;
                currentOffset = blockStart;
                lastKeyPressed = digit;
            }

            let finalIndex = currentOffset + positionInRange;
            if (finalIndex >= total) {
                finalIndex = total - 1;
            }

            scrollToTarget(finalIndex);
            scrollStates.set(targets[finalIndex], 1);
            showPopup(`Jumped to question #${finalIndex + 1}`);
            showQuestionBanner(finalIndex + 1);
            return;
        }

        if (key === 'enter') {
            const active = document.activeElement;
            if (targets.includes(active)) {
                e.preventDefault();
                e.stopPropagation();
                const currentState = scrollStates.get(active) ?? 0;
                const nextState = (currentState + 1) % scrollCycleOrder.length;
                scrollStates.set(active, nextState);
                active.scrollIntoView({ behavior: 'smooth', block: scrollCycleOrder[nextState] });
            }
        }

        if (/^[a-z0-9]$/i.test(key)) {
            const active = document.activeElement;
            if (active && active.classList.contains('whitespace-pre-wrap')) e.preventDefault();
        }
    }, true);
})();

