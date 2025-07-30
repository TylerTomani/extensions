// main - script - chatGpt-LetterFocus
// 🚀 BASELINE NAV SCRIPT — DO NOT TOUCH UNLESS MAKING INTENTIONAL CHANGES
// Last stable version: July 11, 2025
// practice draft script
(() => {
    let scrollCycleOrder = ['start', 'center', 'end'];
    let navMode = false;
    let targets = [];
    let lastKeyPressed = null;
    let currentOffset = 0;
    let lastFocusedTarget = null;

    // For the 'c' key: pre elements inside articles with even data-testid endings
    let evenPreElements = [];
    let currentPreIndex = -1;

    const getTargets = () =>
        Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"] .whitespace-pre-wrap')).filter(Boolean);

    function getEvenPreElements() {
        return Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]')).filter(article => {
            const id = article.getAttribute('data-testid');
            const lastChar = id.slice(-1);
            return !isNaN(lastChar) && parseInt(lastChar) % 2 === 0;
        }).flatMap(article => Array.from(article.querySelectorAll('pre')));
    }

    function updateTargets() {
        targets = getTargets();
        targets.forEach(t => t.setAttribute('tabindex', '-1'));
        //console.log(`[NAV MODE] Updated targets: ${targets.length}`);
    }

    function updateEvenPreElements() {
        evenPreElements = getEvenPreElements();
        evenPreElements.forEach(pre => pre.setAttribute('tabindex', '-1'));
        if (currentPreIndex >= evenPreElements.length) currentPreIndex = -1;
    }

    function toggleNavMode() {
        navMode = !navMode;
        //console.log(`[NAV MODE] ${navMode ? 'Activated' : 'Deactivated'}`);
        if (navMode) {
            updateTargets();
            updateEvenPreElements();
            if (targets.length) {
                if (lastFocusedTarget && targets.includes(lastFocusedTarget)) {
                    const lastIndex = targets.indexOf(lastFocusedTarget);
                    scrollToTarget(lastIndex);
                    scrollStates.set(lastFocusedTarget, 1);
                    currentOffset = Math.floor(lastIndex / 10) * 10;
                    showQuestionBanner(lastIndex + 1);
                } else {
                    const lastIndex = targets.length - 1;
                    scrollToTarget(lastIndex);
                    scrollStates.set(targets[lastIndex], 1);
                    currentOffset = Math.floor(lastIndex / 10) * 10;
                    showQuestionBanner(lastIndex + 1);
                }
            }
            showPopup('Navigation mode ON');
        } else {
            const prompt = document.getElementById('prompt-textarea');
            if (prompt) prompt.focus();
            showPopup('Navigation mode OFF');
            questionBanner.style.opacity = 0;
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

        // Determine question number logic:
        // If article's data-testid ends with even number, show previous article's question number
        // Else show this article's question number

        const id = article.getAttribute('data-testid');
        const lastChar = id.slice(-1);
        const isEvenArticle = !isNaN(lastChar) && parseInt(lastChar) % 2 === 0;

        // Find all articles ordered
        const allArticles = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]'));
        const index = allArticles.indexOf(article);

        if (isEvenArticle) {
            // Show previous article question number (if exists)
            if (index > 0) {
                const prevArticle = allArticles[index - 1];
                const prevQuestion = prevArticle.querySelector('.whitespace-pre-wrap');
                if (prevQuestion) {
                    const questionIndex = targets.indexOf(prevQuestion);
                    if (questionIndex !== -1) {
                        showQuestionBanner(questionIndex + 1);
                        return;
                    }
                }
            }
            // fallback: no previous question found
            questionBanner.style.opacity = 0;
        } else {
            // Show current article question number
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
            updateEvenPreElements();
        }
    });

    const chatContainer = document.querySelector('main');
    if (chatContainer) {
        observer.observe(chatContainer, { childList: true, subtree: true });
        updateTargets();
        updateEvenPreElements();
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

        // Click inside question
        const el = e.target.closest('.whitespace-pre-wrap');
        if (el) {
            const index = targets.indexOf(el);
            if (index !== -1) {
                el.focus();
                currentOffset = Math.floor(index / 10) * 10;
                lastKeyPressed = null;
                lastFocusedTarget = el;
                showPopup(`Selected question #${index + 1}`);
                const parent = el.closest('div.relative');
                if (parent) {
                    parent.style.outline = '3px solid #00ffff';
                    parent.style.outlineOffset = '2px';
                    setTimeout(() => { parent.style.outline = ''; }, 1500);
                }
                showQuestionBannerForElement(el);
            }
            return;
        }

        // Click inside a <pre>
        const preEl = e.target.closest('pre');
        if (preEl) {
            preEl.focus();
            lastFocusedTarget = null;
            lastKeyPressed = null;
            showPopup('Focused code block');
            questionBanner.style.opacity = 0; // no question number for code blocks
            return;
        }
    });

    const prompt = document.getElementById('prompt-textarea');
    if (prompt) {
        prompt.addEventListener('focus', () => {
            if (navMode) navMode = false;
        });
    }

    function getArticleForElement(el) {
        if (!el) return null;
        return el.closest('article[data-testid^="conversation-turn-"]');
    }

    // Outline focus helper
    function outlineFocus(el) {
        if (!el) return;
        const parent = el.closest('div.relative');
        if (!parent) return;
        parent.style.outline = '3px solid #00ffff';
        parent.style.outlineOffset = '2px';
        setTimeout(() => { parent.style.outline = ''; }, 1500);
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
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
            const allowedKeys = ['r', 't', 'w', 'n', 'p', 'f', 's', 'd', 'e', 'l', 'm'];
            if (allowedKeys.includes(key)) return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowDown') {
            e.preventDefault();
            const articles = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]'));
            const lastArticle = articles.at(-1);
            if (lastArticle) {
                lastArticle.scrollIntoView({ behavior: 'smooth', block: 'end' });
                showPopup('Scrolled to last response');
            } else {
                showPopup('No articles found to scroll to');
            }
            return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowUp') {
            e.preventDefault();
            if (!targets.length) updateTargets();
            const firstIndex = 0;
            scrollToTarget(firstIndex);
            scrollStates.set(targets[firstIndex], 1);
            currentOffset = 0;
            lastFocusedTarget = targets[firstIndex];
            showPopup('First question (via ⌘↑)');
            showQuestionBanner(firstIndex + 1);
            return;
        }
        if (key === 'e') {
            e.preventDefault();
            if (!targets.length) updateTargets();
            const lastIndex = targets.length - 1;
            if (lastIndex >= 0) {
                scrollToTarget(lastIndex);
                scrollStates.set(targets[lastIndex], 1);
                currentOffset = Math.floor(lastIndex / 10) * 10;
                lastFocusedTarget = targets[lastIndex];
                showPopup('Last question');
                showQuestionBanner(lastIndex + 1);
            }
            return;
        }
        if (key === 's') {
            e.preventDefault();
            if (!targets.length) updateTargets();

            const active = document.activeElement;
            const currentArticle = getArticleForElement(active);

            if (currentArticle) {
                const allArticles = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]'));
                const currentIndex = allArticles.indexOf(currentArticle);

                // If current article ends in even number, we want to focus the previous question and outline it
                const id = currentArticle.getAttribute('data-testid');
                const lastChar = id.slice(-1);
                const isEvenArticle = !isNaN(lastChar) && parseInt(lastChar) % 2 === 0;

                if (isEvenArticle && currentIndex > 0) {
                    const prevArticle = allArticles[currentIndex - 1];
                    const prevQuestion = prevArticle.querySelector('.whitespace-pre-wrap');
                    if (prevQuestion) {
                        prevQuestion.focus();
                        currentOffset = targets.indexOf(prevQuestion);
                        lastFocusedTarget = prevQuestion;
                        showPopup(`Focused previous question`);
                        showQuestionBanner(currentOffset + 1);
                        outlineFocus(prevQuestion);
                        return;
                    }
                } else if (currentIndex > 0) {
                    // Normal behavior: focus previous question whitespace-pre-wrap with outline
                    const prevArticle = allArticles[currentIndex - 1];
                    const prevQuestion = prevArticle.querySelector('.whitespace-pre-wrap');
                    if (prevQuestion) {
                        prevQuestion.focus();
                        currentOffset = targets.indexOf(prevQuestion);
                        lastFocusedTarget = prevQuestion;
                        showPopup(`Focused previous question`);
                        showQuestionBanner(currentOffset + 1);
                        outlineFocus(prevQuestion);
                        return;
                    }
                }
            }

            // fallback to first question
            scrollToTarget(0);
            scrollStates.set(targets[0], 1);
            currentOffset = 0;
            lastFocusedTarget = targets[0];
            showPopup('First question');
            showQuestionBanner(1);
            outlineFocus(targets[0]);
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
                    if (activeIndex !== -1 && activeIndex % 10 === positionInRange) {
                        currentOffset = Math.floor(activeIndex / 10) * 10;
                    } else {
                        currentOffset = Math.floor((targets.length - 1) / 10) * 10;
                    }
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

            scrollToTarget(finalIndex);
            scrollStates.set(targets[finalIndex], 0);
            lastFocusedTarget = targets[finalIndex];
            showPopup(`Jumped to question #${finalIndex + 1}`);
            showQuestionBanner(finalIndex + 1);
            return;
        }

        if (key === 'c') {
            e.preventDefault();
            if (!navMode) return;

            const active = document.activeElement;
            let currentArticle = getArticleForElement(active);

            let currentArticlePres = [];
            if (currentArticle) {
                currentArticlePres = Array.from(currentArticle.querySelectorAll('pre'));
            }

            const presToCycle = currentArticlePres.length > 0 ? currentArticlePres : evenPreElements;
            if (presToCycle.length === 0) return;

            if (e.shiftKey) {
                currentPreIndex--;
                if (currentPreIndex < 0) currentPreIndex = presToCycle.length - 1;
            } else {
                currentPreIndex++;
                if (currentPreIndex >= presToCycle.length) currentPreIndex = 0;
            }

            const el = presToCycle[currentPreIndex];
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            showPopup(`Code block ${currentPreIndex + 1} (in current article)`);

            // Show question number from previous article if even article, else current article
            showQuestionBannerForElement(el);

            lastKeyPressed = null;
            lastFocusedTarget = null;
            return;
        }

        if (key === 'enter') {
            const active = document.activeElement;
            if (targets.includes(active)) {
                e.preventDefault();
                e.stopPropagation();

                if (e.shiftKey) {
                    active.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    scrollStates.set(active, 0);
                    outlineFocus(active);
                } else {
                    const currentState = scrollStates.get(active) ?? 0;
                    const nextState = (currentState + 1) % scrollCycleOrder.length;
                    active.scrollIntoView({ behavior: 'smooth', block: scrollCycleOrder[nextState] });
                    scrollStates.set(active, nextState);
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

        const parent = el.closest('div.relative');
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY + parentRect.top - 2000;

        if (parentRect.height > viewportHeight) {
            const scrollBlock = scrollStates.get(el) ?? 'start';
            scrollCycleOrder = ['start', 'center', 'end'];
            el.focus();
            el.scrollIntoView({ behavior: 'instant', block: scrollCycleOrder[scrollBlock] || 'start' });
            window.scrollTo({ top: scrollY, behavior: 'instant' });
        } else {
            scrollCycleOrder = ['end', 'start', 'center'];
            el.focus();
        }
    }
})();
