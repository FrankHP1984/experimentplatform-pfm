import { useState, useEffect, useCallback } from 'react'
import * as responsesApi from '../api/responses'

export function useExperimentResponses(experimentId) {
  const [responses, setResponses] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const fetch = useCallback(async () => {
    if (\!experimentId) return
    setLoading(true)
    try {
      const data = await responsesApi.getExperimentResponses(experimentId)
      setResponses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [experimentId])

  useEffect(() => { fetch() }, [fetch])

  return { responses, loading, error, refetch: fetch }
}

export function useParticipantResponses(enrollmentId) {
  const [responses, setResponses] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const fetch = useCallback(async () => {
    if (\!enrollmentId) return
    setLoading(true)
    try {
      const data = await responsesApi.getParticipantResponses(enrollmentId)
      setResponses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [enrollmentId])

  useEffect(() => { fetch() }, [fetch])

  const submit = async (data) => {
    await responsesApi.submitResponses(enrollmentId, data)
    await fetch()
  }

  return { responses, loading, error, submit }
}
