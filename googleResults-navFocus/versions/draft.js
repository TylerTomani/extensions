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
	const googleResultsItems = document.querySelectorAll('a.zReHs')
	let resultsItemsFocused = false
	googleResultsItems.forEach(el => {
		el.addEventListener('focus', () => {resultsItemsFocused = true;})
		el.addEventListener('focusout', () => {resultsItemsFocused = false;})
	})
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
    
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'){return;} 
    if(e.metaKey){return}
    
    const key = e.key.toLowerCase();
    if (lastFocusedElement || (key === 'tab' || lastFocusedElement)) {
      if(lastFocusedElement) {
        lastFocusedElement.classList.remove('focused');
        lastFocusedElement = null;
      }
    }
    if (key.length !== 1 || !/^[a-z0-9]$/.test(key)) return;
    const allLinks = getAllLinks();
    const matchingLinks = allLinks.filter(({ span }) =>
      span.innerText.trim().toLowerCase().startsWith(key)
    );
    if (matchingLinks.length === 0) return;


    const activeIndexMatch = matchingLinks.findIndex(obj => obj.link === currentFocusedLink);

	let newIndex;

	if (key !== lastLetterPressed) {
		// Find the closest match by vertical distance
		if (currentFocusedLink) {
			const currentTop = currentFocusedLink.getBoundingClientRect().top;
			let closestDiff = Infinity;
			matchingLinks.forEach(({ link }, i) => {
			const diff = Math.abs(link.getBoundingClientRect().top - currentTop);
			if (diff < closestDiff) {
				closestDiff = diff;
				newIndex = i;
			}
			});
		} else {
			// If no focus yet, default to first or last
			newIndex = e.shiftKey ? matchingLinks.length - 1 : 0;
		}
		} else {
		// Same letter pressed again → cycle
		if (activeIndexMatch === -1) {
			newIndex = e.shiftKey ? matchingLinks.length - 1 : 0;
		} else {
			newIndex = e.shiftKey
			? (activeIndexMatch - 1 + matchingLinks.length) % matchingLinks.length
			: (activeIndexMatch + 1) % matchingLinks.length;
		}
	}
	console.log(resultsItemsFocused)
	if(resultsItemsFocused){
		/** Figure out how to use command + shift + f to go to next 
		googleResultsItems index from current and command + shift + e
		o go to previous*/
		const iActiveINgoogleResultsItems = [...googleResultsItems].indexOf(e.target)
		if(e.shiftKey && e.metaKey && key === 'f'){
			console.log(e.target)
			console.log(newIndex)
			if(iActiveINgoogleResultsItems < googleResultsItems.length - 1){
				googleResultsItems[iActiveINgoogleResultsItems + 1].focus()
			} else {
				googleResultsItems[0].focus()
			}
		}
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

		// console.log('Focused:', newLink.innerText.trim());
	}
	
  });
})();
