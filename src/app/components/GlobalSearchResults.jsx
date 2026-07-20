const GlobalSearchResults = ({ loading, people, chats, onPickPerson, onPickChat }) => {
  const hasResults = people.length > 0 || chats.length > 0

  return (
    <div className="card app-header__search-results shadow-md">
      {loading ? (
        <p className="p-4 text-sm text-[var(--muted)]">Buscando...</p>
      ) : !hasResults ? (
        <p className="p-4 text-sm text-[var(--muted)]">Sin resultados.</p>
      ) : (
        <>
          {people.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-[var(--muted)] uppercase">
                Personas
              </p>
              {people.map((person) => (
                <button
                  key={person._id}
                  type="button"
                  onClick={() => onPickPerson(person)}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--surface)] transition"
                >
                  <div className="font-medium text-sm">
                    {person.name} {person.surname}
                  </div>
                  <div className="text-xs text-[var(--muted)]">@{person.username}</div>
                </button>
              ))}
            </div>
          )}

          {chats.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-[var(--muted)] uppercase">
                Chats
              </p>
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onPickChat(chat)}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--surface)] transition"
                >
                  <div className="font-medium text-sm">
                    {chat.title || (chat.type === 'group' ? `Grupo ${chat.groupId}` : 'Chat directo')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default GlobalSearchResults
