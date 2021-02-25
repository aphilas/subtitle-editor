/** @author migs_boson */
const expMap = ([a, b], [_a, _b], x) => _a * Math.exp(Math.log(_b / _a) * ((x - a) / (b - a)))

const setCursor = (target, position) => { 
  const range = document.createRange()
  const selection = window.getSelection()
  range.setStart(target.childNodes[0], position)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  target.focus()
}

const fetchTemplate = async (path) => {
  const res = await fetch(path)
  const txt = await res.text()
  return txt
}

export { expMap, setCursor, fetchTemplate }