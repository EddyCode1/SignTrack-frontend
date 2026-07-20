import { useEffect } from 'react'
import { FiPhoneCall } from 'react-icons/fi'
import Modal from './Modal'
import useLiveRegionStore from '../stores/useLiveRegionStore'

/**
 * Modal global de llamada entrante (evento "IncomingCall" del hub de Calls).
 * Se monta desde CallInviteProvider en cualquier pantalla autenticada.
 */
const IncomingCallModal = ({ invite, onAccept, onDecline }) => {
  const fromUserName = invite?.fromUserName || 'Alguien'

  useEffect(() => {
    if (!invite) return
    useLiveRegionStore
      .getState()
      .announce(`Llamada entrante de ${fromUserName}`, { flash: true })
  }, [invite, fromUserName])

  if (!invite) return null

  return (
    <Modal isOpen onClose={onDecline} title="Llamada entrante">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
          <FiPhoneCall aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium text-[var(--text)]">
            {fromUserName} te invita a una reunión
          </p>
          {invite.title && (
            <p className="text-sm text-[var(--muted)]">“{invite.title}”</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onDecline}
          className="px-4 py-2 rounded-lg border border-[var(--accent-soft)] text-[var(--text)] hover:bg-[var(--surface)]"
        >
          Rechazar
        </button>
        <button type="button" onClick={onAccept} className="btn-brand px-4 py-2" autoFocus>
          Contestar
        </button>
      </div>
    </Modal>
  )
}

export default IncomingCallModal
