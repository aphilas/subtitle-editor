
/* video upload  */

const videoInput = document.querySelector('.video-input')
const videoComponent = document.querySelector('video-player')

const getVideoEl = _ => videoComponent.shadowRoot?.querySelector('.video') || { currentTime: 0 } // fix

videoInput.addEventListener('change', event => {
  const file = videoInput.files[0]
  const objectURL = window.URL.createObjectURL(file)
  videoComponent.setAttribute('src', objectURL)
  videoComponent.setAttribute('type', file.type)
}, false)

/* caption editors */

document.execCommand('defaultParagraphSeparator', false, 'br')

const captions = []
const captionsEl = document.querySelector('.captions')

const expMap = ([a, b], [_a, _b], x) => _a * Math.exp(Math.log(_b / _a) * ((x - a) / (b - a)))
const captionDuration = n => expMap([1 ,60], [1, 5], n)

const captionEnter = event => {
  if (event.key == 'Enter') {
    if (event.shiftKey) {
      document.execCommand('insertHTML',false,'<br>')
    } else {
      event.preventDefault()

      const previous = captions[captions.length - 1]
      const text = event.target.textContent
      previous.text = text
      previous.stop = previous.start + captionDuration(text.length)

      const caption = createCaption()
      captionsEl.appendChild(caption)
      captions.push({ start: getVideoEl().currentTime })
      caption.focus()
    }
  }
}

const captionDelete = event => {
  if (event.key == 'Backspace'){
    if( event.target.textContent == '') {
      event.target.remove()

      if (captions.lastChild) {
        event.preventDefault()
        const lastCaption = captions.lastChild
        const len  = lastCaption.textContent.length
        if (len > 0) setCursor(lastCaption, len)
        lastCaption.focus()
      }
    } else {
      // merge editors
    }
  }
}

const createCaption = _ => {
  const captionEl = document.createElement('div')
  captionEl.contentEditable = 'true'
  captionEl.classList.add('caption')
  captionEl.addEventListener('keypress', captionEnter)
  captionEl.addEventListener('keydown', captionDelete)  
  return captionEl
}

captionsEl.appendChild(createCaption())
captions[0] = { start: getVideoEl().currentTime }

const setCursor = (target, position) => { 
  const range = document.createRange()
  const selection = window.getSelection()
  range.setStart(target.childNodes[0], position)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  target.focus()
}
