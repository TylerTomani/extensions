document.addEventListener("DOMContentLoaded", () => {
    const months = document.querySelectorAll(".month");
    const monthMap = {};
    let focusedMonthIndex = -1;
    const dayEls = document.querySelectorAll('.days > .day')
    let dayElsFocus = false
    let lastDay
    
    // Map first letter of months to their elements
    months.forEach((month, index) => {
        const firstLetter = month.dataset.name[0].toLowerCase();
        if (!monthMap[firstLetter]){
            monthMap[firstLetter] = [];
        } 
        monthMap[firstLetter].push({ element: month, index });
        month.addEventListener('focus', e => {
            dayElsFocus = false
        })
        month.addEventListener('keydown', e => {
            let key = e.key.toLowerCase()
            let isMeta = e.metaKey
            const days = e.target.querySelector('.days')
            if(!days) return 
            const dayEls = e.target.querySelectorAll('.days > .day')
            if(isMeta && key == 'enter'){
                if(days.classList.contains('hide')){
                    days.classList.remove('hide')
                    dayEls[0].focus()
                } else {
                    dayEls[0].focus()
                }
            } 
            if (!days.classList.contains('hide') && !isNaN(key)) {
                let intKey = parseInt(key);
                if (!days.classList.contains('hide')) {
                    days.classList.remove('hide');
                }
                // Ensure intKey is within range
                if (intKey > 0 && intKey <= dayEls.length) {
                    dayEls[intKey - 1].focus();
                }
            }

        })
    });
    
    
    let currentIndex = 0;
    let lastKeyPressed = "";
    let matchingDays = [];

    function focusToDay(e, month) {
        const dayEls = month.querySelectorAll('.days > .day');
        let key = e.key.toLowerCase();
        let isShift = e.shiftKey;

        // Ensure key is a number (0-9)
        if (isNaN(key)) return;

        let num = parseInt(key);
        // If a different key is pressed, reset the cycle
        if (lastKeyPressed !== key) {
            matchingDays = [];

            // Find all matching days (e.g., 1, 11, 21, 31)
            for (let i = num; i <= 31; i += 10) {
                if (dayEls[i - 1]) {
                    matchingDays.push(i);
                }
            }

            currentIndex = 0;
        } else {
            // Cycle through next available number
            currentIndex = (currentIndex + (isShift ? -1 : 1) + matchingDays.length) % matchingDays.length;
        }

        // Focus on the selected day
        let targetDay = dayEls[matchingDays[currentIndex] - 1];
        if (targetDay) {
            targetDay.focus();
        }

        // Store last key pressed
        lastKeyPressed = key;
    }

    dayEls.forEach((el,daysEls) => {
        el.addEventListener('focus', e => {
            dayElsFocus = true
        })
        el.addEventListener('keydown', e => {
            let letter = e.key.toLowerCase() 
            const month = getMonth(e.target.parentElement)
            if(!isNaN(letter)){
                const intLetter = parseInt(letter)
                focusToDay(e,month)
            }
            if(letter == month.innerText[0].toLowerCase()){
                e.preventDefault()
                focusedMonthIndex -= 1
                month.focus()
            } else cycleMonths(letter, e)
            
            if(letter == 'enter'){
                openDay(e)
            }
            
        })
        el.addEventListener('click', e => {
            openDay(e)
        })
    })
    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        let letter = e.key.toLowerCase()
        if (letter == 'h') {
            const homelink = document.querySelector('.homelink');
            homelink.focus()
        }
        if (monthMap[key] && !dayElsFocus) {
            e.preventDefault();
            cycleMonths(key, e);
        }
    });
    function cycleMonths(letter, e) {
        const isShift = e.shiftKey;
        const isMeta = e.metaKey;
        if (isNaN(letter) && !isMeta ) {
            let months = monthMap[letter];
            if (!months) return;
            if (focusedMonthIndex === -1 || !months.some(m => m.index === focusedMonthIndex)) {
                focusedMonthIndex = months[0].index;
            } else {
                let currentIdx = months.findIndex(m => m.index === focusedMonthIndex);
                if (isShift) {
                    focusedMonthIndex = months[(currentIdx - 1 + months.length) % months.length].index;
                } else {
                    focusedMonthIndex = months[(currentIdx + 1) % months.length].index;
                }
            }
            months.find(m => m.index === focusedMonthIndex).element.focus();
        }

     
    }
});

function getCalendar(parent){
    if(parent.classList.contains('calendar')){
        return parent
    } else if (parent.parentElement){
        return getCalendar(parent.parentElement)
    } else {
        return null
    }
}
function getMonth(parent){
    if(parent.classList.contains('month')){
        return parent
    } else if (parent.parentElement){
        return getMonth(parent.parentElement)
    } else {
        return null
    }
}

function openDay(e){
    const oldHoursDays = document.querySelector('.hoursDay')
    const calendar = document.querySelector('.calendar')
    const month = getMonth(e.target.parentElement)
    if(oldHoursDays){
        calendar.removeChild(oldHoursDays)
    }else {

        const hoursDay = document.createElement('div')
        hoursDay.classList.add('hoursDay')
        month.style.order = 0
        hoursDay.style.border = `2px solid rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`
        console.log(hoursDay)
        calendar.appendChild(hoursDay)
    }
}