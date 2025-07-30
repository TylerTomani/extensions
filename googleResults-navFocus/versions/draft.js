// draft - nice
(() => {
  	const style = document.createElement('style');
  	style.textContent = `
    	.focused {
    	  box-shadow: 0 0 0 3px #4285f4 !important;
    	  background-color: rgba(66, 133, 244, 0.25) !important;
    	  border-radius: 6px !important;
    	}
	`;
	document.head.appendChild(style);

	let lastLetterPressed = null;
	let currentFocusedLink = null;
	let lastFocusedElement = null;
	function getListItem(el) {
    while (el && el !== document.body) {
      if (
        el.classList.contains('mTpL7c') ||
        el.getAttribute('role') === 'listitem' ||
        el.classList.contains('zReHs')
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }
  function getAllLinks() {
    return [...document.querySelectorAll('span.R1QWuf, a.zReHs > h3, a.zReHs')]
      .map(el => {
        const span = el.tagName === 'H3' || el.tagName === 'A' ? el : null;
        const link = el.closest('a.C6AK7c, [role="button"], a.zReHs');
        return link && (span?.innerText || link.innerText)?.trim()
          ? { span: span || link, link }
          : null;
      })
      .filter(Boolean)
      .filter(({ link }) => {
        const rect = link.getBoundingClientRect();
        return link.offsetParent !== null && rect.width > 0 && rect.height > 0;
      });
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toLowerCase();
    if (key.length !== 1 || !/^[a-z0-9]$/.test(key)) return;

    const allLinks = getAllLinks();
    const matchingLinks = allLinks.filter(({ span }) =>
      span.innerText.trim().toLowerCase().startsWith(key)
    );
    if (matchingLinks.length === 0) return;

    if (lastFocusedElement) {
      lastFocusedElement.classList.remove('focused');
      lastFocusedElement = null;
    }

    const activeIndexMatch = matchingLinks.findIndex(obj => obj.link === currentFocusedLink);

    let newIndex;
    if (key !== lastLetterPressed) {
      newIndex = e.shiftKey ? matchingLinks.length - 1 : 0;
    } else {
      newIndex =
        activeIndexMatch === -1
          ? (e.shiftKey ? matchingLinks.length - 1 : 0)
          : (e.shiftKey
              ? (activeIndexMatch - 1 + matchingLinks.length)
              : (activeIndexMatch + 1)) % matchingLinks.length;
    }

    const newLink = matchingLinks[newIndex]?.link;
	if (newLink) {
		newLink.focus();
		// Prefer to focus the <h3> inside the link if available
		const listItem = getListItem(newLink.parentElement)
		const h3 = newLink.querySelector('h3');
		if(listItem){
			listItem.classList.add('focused');
			lastFocusedElement = listItem;
		} else 
		if (h3) {
		h3.classList.add('focused');
		lastFocusedElement = h3;
		} else {
		newLink.classList.add('focused');
		lastFocusedElement = newLink;
		}

		currentFocusedLink = newLink;
		lastLetterPressed = key;

		console.log('Focused:', newLink.innerText.trim());
	}
  });
})();
