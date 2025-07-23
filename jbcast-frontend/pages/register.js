import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { MdPersonAdd } from 'react-icons/md'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const isValidPassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(pwd)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!isValidPassword(password)) {
      setError(
        'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'
      )
      return
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register/`, {
        username,
        email,
        password,
      })
      router.push('/login')
    } catch (err) {
      setError('Failed to register. Please try again.')
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
              <MdPersonAdd className="text-4xl text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create your JBCast account</h2>
            <p className="text-sm text-gray-500">It’s protected and only to be used by JBC HR Team.</p>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded border border-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
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
              Register
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
