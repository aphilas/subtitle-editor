const media = document.querySelector('video')
const controls = document.querySelector('.controls')
const play = document.querySelector('.play')
const timerWrapper = document.querySelector('.timer')
const timer = document.querySelector('.timer span')
const timerBar = document.querySelector('.timer div')
const fwd = document.querySelector('.stb')
const rwd = document.querySelector('.stf')
const increase_speed = document.querySelector('.incs')
const decrease_speed = document.querySelector('.decs')

const vid = document.querySelector('.selected_vid')
vid.addEventListener('change', handleFiles, false)

function handleFiles(event) {
  const file = vid.files[0]

  const objectURL = window.URL.createObjectURL(file)
  const sourceEl = document.createElement('source')
  
  sourceEl.setAttribute('src', objectURL)
  sourceEl.setAttribute('type', file.type)
  media.appendChild(sourceEl)
}

rwd.addEventListener('click', windForward)
fwd.addEventListener('click', windBackward)

increase_speed.addEventListener('click', increaseSpeed)
decrease_speed.addEventListener('click', decreaseSpeed)

media.removeAttribute('controls')
controls.style.visibility = 'visible'

play.addEventListener('click', playPauseMedia)
media.addEventListener('timeupdate', _ => timer.textContent = setTime(media.currentTime))

function playPauseMedia() {
  if(media.paused) {
    play.setAttribute('data-icon','u')
    media.play()
  } else {
    play.setAttribute('data-icon','P')
    media.pause()
  }
}

function windBackward() {
  if(media.currentTime > 3) {
    media.currentTime -= 3
  } else {
    media.currentTime = 0
  }
    
  // play.setAttribute('data-icon','P')
  // media.pause()
}

function windForward() {
  if(media.currentTime < media.duration - 3) {
    media.currentTime += 3
  } else {
    media.currentTime = media.duration
  }

  // play.setAttribute('data-icon','P')
  // media.pause()
}

function setTime(time) {
  let minutes = Math.floor(time / 60)
  let seconds = Math.floor(time - minutes * 60)

  const fmt = n => n < 10 ? '0' + n : n;

  return fmt(minutes) + ':' + fmt(seconds)
}

let playback_speed = media.defaultPlaybackRate

function increaseSpeed() {
  const max_speed = 5
  const speed_interval = 0.25

  if (playback_speed < max_speed) {
    playback_speed += speed_interval
    media.playbackRate = playback_speed
  }
}

function decreaseSpeed() {
  const min_speed = 0.25
  const speed_interval = 0.25

  if (playback_speed > min_speed) {
    playback_speed -= speed_interval
    media.playbackRate = playback_speed
  }
}

// document.querySelector('.controls').style.width = media.style.width

// video scrubber

const timeSlider = document.querySelector('input[type=range].slider')
const scrubber = document.querySelector('.scrubber')

scrubber.style.setProperty('--track-bg-size', `${timeSlider.value}%`)

timeSlider.addEventListener('input', event => {
  scrubber.style.setProperty('--track-bg-size', `${timeSlider.value}%`) // min 0, max 100
  media.currentTime = media.duration * timeSlider.value * 0.01
  media.play()
})

function synctimeSliderValue(_) {
  // if (playing) {
    timeSlider.value = Math.floor(media.currentTime / media.duration * 100)
    scrubber.style.setProperty('--track-bg-size', `${timeSlider.value}%`)
  // }

  window.requestAnimationFrame(synctimeSliderValue)
}

window.requestAnimationFrame(synctimeSliderValue)

// track duration

const durationEl = document.querySelector('.duration > span')

media.addEventListener('loadedmetadata', event => {
  const seconds = parseFloat(media.duration).toFixed()
  durationEl.textContent = setTime(seconds)
})

// play clip

const PLAY_CLIP_DURATION = 3000
const playClipEl = document.querySelector('.play-clip')

playClipEl.addEventListener('click', event => {
  media.play()
  play.setAttribute('data-icon','u')

  setTimeout(_ => {
    media.pause()
    play.setAttribute('data-icon','P')
  }, PLAY_CLIP_DURATION)
})

// volume

let muted = false
let volume = media.volume

const volumeSlider = document.querySelector('input[type=range].volume_slider')
const volumeEl = document.querySelector('.volume')
const muteEl = document.querySelector('.mute')

volumeEl.style.setProperty('--track-bg-size', `${volumeSlider.value}%`)

volumeSlider.addEventListener('input', event => {
  volumeEl.style.setProperty('--track-bg-size', `${volumeSlider.value}%`) // min 0, max 100
  media.volume = volumeSlider.value / 100

  if (media.volume == 0) {
    muteEl.setAttribute('data-icon','Q')
    volume = 1
    muted = true
  } else {
    muteEl.setAttribute('data-icon','g')
  }
})

muteEl.addEventListener('click', toggleMute)

function toggleMute(e) {
  if (muted) { 
    // unmute
    muted = false
    media.volume = volume
    volumeSlider.value = Math.floor(volume * 100)
    volumeEl.style.setProperty('--track-bg-size', `${volumeSlider.value}%`)
    muteEl.setAttribute('data-icon','g')
  } else { 
    // mute
    muted = true
    volume = media.volume
    media.volume = 0
    volumeSlider.value = 0
    volumeEl.style.setProperty('--track-bg-size', `0%`)
    muteEl.setAttribute('data-icon','Q')
  }
}


// caption groups
let caption_groups = []

document.execCommand("defaultParagraphSeparator", false, "br")

const editors = document.querySelector('.editors')

editors.appendChild(CreateEditor());
caption_groups[0] = { start: media.currentTime }

/**TODO: Display start and end times alognside caption group editor */
function CreateEditor() {
  const editor = document.createElement('div')
  editor.contentEditable = 'true'
  editor.classList.add('editor')
  editor.addEventListener('keypress', handleEnter)
  editor.addEventListener('keydown', handleDelete)  
  return editor
}

/**
 * @author - migs_boson
 */
function transform([a,b],[_a,_b],x) {
  return _a * Math.exp(Math.log(_b / _a) * ((x - a)/(b - a)))
}

const captionDuration = n => transform([1,60],[1,5],n)

function handleEnter(event) {
  if (event.key == 'Enter') {
    if (event.shiftKey) {
      document.execCommand('insertHTML',false,'<br>')
    } else {
      event.preventDefault()

      const previous = caption_groups[caption_groups.length - 1]
      const text = event.target.textContent

      previous.text = text
      previous.stop = previous.start + captionDuration(text.length)

      const editor = CreateEditor()
      editors.appendChild(editor)

      caption_groups.push({ start: media.currentTime })

      editor.focus()
    }
  }
}

/**TODO: Remove caption group from array after deleting editor */
function handleDelete(event) {
  if (event.key == 'Backspace'){
    if( event.target.textContent == '') {
      event.target.remove()

      if (editors.lastChild) {
        event.preventDefault()
        const ls = editors.lastChild
        const len  = ls.textContent.length
        // editors.lastChild.focus()
        if (len > 0) {
          setCursor(ls, len)
        }
        ls.focus()
      }
    } else {
      // merge editors
    }
  }
}

function setCursor(target, position) { 
  const range = document.createRange()
  const selection = window.getSelection()

  range.setStart(target.childNodes[0], position)
  range.collapse(true)

  selection.removeAllRanges()
  selection.addRange(range)

  target.focus()
}
