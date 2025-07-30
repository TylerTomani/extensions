export function addCopyCodes(){
const codeCopy = document.querySelectorAll('.copy-code')
const codeContainers = document.querySelectorAll('.code-container')
let cmdCarray = []
codeCopy.forEach(copycode => {
    copycode.addEventListener('keydown' , e => {        
        cmdCarray.unshift(e.keyCode)
        if(cmdCarray.length > 3){
            cmdCarray.pop()
        }
        if(cmdCarray[0] === 67 && cmdCarray[1] === 91){
            animate(e)
        }
    })
    copycode.addEventListener('click', e => {
        e.preventDefault()
        animate(e)
    })
    copycode.addEventListener('focusin', e  => {
        if(e.target.classList.contains('long-code')){
            e.target.scrollIntoView({ block: "end", inline: "nearest" });
            if(e.target.classList.contains('long-code')){
                e.target.scrollIntoView({ block: "start", inline: "nearest" });
            }
        }
    });
})
function animate(e){
    let el = e.target
    if(el.classList.contains('decopied')){
        el.classList.remove('decopied')
    }
    el.classList.add('copied')
    // console.log(el.parentElement)
    setTimeout(() =>{
        el.classList.remove('copied')
        el.classList.add('decopied')
    },250)
    if(e.target.tagName == 'TEXTAREA'){
        let txt = e.target.value
        copyToClip(txt)

    } else {
        let txt = e.target.innerText
        copyToClip(txt)
    }
    
}
function copyToClip(txt){ 
    async function copyTextToClipboard(text) {
        try {
          await navigator.clipboard.writeText(text);
        //   ;
        } catch (err) {
          console.error("Unable to copy text to clipboard:", err);
        }
      }
      
      const textToCopy = txt;
      copyTextToClipboard(textToCopy);
}
}
addCopyCodes()