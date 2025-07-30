const months = document.querySelectorAll('.month');
const monthElsArr = Array.from(months);
export const days = document.querySelectorAll('.month > .days > .day');

let monthFocused = true;
let currentMonthDays = [];
let currentDay = 0;
let letteredMonths = [];
let letterIndex = 0;
let currentLetter;

function hideDays() {
    months.forEach(month => {
        if (!month.classList.contains('show')) {
            month.querySelectorAll('.days > .day').forEach(day => day.classList.add('hide'));
        }
    });
}

hideDays();

months.forEach(month => {
    month.addEventListener('click', toggleDays);
    month.addEventListener('keydown', handleMonthKeydown);
    month.addEventListener('focus', () => { monthFocused = true; letterIndex = letteredMonths.indexOf(month); });
    month.addEventListener('focusin', () => { letterIndex = letteredMonths.indexOf(month); });
    month.addEventListener('focusout', () => { monthFocused = false; });
});

days.forEach(day => {
    day.addEventListener('focus', () => { monthFocused = false; });
    day.addEventListener('keydown', handleDayKeydown);
});

function toggleDays(e) {
    const month = getMonth(e.target);
    const days = month.querySelectorAll('.days > .day');
    month.classList.toggle('show');
    days.forEach(day => day.classList.toggle('hide'));
}

function handleMonthKeydown(e) {
    let key = e.key.toLowerCase();
    const month = getMonth(e.target);
    const days = month.querySelectorAll('.days > .day');
    if (e.keyCode === 13) {
        toggleDays(e);
        currentMonthDays = Array.from(days);
    }
    if (key === 'arrowdown') {
        focusFirstDay(days);
    }
}

function focusFirstDay(days) {
    for (let day of days) {
        if (day.innerText.trim() === '1') {
            day.focus();
            currentDay = 0;
            break;
        }
    }
}

function handleDayKeydown(e) {
    let key = e.key.toLowerCase();
    const month = getMonth(e.target.parentElement);
    if (month.querySelector('h3').innerText[0].toLowerCase() === key) {
        month.focus();
    }
}

function getMonth(el) {
    return el.closest('.month') || null;
}

addEventListener('keydown', e => {
    let letter = e.key.toLowerCase();
    monthElsArr.forEach(el => {
        if (el.querySelector('h3').innerText[0].toLowerCase() === letter) {
            letteredMonths.push(el);
        }
    });
    focusToMonth(letter);
    letteredMonths = [];
});

function focusToMonth(letter) {
    if (!letteredMonths.length) return;

    if (currentLetter === letter) {
        letteredMonths[letterIndex]?.focus();
    } else {
        letteredMonths[0].focus();
        letterIndex = 0;
    }

    letterIndex = (letterIndex + 1) % letteredMonths.length;
    currentLetter = letter;
}
