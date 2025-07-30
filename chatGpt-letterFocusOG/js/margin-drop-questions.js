(function(){
const dropQuestions = document.querySelectorAll('.drop-question')
dropQuestions.forEach((el,i) => {
    if(i == 0 || i % 2 == 0){
        el.style.marginLeft = '30%';
    }  else {
        el.style.marginRight = '30%';
        el.style.marginLeft = '3%';

    }
})
})();