import axios from 'axios'

const recognitionClient = axios.create({
  baseURL: import.meta.env.VITE_RECOGNITION_URL || '/recognition-api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

export const predictLetterFromFrame = async (imageBase64) => {
  try {
    const response = await recognitionClient.post('/predict-letter', { imageBase64 })
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
