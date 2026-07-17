/** Lee en voz alta traducciones de señas (Web Speech API). */
export function speakTranslation(text, lang = 'es-GT') {
  if (!text?.trim() || typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = lang
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}
