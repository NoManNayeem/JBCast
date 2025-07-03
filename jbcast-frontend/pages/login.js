import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/token/`, {
        username: email,
        password,
      })

      // Set cookie with SameSite for middleware detection
      document.cookie = `token=${res.data.access}; path=/; SameSite=Lax`

      // Optional: store token in localStorage too
      localStorage.setItem('access_token', res.data.access)

      // Redirect after a short delay to ensure cookie is set
      setTimeout(() => {
        router.replace('/dashboard')
      }, 100)
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
          <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          <input
            type="text"
            placeholder="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
      <Footer />
    </>
  )
}
