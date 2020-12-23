
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

