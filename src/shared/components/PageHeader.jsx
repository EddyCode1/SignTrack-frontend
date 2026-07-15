import usePageEnter from '../hooks/usePageEnter'

const PageHeader = ({ title, subtitle, action }) => {
  const visible = usePageEnter()

  return (
    <header
      className={`page-header ${visible ? 'page-header--visible' : ''}`}
    >
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  )
}

export default PageHeader
