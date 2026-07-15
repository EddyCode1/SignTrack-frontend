const Table = ({ columns, data, onEdit, onDelete, actionLabels = {}, accent = false }) => {
  const editLabel = actionLabels.edit || 'Editar'
  const deleteLabel = actionLabels.delete || 'Eliminar'
  const rows = Array.isArray(data) ? data : []
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-[var(--bg)] border-b border-[var(--accent-soft)]">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-6 py-3 text-left text-sm font-semibold text-[var(--text)]"
            >
              {col.label}
            </th>
          ))}
          <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text)]">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row._id} className="border-b border-[var(--accent-soft)] hover:bg-[var(--surface)]">
            {columns.map((col, index) => (
              <td
                key={col.key}
                className={`px-6 py-4 text-[var(--text)] ${accent && index === 0 ? 'relative pl-8' : ''}`}
              >
                {accent && index === 0 ? (
                  <span className="absolute left-0 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-r-full bg-slate-900/20" aria-hidden="true" />
                ) : null}
                {col.key === 'notas'
                  ? row.notas || row.notes || row.reservation_history || row.description || row.details || '-'
                  : row[col.key] || '-'}
              </td>
            ))}
            <td className="px-6 py-4 flex gap-2">
              <button
                onClick={() => onEdit(row)}
                className="px-3 py-1 bg-[var(--primary-soft)] text-[var(--primary)] rounded hover:bg-[var(--primary)] hover:text-[var(--surface)] text-sm font-semibold transition"
              >
                {editLabel}
              </button>
              <button
                onClick={() => onDelete(row._id)}
                className="px-3 py-1 bg-[#ffe5e5] text-[#b02020] rounded hover:bg-[#f1c2c2] text-sm font-semibold transition"
              >
                {deleteLabel}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table