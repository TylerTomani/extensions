// nav to question bookmarks
// draft
(() => {
    function getVisibleStopButton() {
        const stopBtn = document.querySelector('[data-testid="stop-button"]');
        if (stopBtn && stopBtn.offsetParent !== null) return stopBtn;
        return null;
    }

    console.log('✅ ChatGPT Navigator Extension Loaded');
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

    // Store bookmarked question elements here
    const bookmarked = new Set();

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

    function updateBookmarkVisual(el) {
        if (!el) return;
        const parent = el.closest('div.relative');
        if (!parent) return;

        if (bookmarked.has(el)) {
            parent.style.outline = '3px solid gold';
            parent.style.outlineOffset = '4px';
        } else {
            parent.style.outline = '';
        }
    }

    function outlineFocus(el) {
        if (!el) return;
        const parent = el.closest('div.relative');
        if (!parent) return;

        if (bookmarked.has(el)) {
            parent.style.outline = '3px solid gold';
            parent.style.outlineOffset = '4px';
        } else {
            parent.style.outline = '3px solid #00ffff';
            parent.style.outlineOffset = '2px';

            setTimeout(() => {
                if (!bookmarked.has(el)) {
                    parent.style.outline = '';
                }
            }, 1500);
        }
    }

    function updateTargets() {
        targets = getTargets();
        targets.forEach(t => {
            t.setAttribute('tabindex', '-1');
            updateBookmarkVisual(t);
        });
    }

    let previousScrollY = null; // Store scroll Y before navMode exits

    function toggleNavMode() {
        const prompt = document.getElementById('prompt-textarea');

        if (navMode) {
            previousScrollY = window.scrollY;

            navMode = false;
            showPopup('Navigation mode OFF');
            questionBanner.style.opacity = 0;

            if (prompt) {
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

                const el = targets[focusIndex];
                el.focus({ preventScroll: true });

                if (previousScrollY !== null) {
                    window.scrollTo({ top: previousScrollY, behavior: 'instant' });
                }

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
            el.focus();

            if (previousScrollY !== null) {
                window.scrollTo({ top: previousScrollY, behavior: 'instant' });
            }

            outlineFocus(el);
            lastFocusedTarget = el;
            currentOffset = Math.floor(targets.indexOf(el) / 10) * 10;
            showQuestionBanner(targets.indexOf(el) + 1);

            if (targets.indexOf(el) > 0) {
                lastNonFirstFocused = el;
                sToggleOnFirst = false;
            } else {
                lastNonFirstFocused = null;
                sToggleOnFirst = true;
            }
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

    // Cycle focus among bookmarked questions helper
    function cycleFocusAmong(arr) {
        if (arr.length === 0) {
            showPopup('No bookmarked questions');
            return;
        }

        let currentIndex = arr.indexOf(document.activeElement);
        if (currentIndex === -1) {
            currentIndex = bookmarked.has(lastFocusedTarget) ? arr.indexOf(lastFocusedTarget) : -1;
        }

        let nextIndex = (currentIndex + 1) % arr.length;
        const el = arr[nextIndex];

        el.focus({ preventScroll: true });
        scrollToTarget(targets.indexOf(el));
        lastFocusedTarget = el;
        showPopup(`Focused bookmarked question #${targets.indexOf(el) + 1}`);
        showQuestionBanner(targets.indexOf(el) + 1);
    }

    document.addEventListener('keydown', (e) => {

        const activeEl = document.activeElement;
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        const isShift = e.shiftKey;
        const key = e.key.toLowerCase();

        // ✅ Allow navMode toggle even inside input/prompt
        if (isCmdOrCtrl && isShift && key === 'x') {
            e.preventDefault();
            toggleNavMode();
            const prompt = document.getElementById('prompt-textarea');
            if (!navMode && prompt) prompt.focus();
            return;
        }

        // 🛑 Now ignore other keys while typing
        if (activeEl && (activeEl.isContentEditable || activeEl.tagName === 'TEXTAREA' || activeEl.id === 'prompt-textarea')) {
            return;
        }

        // Disable all navMode key behavior while typing

        // Now handle keys (including '?') only if NOT typing in prompt
        if (key === '?') {
            e.preventDefault();
            togglePopup?.();
        }
        if (!navMode) return;
        if (key === 'tab') return;
        if (isCmdOrCtrl && !isShift) {
            const allowedKeys = ['r', 't', 'w', 'n', 'p', 'f', 's', 'd', 'e', 'l', 'm'];
            if (allowedKeys.includes(key)) return;
        }

        // Bookmark toggle with Cmd/Ctrl + Shift + B
        if (key === 'b' && isCmdOrCtrl && isShift) {
            e.preventDefault();
            const active = document.activeElement;
            if (targets.includes(active)) {
                if (bookmarked.has(active)) {
                    bookmarked.delete(active);
                    updateBookmarkVisual(active);
                    showPopup(`Removed bookmark from question #${targets.indexOf(active) + 1}`);
                } else {
                    bookmarked.add(active);
                    updateBookmarkVisual(active);
                    showPopup(`Bookmarked question #${targets.indexOf(active) + 1}`);
                }
            }
            return;
        }


        // Previous bookmarked with Shift + B
        // Previous bookmarked with Shift + B
        if (key === 'b' && isShift && !isCmdOrCtrl) {
            e.preventDefault();
            const bookmarkedArr = targets.filter(el => bookmarked.has(el));
            let currentIndex = bookmarkedArr.indexOf(document.activeElement);
            if (currentIndex === -1 && bookmarked.has(lastFocusedTarget)) {
                currentIndex = bookmarkedArr.indexOf(lastFocusedTarget);
            }
            let prevIndex = (currentIndex - 1 + bookmarkedArr.length) % bookmarkedArr.length;
            const el = bookmarkedArr[prevIndex];
            if (el) {
                el.focus({ preventScroll: true });
                scrollToTarget(targets.indexOf(el));
                lastFocusedTarget = el;
                showPopup(`Focused bookmarked question #${targets.indexOf(el) + 1}`);
                showQuestionBanner(targets.indexOf(el) + 1);
            }
            return;
        }

        // Next bookmarked with plain 'b'
        if (key === 'b' && !isCmdOrCtrl && !isShift) {
            e.preventDefault();
            const bookmarkedArr = targets.filter(el => bookmarked.has(el));
            cycleFocusAmong(bookmarkedArr); // already implemented above
            return;
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

                el.focus({ preventScroll: true });

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
                const idx = targets.indexOf(lastNonFirstFocused);
                if (idx !== -1) {
                    scrollToTarget(idx);
                    currentOffset = idx;
                    lastFocusedTarget = lastNonFirstFocused;
                    showPopup(`Toggled to question #${idx + 1}`);
                    showQuestionBanner(idx + 1);
                    sToggleOnFirst = false;
                }
            } else {
                scrollToTarget(0);
                currentOffset = 0;
                lastFocusedTarget = targets[0];
                showPopup('Toggled to first question');
                showQuestionBanner(1);
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
            let targetIdx;
            const digit = parseInt(digitMatch[1]);
            if (digit === 0) targetIdx = total - 1;
            else targetIdx = digit - 1;

            scrollToTarget(targetIdx);
            lastFocusedTarget = targets[targetIdx];
            currentOffset = Math.floor(targetIdx / 10) * 10;
            updateLastNonFirstFocused(targets[targetIdx]);

            showPopup(`Jumped to question #${targetIdx + 1}`);
            showQuestionBanner(targetIdx + 1);
            return;
        }
    }, true);

    function scrollToTarget(index) {
        if (index < 0 || index >= targets.length) return;
        const target = targets[index];
        if (!target) return;

        const offsetBehavior = 'instant';

        target.scrollIntoView({ behavior: offsetBehavior, block: 'center' });

        target.focus({ preventScroll: true });
        outlineFocus(target);
        lastFocusedTarget = target;
        showQuestionBanner(index + 1);
    }

    // Initialize the targets and attributes on page load
    updateTargets();

})();
