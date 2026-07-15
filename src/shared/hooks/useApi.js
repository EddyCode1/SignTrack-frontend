/**
 * Custom Hook para manejo de API
 * Centraliza la lógica de fetch, loading, error
 */
import { useState, useCallback } from 'react'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (apiCall) => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      return result
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, execute }
}
