const fetchTemplate = async (path) => {
  const res = await fetch(path)
  const txt = await res.text()
  return txt

  // const html = new DOMParser().parseFromString(txt, 'text/html')
  // return html.querySelector('template')
}

class VideoPlayer extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  async connectedCallback() {
    const text = await fetchTemplate('./video-player/video-template.html')
    const fragment = document.createRange().createContextualFragment(text)

    const node = fragment.firstChild.content.cloneNode(true)
    // const node = document.importNode(template.content, true)
    // const node = template.content.cloneNode(true)

    this.shadowRoot.appendChild(node)
  }
}

customElements.define('video-player', VideoPlayer)