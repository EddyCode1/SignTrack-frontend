import { predictLetterFromFrame, translateSignText } from '../recognitionClient'

export { predictLetterFromFrame, translateSignText, checkRecognitionHealth } from '../recognitionClient'

export const buildSignMessage = (letters) => letters.join('').trim()

export default {
  predictLetterFromFrame,
  buildSignMessage,
}
