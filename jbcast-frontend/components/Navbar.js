import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  MdHome,
  MdDashboard,
  MdLogin,
  MdAppRegistration,
  MdLogout,
  MdMenu,
  MdClose,
  MdInfo
} from 'react-icons/md'

export default function Navbar() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const checkAuth = () => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
    setIsAuthenticated(!!token)
  }

  useEffect(() => {
    checkAuth()

    const handleRouteChange = () => {
      checkAuth()
      setMenuOpen(false)
      setShowInfo(false)
    }
    router.events.on('routeChangeComplete', handleRouteChange)

    const visibilityHandler = () => checkAuth()
    document.addEventListener('visibilitychange', visibilityHandler)
    window.addEventListener('focus', checkAuth)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      document.removeEventListener('visibilitychange', visibilityHandler)
      window.removeEventListener('focus', checkAuth)
    }
  }, [router.events])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    document.cookie = 'token=; Max-Age=0; path=/;'
    router.push('/login')
  }

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2 hover:text-blue-400 transition">
            <MdHome className="text-2xl" />
            JBCast
          </Link>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-white hover:text-blue-400 transition"
            title="About this system"
          >
            <MdInfo className="text-xl" />
          </button>

          {/* Info Message */}
          {showInfo && (
            <div className="absolute top-12 left-2 bg-white text-gray-900 text-sm px-4 py-2 rounded shadow-md z-50 w-64">
              <span className="font-medium">Contact:</span> Nayeem and/or Ayan for maintenance.
            </div>
          )}
        </div>

        <button
          className="md:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <MdClose className="w-6 h-6" /> : <MdMenu className="w-6 h-6" />}
        </button>

        <div className="hidden md:flex space-x-6 items-center">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-400 transition flex items-center gap-1">
                <MdDashboard className="text-lg" />
                Dashboard
              </Link>
              <button onClick={handleLogout} className="hover:text-red-400 transition flex items-center gap-1">
                <MdLogout className="text-lg" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-400 transition flex items-center gap-1">
                <MdLogin className="text-lg" />
                Login
              </Link>
              <Link href="/register" className="hover:text-blue-400 transition flex items-center gap-1">
                <MdAppRegistration className="text-lg" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-gray-900 z-50 transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-start p-6 space-y-4 pt-20">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-400 text-white text-lg transition flex items-center gap-2">
                <MdDashboard />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-red-400 text-white text-lg transition flex items-center gap-2"
              >
                <MdLogout />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-400 text-white text-lg transition flex items-center gap-2">
                <MdLogin />
                Login
              </Link>
              <Link href="/register" className="hover:text-blue-400 text-white text-lg transition flex items-center gap-2">
                <MdAppRegistration />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
