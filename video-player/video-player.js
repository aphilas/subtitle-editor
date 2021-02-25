import { fetchTemplate } from '../utils.js'

class VideoPlayer extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  async connectedCallback() {
    const text = await fetchTemplate('./video-player/video-template.html')
    const fragment = document.createRange().createContextualFragment(text)
    const node = fragment.firstChild.content.cloneNode(true)
    this.shadowRoot.appendChild(node)

    this.videoEl = this.shadowRoot.querySelector('.video')
    const sourceEl = document.createElement('source')

    const src = this.getAttribute('src')
    if (src) sourceEl.setAttribute('src', src)

    this.videoEl.appendChild(sourceEl)
  }

  static get observedAttributes() {
    return ['src']
  }

  attributeChangedCallback(name, oldVal, newVal) {
    switch(name) {
      case 'src':
        if (!this.videoEl) break

        const sourceEl = this.videoEl.querySelector('source')
        sourceEl?.setAttribute('src', newVal)
        this.videoEl.load()
        break
    }
  }
}

customElements.define('video-player', VideoPlayer)