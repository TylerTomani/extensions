// 1 - nav-to-questions
(() => {
    // 🆕 Bookmark storage
    const bookmarkedQuestions = new Set();
    let bookmarkIndex = 0;

    // 🆕 Add CSS for bookmarked outline
    const bookmarkStyle = document.createElement('style');
    bookmarkStyle.textContent = `
        .bookmarked-question {
            outline: 3px solid yellow !important;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(bookmarkStyle);

    // Original Script (trimmed here for brevity)
    // Place your entire original script content here

    // Replace this function definition block:
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        const isShift = e.shiftKey;

        // Existing shortcut handling ...
        // Your original full event handler content goes here

        // Add this at the end of your keydown listener:
        if (key === 'b') {
            e.preventDefault();

            if (!targets.length) updateTargets();
            let active = document.activeElement;
            if (!targets.includes(active) && lastFocusedTarget && targets.includes(lastFocusedTarget)) {
                active = lastFocusedTarget;
            }
            if (!active || !targets.includes(active)) return;

            const index = targets.indexOf(active);
            const article = getArticleForElement(active);

            if (!article) return;

            const key = article.dataset.testid;
            if (bookmarkedQuestions.has(key)) {
                bookmarkedQuestions.delete(key);
                article.classList.remove('bookmarked-question');
                showPopup(`🔖 Removed bookmark from question #${index + 1}`);
            } else {
                bookmarkedQuestions.add(key);
                article.classList.add('bookmarked-question');
                showPopup(`🔖 Bookmarked question #${index + 1}`);
            }
            return;
        }

        if (key === 'b' && isShift) {
            e.preventDefault();
            if (bookmarkedQuestions.size === 0) {
                showPopup('No bookmarked questions');
                return;
            }
            updateTargets();

            const bookmarkedEls = targets.filter(el => {
                const article = getArticleForElement(el);
                return article && bookmarkedQuestions.has(article.dataset.testid);
            });

            if (bookmarkedEls.length === 0) {
                showPopup('No valid bookmarked questions');
                return;
            }

            bookmarkIndex = (bookmarkIndex + 1) % bookmarkedEls.length;
            const el = bookmarkedEls[bookmarkIndex];
            const idx = targets.indexOf(el);

            scrollToTarget(idx);
            scrollStates.set(el, 0);
            lastFocusedTarget = el;
            updateLastNonFirstFocused(el);
            currentOffset = Math.floor(idx / 10) * 10;

            showPopup(`🔖 Jumped to bookmarked question #${idx + 1}`);
            showQuestionBanner(idx + 1);
            return;
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
