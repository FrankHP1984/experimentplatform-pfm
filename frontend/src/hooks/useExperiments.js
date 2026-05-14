import { useState, useEffect, useCallback } from 'react'
import * as experimentsApi from '../api/experiments'

export function useExperiments() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await experimentsApi.getMyExperiments()
      const lista = data.content || data
      setExperiments(lista)
    } catch (err) {
      console.log('Error cargando experimentos:', err)
      setError(err.response?.data?.message || 'Error al cargar experimentos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (data) => {
    const payload = { ...data, designType: data.design, design: undefined }
    const newExp  = await experimentsApi.createExperiment(payload)
    setExperiments(prev => [newExp, ...prev])
    return newExp
  }

  const remove = async (id) => {
    await experimentsApi.deleteExperiment(id)
    setExperiments(prev => prev.filter(e => e.id !== id))
  }

  const changeStatus = async (id, status) => {
    const updated = await experimentsApi.patchExperimentStatus(id, status)
    setExperiments(prev => prev.map(e => e.id === id ? updated : e))
    return updated
  }

  return { experiments, loading, error, refetch: fetch, create, remove, changeStatus }
}
