import adminClient from '../../api/adminClient'
import toast from 'react-hot-toast'

const resource = '/reservation'

const normalizeReservationItem = (item) => {
  if (!item || typeof item !== 'object') return item

  const id = item._id || item.id || item.reservation_id || item.reservationId || null

  const resolveName = (user) => {
    if (!user || typeof user !== 'object') return ''
    return (
      user.nombre ||
      user.name ||
      user.fullname ||
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.customer_name ||
      user.client_name ||
      ''
    )
  }

  const resolveEmail = (user) => {
    if (!user || typeof user !== 'object') return ''
    return (
      user.email ||
      user.client_email ||
      user.customer_email ||
      user.mail ||
      ''
    )
  }

  const resolveTableText = (tableValue) => {
    if (!tableValue) return ''
    if (typeof tableValue === 'string' || typeof tableValue === 'number') {
      return String(tableValue)
    }
    if (typeof tableValue === 'object') {
      return (
        tableValue.table_name ||
        tableValue.name ||
        tableValue.nombre ||
        (tableValue.table_number ? `Mesa ${tableValue.table_number}` : '') ||
        tableValue.number ||
        tableValue._id ||
        tableValue.id ||
        ''
      )
    }
    return ''
  }

  const tableName =
    resolveTableText(item.mesa) ||
    resolveTableText(item.table_name) ||
    resolveTableText(item.table) ||
    resolveTableText(item.table_id) ||
    resolveTableText(item.table?.table_id) ||
    resolveTableText(item.table?.name) ||
    resolveTableText(item.table?.table_name) ||
    resolveTableText(item.table?.number)

  const userObject = item.user || item.client || item.customer || {}

  return {
    ...item,
    _id: id,
    cliente:
      item.cliente ||
      item.client_name ||
      item.customer_name ||
      item.customer ||
      item.client ||
      item.nombre ||
      item.name ||
      item.fullname ||
      item.fullName ||
      resolveName(userObject) ||
      '',
    email:
      item.email ||
      item.client_email ||
      item.customer_email ||
      resolveEmail(userObject) ||
      '',
    fecha:
      item.fecha ||
      item.reservation_date ||
      item.date ||
      item.reservationDate ||
      item.reservation?.date ||
      '',
    hora:
      item.hora ||
      item.reservation_time ||
      item.time ||
      item.reservationTime ||
      item.reservation?.time ||
      '',
    personas:
      item.personas ||
      item.number_of_people ||
      item.guest_count ||
      item.people ||
      item.party_size ||
      item.pax ||
      item.cantidad ||
      item.personCount ||
      item.guestCount ||
      item.guests ||
      '',
    tipo:
      item.tipo ||
      item.reservation_type ||
      item.type ||
      item.delivery_type ||
      item.reservationType ||
      '',
    estado:
      item.estado ||
      item.status ||
      item.state ||
      item.reservation_status ||
      item.reservationStatus ||
      item.condition ||
      '',
    mesa:
      tableName ||
      (item.reservation_type
        ? item.reservation_type === 'domicilio'
          ? 'Domicilio'
          : String(item.reservation_type)
        : ''),
    notas:
      item.notas ||
      item.reservation_history ||
      item.notes ||
      item.description ||
      item.details ||
      '',
  }
}

const normalizeReservationList = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeReservationItem)
  }

  if (Array.isArray(payload?.reservations)) {
    return payload.reservations.map(normalizeReservationItem)
  }

  if (Array.isArray(payload?.data)) {
    return payload.data.map(normalizeReservationItem)
  }

  return []
}

const reservationService = {
  getReservations: async (params = {}) => {
    try {
      const response = await adminClient.get(resource, { params })
      return normalizeReservationList(response.data?.data ?? response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cargando reservaciones')
      return []
    }
  },

  createReservation: async (reservationData) => {
    try {
      console.log('Sending reservation data to backend:', reservationData)
      const response = await adminClient.post(resource, reservationData)
      console.log('Backend response:', response)
      toast.success('Reservación creada correctamente')
      return response.data?.data ?? response.data
    } catch (error) {
      console.error('Reservation creation error:', error.response?.data || error)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      const errors = error.response?.data?.errors
      if (errors && Array.isArray(errors)) {
        console.log('Validation errors:', errors)
        const errorMessages = errors.map(err => err.message || err.msg || JSON.stringify(err)).join('; ')
        toast.error(`Errores de validación: ${errorMessages}`)
      } else {
        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.validation ||
          JSON.stringify(error.response?.data) ||
          'Error al crear reservación'
        toast.error(backendMessage)
      }
      return null
    }
  },

  updateReservation: async (id, reservationData) => {
    try {
      const response = await adminClient.put(`${resource}/${id}`, reservationData)
      toast.success('Reservación actualizada correctamente')
      return response.data?.data ?? response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar reservación')
      return null
    }
  },

  cancelReservation: async (id) => {
    try {
      const payload = {
        reservation_state: 'cancelada',
        status: 'cancelada',
        estado: 'cancelada',
        reservation_status: 'cancelada',
      }
      const response = await adminClient.put(`${resource}/${id}`, payload)
      toast.success('Reservación cancelada')
      return response.data?.data ?? response.data
    } catch (error) {
      console.error('Cancel reservation error (initial):', error.response?.data || error)

      // If backend complains about invalid fields, try common alternative payload shapes
      const msg = error.response?.data?.message || ''
      if (error.response?.status === 400 && /campos válidos|validos|válidos/i.test(msg)) {
        const variants = [
          { reservation_state: 'cancelada' },
          { reservation_state: 'cancelada', reservation_status: 'cancelada' },
          { reservation: { reservation_state: 'cancelada' } },
          { status: 'cancelada' },
          { estado: 'cancelada' },
          { reservation_status: 'cancelada' },
          { state: 'cancelada' },
        ]

        for (const v of variants) {
          try {
            console.debug('Retrying cancel with payload:', v)
            const r = await adminClient.put(`${resource}/${id}`, v)
            toast.success('Reservación cancelada')
            return r.data?.data ?? r.data
          } catch (err2) {
            console.debug('Retry failed for payload', v, err2.response?.data || err2)
            // continue trying other variants
          }
        }
      }

      toast.error(error.response?.data?.message || error.response?.data || 'Error al cancelar reservación')
      return null
    }
  },

  deleteReservation: async (id) => {
    try {
      const response = await adminClient.delete(`${resource}/${id}`)
      toast.success('Reservación eliminada')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar reservación')
      return null
    }
  },
}

export default reservationService
