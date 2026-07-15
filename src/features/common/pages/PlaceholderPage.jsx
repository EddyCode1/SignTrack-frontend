const PlaceholderPage = ({ title }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">{title}</h1>
      <p className="text-[var(--muted)] mt-4">Próximamente</p>
    </div>
  )
}

export default PlaceholderPage
