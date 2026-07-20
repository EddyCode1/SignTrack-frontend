import axios from 'axios'

const recognitionClient = axios.create({
  baseURL: import.meta.env.VITE_RECOGNITION_URL || '/recognition-api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

const hybridDefault =
  String(import.meta.env.VITE_GEMINI_HYBRID ?? 'true').trim().toLowerCase() !== 'false'

export const predictLetterFromFrame = async (imageBase64, options = {}) => {
  const hybrid = typeof options.hybrid === 'boolean' ? options.hybrid : hybridDefault
  try {
    const response = await recognitionClient.post('/predict-letter', { imageBase64, hybrid })
    return response.data
  } catch (err) {
    if (err.response?.data) return err.response.data
    throw err
  }
}

export const translateSignText = async (rawText) => {
  try {
    const response = await recognitionClient.post('/translate', { raw_text: rawText })
    return response.data
  } catch (err) {
    if (err.response?.data) return err.response.data
    throw err
  }
}

export const checkRecognitionHealth = async () => {
  const response = await recognitionClient.get('/health')
  return response.data
}

export default recognitionClient
