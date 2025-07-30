function focusToMonth(letter){
    letteredMonths = [];
    
    if (currentLetter !== letter) {
        letterIndex = 0;
    }
    months.forEach(el => {
        if (el.querySelector('h3').innerText.toLowerCase().startsWith(letter)) {
            letteredMonths.push(el);
        }
    });

    if (letteredMonths[letterIndex]) {
        letteredMonths[letterIndex].focus();
    }
    letterIndex = (letterIndex + 1) % letteredMonths.length;
    currentLetter = letter;
}