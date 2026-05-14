import { useState, useEffect, useCallback } from 'react'
import * as enrollmentsApi from '../api/enrollments'

export function useParticipants(experimentId) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const fetch = useCallback(async () => {
    if (\!experimentId) return
    setLoading(true)
    try {
      const data = await enrollmentsApi.getEnrollments(experimentId)
      setParticipants(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [experimentId])

  useEffect(() => { fetch() }, [fetch])

  const withdraw = async (enrollmentId) => {
    const updated = await enrollmentsApi.patchEnrollmentStatus(enrollmentId, 'WITHDRAWN')
    setParticipants((prev) =>
      prev.map((p) => (p.id === enrollmentId ? updated : p))
    )
  }

  return { participants, loading, error, refetch: fetch, withdraw }
}
