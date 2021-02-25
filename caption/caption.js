
// document.createElement('caption-element')

import { fetchTemplate } from '../utils.js'

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
    // this.captionEl = this.shadowRoot.querySelector('.caption')
  }
}

customElements.define('caption-element', CaptionElement)