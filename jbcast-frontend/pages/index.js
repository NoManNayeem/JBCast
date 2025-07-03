import Link from 'next/link'
import { MdEmail } from 'react-icons/md'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-gray-800 px-4 py-16">
        <div className="flex items-center space-x-2 mb-4 animate-fade-in">
          <MdEmail className="text-4xl text-blue-600" />
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome to <span className="text-blue-600">JBCast</span>
          </h1>
        </div>
        <p className="mb-8 text-sm md:text-base text-gray-600 italic">
          MailBridge by JB
        </p>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full max-w-xs justify-center">
          <Link
            href="/login"
            className="text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-center border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition"
          >
            Register
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
