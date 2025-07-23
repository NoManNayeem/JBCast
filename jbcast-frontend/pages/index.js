import Link from 'next/link'
import { MdEmail } from 'react-icons/md'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center justify-center px-6 py-20 text-gray-800">
        <div className="text-center space-y-6 max-w-2xl animate-fade-in">
          {/* Branding Icon & Title */}
          <div className="flex justify-center items-center space-x-3">
            <MdEmail className="text-5xl text-blue-600 drop-shadow-md" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Welcome to <span className="text-blue-600">JBCast</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-gray-600 italic">
            Powered by{' '}
            <a
              href="https://www.jbc-ltd.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 font-semibold underline hover:text-blue-900"
            >
              JB Connect Ltd
            </a>
          </p>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-700">
            Secure, efficient, and scalable communication workflows — built for modern teams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 mt-8">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow transition duration-200"
            >
              Login to Dashboard
            </Link>
            <Link
              href="/register"
              className="border border-blue-600 hover:bg-blue-100 text-blue-600 font-medium px-6 py-3 rounded-xl shadow-sm transition duration-200"
            >
              Create an Account
            </Link>
          </div>

          {/* JB Connect Logo */}
          <div className="mt-10 flex justify-center">
            <img
              src="https://storage.googleapis.com/studio-design-asset-files/projects/G3qbXNQgWJ/s-300x86_3ed2a39a-fba6-45f6-82a5-8c05f0166c5f.svg"
              alt="JB Connect Logo"
              className="h-12 md:h-14"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
