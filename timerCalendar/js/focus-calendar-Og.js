document.addEventListener("DOMContentLoaded", () => {
    const months = document.querySelectorAll(".month");
    const monthMap = {};
    let focusedMonthIndex = -1;
    
    // Map first letter of months to their elements
    months.forEach((month, index) => {
        const firstLetter = month.dataset.name[0].toLowerCase();
        if (!monthMap[firstLetter]){
            monthMap[firstLetter] = [];
        } 
        monthMap[firstLetter].push({ element: month, index });
    });
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        let letter = event.key.toLowerCase()
        if(letter == 'h'){
            const homelink = document.querySelector('.homelink');
            homelink.focus()
            
        }
        
        const isShift = event.shiftKey;
        if (monthMap[key]) {
            event.preventDefault();
            cycleMonths(key, isShift);
        }
    });
    function cycleMonths(letter, reverse) {
        let months = monthMap[letter];
        if (!months) return;
        if (focusedMonthIndex === -1 || !months.some(m => m.index === focusedMonthIndex)) {
            focusedMonthIndex = months[0].index;
        } else {
            let currentIdx = months.findIndex(m => m.index === focusedMonthIndex);
            if (reverse) {
                focusedMonthIndex = months[(currentIdx - 1 + months.length) % months.length].index;
            } else {
                focusedMonthIndex = months[(currentIdx + 1) % months.length].index;
            }
        }
        months.find(m => m.index === focusedMonthIndex).element.focus();
    }
});
