import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMenu, FiSearch } from 'react-icons/fi'
import useAuthStore from '../../shared/stores/useAuthStore'
import useDebouncedValue from '../../shared/hooks/useDebouncedValue'
import { getDirectory } from '../../shared/api/services/userService'
import { getConversations, createConversation } from '../../shared/api/services/chatService'
import GlobalSearchResults from './GlobalSearchResults'

const AppHeader = ({ onMenuClick, title = 'SignTrack' }) => {
  const user = useAuthStore((state) => state.user)
  const currentUserId = user?.id || user?._id
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [people, setPeople] = useState([])
  const [chats, setChats] = useState([])
  const debouncedQuery = useDebouncedValue(query, 300)

  useEffect(() => {
    const term = debouncedQuery.trim()
    if (!term) {
      setPeople([])
      setChats([])
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([getDirectory(term), getConversations()])
      .then(([directory, conversations]) => {
        if (cancelled) return
        const lower = term.toLowerCase()
        setPeople(directory.filter((p) => p._id !== currentUserId))
        setChats(
          conversations.filter((c) => (c.title || '').toLowerCase().includes(lower))
        )
      })
      .catch(() => {
        if (!cancelled) {
          setPeople([])
          setChats([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery, currentUserId])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const resetSearch = () => {
    setQuery('')
    setOpen(false)
  }

  const handlePickPerson = async (person) => {
    try {
      const chat = await createConversation({ targetUserId: person._id })
      resetSearch()
      navigate(`/dashboard/chats/${chat.id}`)
    } catch {
      /* el usuario puede reintentar desde Contactos si falla */
    }
  }

  const handlePickChat = (chat) => {
    resetSearch()
    navigate(`/dashboard/chats/${chat.id}`)
  }

  const initials = (user?.nombre || user?.email || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="app-header__menu md:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <FiMenu size={22} />
        </button>
        <h2 className="app-header__title">{title}</h2>
      </div>

      <div className="app-header__search" ref={searchRef}>
        <FiSearch className="app-header__search-icon" size={18} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="Buscar en SignTrack..."
          className="app-header__search-input"
          aria-label="Buscar"
        />
        {open && query.trim() && (
          <GlobalSearchResults
            loading={loading}
            people={people}
            chats={chats}
            onPickPerson={handlePickPerson}
            onPickChat={handlePickChat}
          />
        )}
      </div>

      <div className="app-header__user">
        <div className="app-header__avatar" title={user?.email || ''}>
          {initials}
        </div>
        <div className="app-header__user-meta hidden sm:block">
          <span className="app-header__user-name">{user?.nombre || 'Usuario'}</span>
          <span className="app-header__user-role">{user?.rol?.replace('_ROLE', '') || ''}</span>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
