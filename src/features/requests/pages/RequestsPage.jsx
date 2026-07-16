import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getInbox, updateRequestStatus } from '../../../shared/api/services/requestService'

const REQUEST_TYPE_LABELS = {
  group_invite: 'Invitación a grupo',
  contact: 'Solicitud de contacto',
  meeting: 'Reunión',
}

const STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
}

const RequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchInbox = async () => {
    setLoading(true)
    try {
      const data = await getInbox()
      setRequests(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInbox()
  }, [])

  const handleStatus = async (requestId, status) => {
    setUpdatingId(requestId)
    try {
      const updated = await updateRequestStatus(requestId, status)
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)))
      toast.success(status === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar la solicitud')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <div className="p-6">Cargando solicitudes...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Solicitudes</h1>

      {requests.length === 0 ? (
        <div className="card text-center text-[var(--muted)]">
          No tienes solicitudes pendientes.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {REQUEST_TYPE_LABELS[request.type] || request.type}
                </p>
                {request.groupName && (
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Grupo: {request.groupName}
                  </p>
                )}
                {request.appointmentTitle && (
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Cita: {request.appointmentTitle}
                  </p>
                )}
                {request.fromUsername && (
                  <p className="text-sm text-[var(--muted)] mt-1">
                    De: @{request.fromUsername}
                  </p>
                )}
                <p className="text-xs text-[var(--muted)] mt-2">
                  Estado: {STATUS_LABELS[request.status] || request.status}
                </p>
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatus(request.id, 'accepted')}
                    disabled={updatingId === request.id}
                    className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition disabled:opacity-50"
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatus(request.id, 'rejected')}
                    disabled={updatingId === request.id}
                    className="px-4 py-2 rounded-lg border border-[var(--accent-soft)] text-[var(--text)] hover:bg-[var(--bg)] transition disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RequestsPage
