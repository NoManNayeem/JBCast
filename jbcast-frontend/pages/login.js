import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { MdLock } from 'react-icons/md'
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

      document.cookie = `token=${res.data.access}; path=/; SameSite=Lax`
      localStorage.setItem('access_token', res.data.access)

      router.replace('/dashboard').then(() => {
        window.location.reload()
      })
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50 px-4 py-16 text-gray-800">
        <style jsx>{`
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeInUp 0.8s ease-out;
          }
        `}</style>

        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md animate-fade-in space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <MdLock className="text-4xl text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Login to JBCast</h2>
            <p className="text-sm text-gray-500">Welcome back! Enter your credentials to continue.</p>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded border border-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
            >
              Login
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
