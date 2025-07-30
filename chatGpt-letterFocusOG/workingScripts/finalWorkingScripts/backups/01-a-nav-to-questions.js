// step-focus-working
// draft
(() => {
    const style = document.createElement('style');
    style.textContent = `
    .whitespace-pre-wrap:focus {
        outline: none !important;
        scroll-margin-bottom: 100px; /* ✅ Key fix: adds breathing room at bottom */
    }
  `;
    document.head.appendChild(style);
    let scrollCycleOrder = ['start', 'center', 'end'];
    let navMode = false;
    let targets = [];
    let lastKeyPressed = null;
    let currentOffset = 0;
    let lastFocusedTarget = null;

    const prompt = document.getElementById('prompt-textarea');
    if (prompt) {
        prompt.addEventListener('focus', () => {
            if (navMode) {
                navMode = false;
                showPopup('Navigation mode OFF');
                questionBanner.style.opacity = 0;
            }
        });
    }

    let lastNonFirstFocused = null;
    let sToggleOnFirst = false;

    const reservedShortcuts = new Set([
        'c', 'i', 'j', 'k', 'r', 'w', 't', 'n', 'p', 's', 'f', 'd', 'l', 'm'
    ]);

    const getTargets = () =>
        Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"] .whitespace-pre-wrap')).filter(Boolean);

    function updateTargets() {
        targets = getTargets();
        targets.forEach(t => t.setAttribute('tabindex', '-1'));
    }

    let previousScrollY = null; // 🆕 Store scroll Y before navMode exits

    function toggleNavMode() {
        const prompt = document.getElementById('prompt-textarea');

        if (navMode) {
            // 🆕 Save current scroll position before exiting navMode
            previousScrollY = window.scrollY;

            navMode = false;
            showPopup('Navigation mode OFF');
            questionBanner.style.opacity = 0;

            if (prompt) {
                // 🆕 Use requestAnimationFrame to restore scroll after focus
                requestAnimationFrame(() => {
                    prompt.focus();
                    requestAnimationFrame(() => {
                        if (previousScrollY !== null) {
                            window.scrollTo({ top: previousScrollY, behavior: 'instant' });
                        }
                    });
                });
            }
        } else {
            navMode = true;
            updateTargets();
            if (targets.length) {
                const lastIndex = (lastFocusedTarget && targets.includes(lastFocusedTarget))
                    ? targets.indexOf(lastFocusedTarget)
                    : targets.length - 1;

                const focusIndex = targets.length === 1 ? 0 : lastIndex;

                // 🆕 Do NOT scroll when re-entering navMode — just focus
                const el = targets[focusIndex];
                el.focus();
                outlineFocus(el);
                scrollStates.set(el, 1);
                lastFocusedTarget = el;
                currentOffset = Math.floor(focusIndex / 10) * 10;
                showQuestionBanner(focusIndex + 1);

                if (focusIndex > 0) {
                    lastNonFirstFocused = el;
                    sToggleOnFirst = false;
                } else {
                    lastNonFirstFocused = null;
                    sToggleOnFirst = true;
                }
            }
            showPopup('Navigation mode ON');
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
        }, 500);
    }

    const scrollStates = new WeakMap();

    const questionBanner = document.createElement('div');
    function questionBannerAttributes() {
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
    }
    questionBannerAttributes();

    let questionBannerTimeout;
    function showQuestionBanner(number) {
        questionBanner.textContent = `Question #${number}`;
        questionBanner.style.opacity = 1;
        clearTimeout(questionBannerTimeout);
        questionBannerTimeout = setTimeout(() => {
            questionBanner.style.opacity = 0;
        }, 1500);
    }

    function showQuestionBannerForElement(el) {
        if (!el) {
            questionBanner.style.opacity = 0;
            return;
        }

        const article = getArticleForElement(el);
        if (!article) {
            questionBanner.style.opacity = 0;
            return;
        }

        const id = article.getAttribute('data-testid');
        const lastChar = id.slice(-1);
        const isEvenArticle = !isNaN(lastChar) && parseInt(lastChar) % 2 === 0;

        const allArticles = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]'));
        const index = allArticles.indexOf(article);

        if (isEvenArticle && index > 0) {
            const prevArticle = allArticles[index - 1];
            const prevQuestion = prevArticle.querySelector('.whitespace-pre-wrap');
            if (prevQuestion) {
                const questionIndex = targets.indexOf(prevQuestion);
                if (questionIndex !== -1) {
                    showQuestionBanner(questionIndex + 1);
                    return;
                }
            }
            questionBanner.style.opacity = 0;
        } else {
            const questionEl = article.querySelector('.whitespace-pre-wrap');
            if (!questionEl) {
                questionBanner.style.opacity = 0;
                return;
            }
            const questionIndex = targets.indexOf(questionEl);
            if (questionIndex === -1) {
                questionBanner.style.opacity = 0;
                return;
            }
            showQuestionBanner(questionIndex + 1);
        }
    }

    const observer = new MutationObserver((mutations) => {
        const hasNewTurns = mutations.some(m =>
            Array.from(m.addedNodes).some(n =>
                n.nodeType === 1 && n.querySelector?.('.whitespace-pre-wrap')
            )
        );
        if (hasNewTurns) {
            updateTargets();
        }
    });

    const chatContainer = document.querySelector('main');
    if (chatContainer) {
        observer.observe(chatContainer, { childList: true, subtree: true });
        updateTargets();
    } else {
        console.warn("Could not find chat container to observe.");
    }

    document.addEventListener('click', (e) => {
        const prompt = document.getElementById('prompt-textarea');
        if (prompt && prompt.contains(e.target)) {
            navMode = false;
            return;
        }
        if (!navMode) return;


        const el = e.target.closest('.whitespace-pre-wrap');
        if (el) {
            const index = targets.indexOf(el);
            if (index !== -1) {
                el.focus();
                currentOffset = Math.floor(index / 10) * 10;
                lastKeyPressed = null;
                lastFocusedTarget = el;

                updateLastNonFirstFocused(el);  // update last non-first question

                showPopup(`Selected question #${index + 1}`);
                const parent = el.closest('div.relative');
                if (parent) {
                    el.style.outline = 'none';
                    parent.style.outline = '3px solid #00ffff';
                    parent.style.outlineOffset = '2px';
                    setTimeout(() => { parent.style.outline = ''; }, 1500);
                }
                showQuestionBannerForElement(el);
            }
            return;
        }

        const preEl = e.target.closest('pre');
        if (preEl) {
            preEl.focus();
            lastFocusedTarget = null;
            lastKeyPressed = null;
            showPopup('Focused code block');
            questionBanner.style.opacity = 0;
            return;
        }
    });



    function getArticleForElement(el) {
        return el?.closest('article[data-testid^="conversation-turn-"]') ?? null;
    }

    function outlineFocus(el) {
        if (!el) return;
        const parent = el.closest('div.relative');
        if (!parent) return;
        parent.style.outline = '3px solid #00ffff';
        parent.style.outlineOffset = '2px';
        setTimeout(() => { parent.style.outline = ''; }, 1500);
    }

    // Update lastNonFirstFocused if el is NOT first question
    function updateLastNonFirstFocused(el) {
        const idx = targets.indexOf(el);
        if (idx > 0) {
            lastNonFirstFocused = el;
            sToggleOnFirst = false;
        }
    }
    function warnIfReservedShortcut(e) {
        const combo = [
            e.ctrlKey ? 'Ctrl' : '',
            e.metaKey ? 'Cmd' : '',
            e.shiftKey ? 'Shift' : '',
            e.altKey ? 'Alt' : '',
            e.key.length === 1 ? e.key.toUpperCase() : e.key
        ].filter(Boolean).join('+');

        const browserShortcuts = new Set([
            'Cmd+Shift+C', 'Cmd+Option+I', 'Cmd+Option+J', 'Cmd+R', 'Cmd+T', 'Cmd+W', 'Cmd+N',
            'Ctrl+Shift+C', 'Ctrl+Shift+I', 'Ctrl+Shift+J', 'Ctrl+R', 'Ctrl+T', 'Ctrl+W', 'Ctrl+N',
            'Cmd+F', 'Cmd+D', 'Cmd+P', 'Cmd+L', 'Cmd+M', 'Ctrl+F', 'Ctrl+D', 'Ctrl+P', 'Ctrl+L', 'Ctrl+M'
        ]);

        if (browserShortcuts.has(combo)) {
            console.warn(`⚠️ Interfering with browser shortcut: ${combo}`);
            showPopup(`⚠️ Overlapping with browser shortcut: ${combo}`);
        }
    }

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        const isShift = e.shiftKey;
        warnIfReservedShortcut(e)
        // Allow default browser shortcuts to pass through without interference

        // Always allow navMode toggle
        if (isCmdOrCtrl && isShift && key === 'x') {
            e.preventDefault();
            toggleNavMode();
            const prompt = document.getElementById('prompt-textarea');
            if (!navMode && prompt) prompt.focus();
            return;
        }

        // Disable all navMode key behavior while typing

        function isTypingInPrompt() {
            const prompt = document.getElementById('prompt-textarea');
            if (!prompt) return false;
            return prompt === document.activeElement || prompt.contains(document.activeElement);
        }

        // If typing in prompt textarea, do nothing special, let all keys pass through:
        if (isTypingInPrompt()) {
            // Also ensure navMode is off if it was still on (optional but recommended)
            if (navMode) {
                navMode = false;
                showPopup('Navigation mode OFF');
                questionBanner.style.opacity = 0;
            }
            return; // exit keydown handler early
        }

        // Now handle keys (including '?') only if NOT typing in prompt
        if (key === '?') {
            e.preventDefault();
            togglePopup?.();
        }
        if (!navMode) return;
        if (key === 'escape' && navMode) {
            e.preventDefault();
            toggleNavMode();
            return;
        }
        if (key === 'escape' && navMode) {
            e.preventDefault();
            toggleNavMode();
            return;
        }

        if (key === 'tab') return;

        if (isCmdOrCtrl && !isShift) {
            const allowedKeys = ['r', 't', 'w', 'n', 'p', 'f', 's', 'd', 'e', 'l', 'm'];
            if (allowedKeys.includes(key)) return;
        }

        if (isCmdOrCtrl && e.key === 'ArrowDown') {
            e.preventDefault();
            const articles = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]'));
            const lastArticle = articles.at(-1);
            if (lastArticle) {
                lastArticle.scrollIntoView({ behavior: 'instant', block: 'end' });
                showPopup('Scrolled to last response');
            }
            return;
        }

        if (isCmdOrCtrl && e.key === 'ArrowUp') {
            e.preventDefault();
            if (!targets.length) updateTargets();
            const firstIndex = 0;
            scrollToTarget(firstIndex);
            scrollStates.set(targets[firstIndex], 1);
            currentOffset = 0;
            lastFocusedTarget = targets[firstIndex];

            updateLastNonFirstFocused(targets[firstIndex]);

            showPopup('First question (via ⌘↑)');
            showQuestionBanner(firstIndex + 1);
            return;
        }

        if (key === 'e') {
            e.preventDefault();
            if (!targets.length) updateTargets();
            const lastIndex = targets.length - 1;
            if (lastIndex >= 0) {
                const el = targets[lastIndex];

                // Force scroll to 'start' (top) regardless of scrollStates
                el.focus();
                el.scrollIntoView({ behavior: 'instant', block: 'start' });
                outlineFocus(el);

                lastFocusedTarget = el;
                currentOffset = Math.floor(lastIndex / 10) * 10;

                updateLastNonFirstFocused(el);

                showPopup('Last question');
                showQuestionBanner(lastIndex + 1);
            }
            return;
        }


        if (key === 's') {
            e.preventDefault();
            if (!targets.length) updateTargets();

            if (!lastNonFirstFocused) {
                // No non-first question stored, go to first question
                scrollToTarget(0);
                scrollStates.set(targets[0], 1);
                currentOffset = 0;
                lastFocusedTarget = targets[0];
                showPopup('First question');
                showQuestionBanner(1);
                outlineFocus(targets[0]);
                sToggleOnFirst = true;
                return;
            }

            if (sToggleOnFirst) {
                // Currently on first question, go to lastNonFirstFocused
                lastNonFirstFocused.focus();
                currentOffset = targets.indexOf(lastNonFirstFocused);
                lastFocusedTarget = lastNonFirstFocused;
                showPopup(`Toggled to question #${currentOffset + 1}`);
                showQuestionBanner(currentOffset + 1);
                outlineFocus(lastNonFirstFocused);
                sToggleOnFirst = false;
            } else {
                // Currently on lastNonFirstFocused, go to first question
                scrollToTarget(0);
                scrollStates.set(targets[0], 1);
                currentOffset = 0;
                lastFocusedTarget = targets[0];
                showPopup('Toggled to first question');
                showQuestionBanner(1);
                outlineFocus(targets[0]);
                sToggleOnFirst = true;
            }
            return;
        }

        if (key === 'f' || key === 'd') {
            e.preventDefault();
            if (!targets.length) updateTargets();

            let currentIndex = targets.findIndex(el => el === document.activeElement);
            if (currentIndex === -1 && lastFocusedTarget && targets.includes(lastFocusedTarget)) {
                currentIndex = targets.indexOf(lastFocusedTarget);
            }

            const jump = e.shiftKey ? 10 : 1;
            let nextIndex = currentIndex + (key === 'f' ? jump : -jump);
            const total = targets.length;
            if (nextIndex >= total) nextIndex = 0;
            if (nextIndex < 0) nextIndex = total - 1;

            scrollToTarget(nextIndex);
            scrollStates.set(targets[nextIndex], 0);
            lastFocusedTarget = targets[nextIndex];

            updateLastNonFirstFocused(targets[nextIndex]);

            currentOffset = Math.floor(nextIndex / 10) * 10;
            lastKeyPressed = null;

            showPopup(`${key.toUpperCase()} moved to question #${nextIndex + 1}`);
            showQuestionBanner(nextIndex + 1);
            return;
        }

        const digitMatch = e.code.match(/^Digit([0-9])$/);
        if (digitMatch) {
            e.preventDefault();
            e.stopPropagation();
            if (!targets.length) updateTargets();
            const total = targets.length;
            const digit = parseInt(digitMatch[1]);
            const positionInRange = digit === 0 ? 9 : digit - 1;

            if (e.shiftKey) {
                if (lastKeyPressed === digit) {
                    currentOffset -= 10;
                    if (currentOffset < 0) {
                        const maxOffset = Math.floor((total - 1 - positionInRange) / 10) * 10;
                        currentOffset = Math.max(0, maxOffset);
                    }
                } else {
                    const activeIndex = targets.indexOf(document.activeElement);
                    currentOffset = activeIndex !== -1
                        ? Math.floor(activeIndex / 10) * 10
                        : Math.floor((targets.length - 1) / 10) * 10;
                }
                lastKeyPressed = digit;
            } else if (lastKeyPressed === digit) {
                currentOffset += 10;
                if (currentOffset + positionInRange >= total) {
                    currentOffset = 0;
                }
            } else {
                lastKeyPressed = digit;
            }

            let finalIndex = currentOffset + positionInRange;
            if (finalIndex >= total) finalIndex = total - 1;

            // <-- Fixed scroll state preservation here -->
            const targetEl = targets[finalIndex];
            const existingState = scrollStates.get(targetEl);
            scrollStates.set(targetEl, existingState ?? 0); // Preserve existing scroll state or default to start (0)

            scrollToTarget(finalIndex);
            lastFocusedTarget = targetEl;

            updateLastNonFirstFocused(targetEl);

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
                const currentScroll = scrollCycleOrder[currentState]; // 'start', 'center', or 'end'

                if (e.shiftKey) {
                    let nextState;

                    // 🧠 If currently centered, go to bottom FIRST
                    if (currentScroll === 'center') {
                        nextState = scrollCycleOrder.indexOf('end');
                    } else {
                        // After that, toggle between top (start) and bottom (end)
                        nextState = currentScroll === 'start'
                            ? scrollCycleOrder.indexOf('end')
                            : scrollCycleOrder.indexOf('start');
                    }

                    const scrollBlock = scrollCycleOrder[nextState];
                    active.scrollIntoView({ behavior: 'instant', block: scrollBlock });
                    scrollStates.set(active, nextState);
                    outlineFocus(active);
                    showPopup(scrollBlock === 'start' ? 'top' : 'bottom');

                } else {
                    // Regular Enter → Cycle forward normally: start → center → end → start...
                    const nextState = (currentState + 1) % scrollCycleOrder.length;
                    const scrollBlock = scrollCycleOrder[nextState];

                    active.scrollIntoView({ behavior: 'smooth', block: scrollBlock });
                    scrollStates.set(active, nextState);
                    outlineFocus(active);

                    if (scrollBlock === 'end') showPopup('bottom');
                    else if (scrollBlock === 'start') showPopup('top');
                    else showPopup('center');
                }
            }
        }





        if (/^[a-z0-9]$/i.test(key)) {
            const active = document.activeElement;
            if (active && active.classList.contains('whitespace-pre-wrap')) {
                e.preventDefault();
            }
        }
    }, true);

    function scrollToTarget(index) {
        const el = targets[index];
        if (!el) return;

        targets.forEach(target => {
            target.style.outline = 'none';
            const parent = target.closest('div.relative');
            if (parent) parent.style.outline = '';
        });

        outlineFocus(el);

        // If only one question, always scroll to 'start' (top)
        let scrollBlock = 'start';

        if (targets.length > 1) {
            const scrollIndex = scrollStates.get(el) ?? 0; // 0 = start
            scrollBlock = scrollCycleOrder[scrollIndex] || 'start';
        } else {
            // Clear any scroll state for this single question to keep consistent behavior
            scrollStates.set(el, 0);
        }

        el.focus();
        el.scrollIntoView({ behavior: 'instant', block: scrollBlock });

        // 🧠 Optional tweak for extra space when scrolling to 'end'
        if (scrollBlock === 'end') {
            setTimeout(() => {
                window.scrollBy(0, 150); // push it slightly further down if needed
            }, 50);
        }
    }



})();
