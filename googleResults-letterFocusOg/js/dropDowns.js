const dropQuestions = document.querySelectorAll('.drop-question')
const questionAnswers = document.querySelectorAll('.questions-answer')

function hideQuestion(){
    questionAnswers.forEach((el => {
        // el.classList.add('hide')
    }))
}
hideQuestion()

dropQuestions.forEach(el => {
    el.addEventListener('keydown', e => {
        let letter = e.key.toLowerCase()
        if(letter == 'enter'){   
            toggleQuestion(e)
        }

    })
})

function toggleQuestion(e){
    const questionAnswer = getQuestionAnswer(e.target.parentElement)
    const answerTxt = questionAnswer.querySelector('.answer-txt')
    console.log(answerTxt)
    answerTxt.classList.toggle('hide')
}

function getQuestionAnswer(parent){
    if(parent.classList.contains('question-answer')){
        return parent
    } else if (parent.parentElement){
        return getQuestionAnswer(parent.parentElement)
    } else {
        return null
    }
}