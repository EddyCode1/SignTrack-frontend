const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-lg shadow-lg max-w-md w-full border border-[var(--accent-soft)]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--accent-soft)]">
          <h2 className="text-xl font-semibold text-[var(--text)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
