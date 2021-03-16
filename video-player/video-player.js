import { fetchTemplate } from '../utils.js'

// fn args vs config?
const mediaControls = (media, { minSpeed = 0.25, maxSpeed = 5, clipDuration = 3000 } = {}) => {
  const config = { minSpeed, maxSpeed, clipDuration }

  return {
    playPause() {
      if(media.paused) {
        media.play()
      } else {
        media.pause()
      }
    },

    playClip(){
      media.play()
      setTimeout(_ => media.pause(), config.clipDuration)
    },

    skip(delta) {
      media.currentTime += delta
    },

    speed(delta) {
      const current = media.playbackRate
      const isNegative = Math.sign(delta) == -1 ? true : false

      if (!isNegative) { // speed up
        media.playbackRate = Math.min(config.maxSpeed, current + delta)
      } else { // slow down
        media.playbackRate = Math.max(config.minSpeed, current + delta)
      }
    },
  }
}

// duration
const secondsToString = sec => new Date(sec * 1000).toISOString().substr(11, 8) // SO

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

    // event listeners
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

  attachListeners() {
    const sel = query => this.shadowRoot.querySelector(query)
    const selAll = query => this.shadowRoot.querySelectorAll(query)

    const videoEl = sel('.video')
    const ctrls = mediaControls(videoEl)

    videoEl.addEventListener('durationchange', _ => {
      const seconds = parseFloat(videoEl.duration).toFixed()
      sel('.duration').textContent = secondsToString(seconds) // set duration
    })

    // timer
    videoEl.addEventListener('timeupdate', _ => sel('.timer').textContent = secondsToString(videoEl.currentTime))

    // video scrubber
    const progressEl = sel('.progress-slider')

    progressEl.addEventListener('input', _ => {
      videoEl.currentTime = videoEl.duration * progressEl.value * 0.01
      videoEl.play()
    })

    videoEl.addEventListener('timeupdate', _ => {
      progressEl.value = Math.floor(videoEl.currentTime / videoEl.duration * 100)
      progressEl.style.setProperty('--track-bg-size', `${progressEl.value}%`)
    })

    const muteEl = sel('.mute')

    muteEl.addEventListener('click', toggleMute)

    // volume
    volumeSlider.addEventListener('input', _ => {
      videoEl.volume = volumeSlider.value / 100
      if (volumeSlider.value == 0) volumeState.volume = 1
    })

    videoEl.addEventListener('volumechange', _ => {
      muteEl.textContent = videoEl.volume == 0 ? 'U' : 'M' // update icons

      if ((volumeSlider.value / 100) != videoEl.volume) {
        volumeSlider.value = videoEl.volume * 100
        volumeSlider.dispatchEvent(new Event('input'))
      }
    })

    // mute
    const volumeState = {}
    const volumeSlider = sel('.volume-slider')

    const toggleMute = _ => {
      const volume = videoEl.volume

      if (volume == 0) { // unmute
        videoEl.volume = volumeState.volume // restore volume
        videoEl.dispatchEvent(new Event('volumechange'))
      } else { // mute
        volumeState.volume = volume // save current volume
        videoEl.volume = 0
        videoEl.dispatchEvent(new Event('volumechange'))
      }
    }

    // functionality for fancy sliders
    const sliders = (_ => {
      selAll('input[type=range]').forEach(input => {
        input.style.setProperty('--track-bg-size', `${input.value}%`)
        input.addEventListener('input', ({ target }) => {
          target.style.setProperty('--track-bg-size', `${target.value}%`) // min 0, max 100
        })
      })
    })()

    videoEl.addEventListener('loadedmetadata', event => {
      sel('.controls').style.display = 'block'
    })

  }
}

export default VideoPlayer