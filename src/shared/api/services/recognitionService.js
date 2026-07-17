import { predictLetterFromFrame } from '../recognitionClient'

export { predictLetterFromFrame, checkRecognitionHealth } from '../recognitionClient'

export const buildSignMessage = (letters) => letters.join('').trim()

export default {
  predictLetterFromFrame,
  buildSignMessage,
}
