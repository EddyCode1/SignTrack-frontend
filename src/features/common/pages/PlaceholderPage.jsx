import PageHeader from '../../../shared/components/PageHeader'

const PlaceholderPage = ({ title, description = 'Esta sección estará disponible pronto.' }) => {
  return (
    <div className="placeholder-page">
      <PageHeader title={title} subtitle={description} />
      <div className="placeholder-page__card animate-stagger-in">
        <div className="placeholder-page__pulse" aria-hidden="true" />
        <p className="text-[var(--muted)]">Estamos preparando una experiencia moderna para esta área.</p>
      </div>
    </div>
  )
}

export default PlaceholderPage
