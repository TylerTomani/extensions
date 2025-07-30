const months = document.querySelectorAll('.month')
const monthElsArr = Array.from(document.querySelectorAll('.month'))
export const days = document.querySelectorAll('.month > .days > .day')
let monthFocused = true
let daysShowing = false
let letteredMonths = []
let currentMonthDays = []
let currentDay = 0
let currentLetter
let letterIndex = 0
function hideDays(){
    months.forEach(month => {
        const days = month.querySelectorAll('.days > .day')
        if(!month.classList.contains('show')){
            days.forEach(day => {
                day.classList.add('hide')
            })
        }
    })
}
hideDays()

months.forEach(month => {
    if(month.classList.contains('show')){
        const days = month.querySelectorAll('.days > .day')
        currentMonthDays = Array.from(days)
    }
    month.addEventListener('click', toggleDays)
    month.addEventListener('keydown', e => {
        let letter = e.key.toLowerCase()
        let key = e.keyCode     
        const days = e.target.querySelectorAll('.days > .day')
        if(key === 13){
            toggleDays(e)
            currentMonthDays = Array.from(days)
        }
        
        if(letter == 'arrowdown'){
            currentMonthDays = Array.from(days)
            currentMonthDays.forEach(el => {
                if(el.innerText[0] == 1 && el.innerText.length == 1){
                    console.log(el.innerText)
                    el.focus()
                    currentDay = 0
                }
            })
            
        }
        
    })
    month.addEventListener('focus', e => {
        monthFocused = true
        letterIndex = letteredMonths.indexOf(e.target)

    })
    month.addEventListener('focusin', e => {
        if(letteredMonths){
            letterIndex = letteredMonths.indexOf(e.target)
        }
    })
    month.addEventListener('focusout', e => {
        monthFocused = false
    })
})
days.forEach(el => {
    el.addEventListener('focus', e => {
        monthFocused = false
    })
    el.addEventListener('keydown', e => {
        let letter = e.key.toLowerCase()
        const month = getMonth(e.target.parentElement)
        const h3 = month.querySelector('h3')
        if(letter == h3.innerText[0].toLowerCase()){
            month.focus()
        }
        
    })
})
function toggleDays(e){
    const month = getMonth(e.target)
    const days = month.querySelectorAll('.days > .day');
    if(monthFocused){
        if (month.classList.contains('show')) {
            month.classList.remove('show');
            days.forEach(day => day.classList.toggle('hide'));
            
        } else {
            days.forEach(day => day.classList.toggle('hide'));
        }

    }
}

function addTabIndex(els){els.forEach( el => {el.setAttribute('tabindex','1')})}
addTabIndex(months)

function getMonth(el){
    if(el.classList.contains('month')){
        return el
    } else if (el.parentElement){
        return getMonth(el.parentElement)
    } else {
        return null}}
addEventListener('keydown', e  => {
    let letter = e.key.toLowerCase()
    monthElsArr.forEach(el => {
        const h3 = el.querySelector('h3')
        if(letter == h3.innerText[0].toLowerCase()){
            letteredMonths.push(el)
        }
    })
    focusToMonth(letter)
    letteredMonths = []
    handleDays(e,letter)
});
function focusToMonth(letter){
     if (letteredMonths.length === 0) {
        // console.warn('No months found for letter:', letter);
        return;
    }
    
    if (currentLetter === letter) {
        if (letteredMonths[letterIndex]) {
            letteredMonths[letterIndex].focus();
        } else {
        }
    } else {
        
        if (letteredMonths[0]) {
            letteredMonths[0].focus();
        } else {
        }
        letterIndex = 0;
    }

    letterIndex = (letterIndex + 1) % letteredMonths.length;
    currentLetter = letter;
}
function handleDays(e,letter){
    const month = getMonth(e.target)
    if(month){

        const days = month.querySelectorAll('.days > .day')
        currentMonthDays = Array.from(days)
        currentMonthDays.forEach((day,i,arr) => {
            day.addEventListener('focus', e => {
                currentDay = i
            })
        })
        // This needs to be adjusted to avoid errors
        switch(letter){
            case 'arrowleft':
                if(currentDay > 0){
                    currentMonthDays[currentDay - 1].focus()
                }
                break
            case 'arrowright':
                if(currentDay < currentMonthDays.length - 1){
                    currentMonthDays[currentDay +1].focus()
                } else if(currentMonthDays > currentMonthDays.length){
                    currentMonthDays[0].focus()
                }
                break
            case 'arrowdown':
                if(currentDay < currentMonthDays.length - 1 && currentDay > 0){
                    currentMonthDays[currentDay + 7].focus()
                }
                break
            case 'arrowup':
                if(currentDay < currentMonthDays.length - 1 && currentDay > 0){
                    currentMonthDays[currentDay - 7].focus()
                }
                break
        }
    }
}