import { fetchTemplate } from '../utils.js'

const captionEnter = event => {
  if (event.key == 'Enter') {
    if (event.shiftKey) {
      document.execCommand('insertHTML', false,'<br>')
    } else {
      event.preventDefault()

      // el → <caption-element>
      const enterEvent = new CustomEvent('caption-enter', { detail: { text: event.target.textContent, el: event.target.getRootNode().host }}) 
      document.dispatchEvent(enterEvent)
    }
  }
}

const captionDelete = event => {
  if (event.key == 'Backspace'){
    if( event.target.textContent == '') {
      
      // el → <caption-element>
      const deleteEvent = new CustomEvent('caption-delete', { detail: { el: event.target.getRootNode().host }})
      document.dispatchEvent(deleteEvent)
    } 
  }
}

class CaptionElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  async connectedCallback() {
    const text = await fetchTemplate('./caption/caption.html')
    const fragment = document.createRange().createContextualFragment(text)
    const node = fragment.firstChild.content.cloneNode(true)
    this.shadowRoot.appendChild(node)

    this.captionEl = this.shadowRoot.querySelector('.caption-container')
    this.captionEl.addEventListener('keypress', captionEnter)
    this.captionEl.addEventListener('keydown', captionDelete)  

    const attachedEvent = new CustomEvent('caption-attached')
    this.dispatchEvent(attachedEvent)
  }
}

export default CaptionElement