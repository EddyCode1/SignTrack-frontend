const NAVBAR_TITLE = 'SignTrack'

const NavbarBlack = ({ onToggleSidebar }) => {
  return (
    <header className="shrink-0 border-b border-gray-800 py-4 px-6 bg-black">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-400 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white transition-all duration-200 font-bold text-lg"
          aria-label="Alternar menú lateral"
          title="Alternar menú"
        >
          ☰
        </button>

        <span className="text-gray-400 text-xs uppercase tracking-wider">
          {NAVBAR_TITLE}
        </span>
      </div>
    </header>
  )
}

export default NavbarBlack
