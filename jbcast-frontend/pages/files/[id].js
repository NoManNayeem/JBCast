import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import {
  FiCheck,
  FiX,
  FiMail,
  FiArrowLeft,
  FiUser,
  FiSend,
  FiLoader
} from 'react-icons/fi'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function FileDetail() {
  const router = useRouter()
  const { id } = router.query
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState(null)
  const [sendingAll, setSendingAll] = useState(false)

  const getToken = () => localStorage.getItem('access_token')

  const fetchFileDetails = async () => {
    if (!id) return
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${id}/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setFile(res.data)
    } catch (err) {
      console.error('Failed to fetch file details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchFileDetails()
      const interval = setInterval(fetchFileDetails, 5000)
      return () => clearInterval(interval)
    }
  }, [id])

  const handleSend = async (recordId) => {
    setSendingId(recordId)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/email/${recordId}/send/`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      await fetchFileDetails()
    } catch (err) {
      console.error('Failed to send email:', err)
    } finally {
      setSendingId(null)
    }
  }

  const handleSendAll = async () => {
    if (!id) return
    setSendingAll(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${id}/send/`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      await fetchFileDetails()
    } catch (err) {
      console.error('Failed to send all emails:', err)
    } finally {
      setSendingAll(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-64px-64px)] pt-20 pb-20 bg-gray-100 px-4 text-center text-gray-500">
          <div className="flex justify-center items-center gap-2">
            <FiLoader className="animate-spin" />
            Loading...
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!file) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-64px-64px)] pt-20 pb-20 bg-gray-100 px-4 text-center text-gray-500">
          No data found.
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-64px-64px)] pt-20 pb-20 bg-gray-100 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                {file.title}
              </h1>
              <p className="text-sm text-gray-600">
                Uploaded at: {new Date(file.uploaded_at).toLocaleString()}
              </p>
            </div>
            <Link href="/dashboard" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition text-sm font-medium">
              <FiArrowLeft /> Back to Dashboard
            </Link>
          </div>

          {/* Send All */}
          <div className="mb-6">
            <button
              onClick={handleSendAll}
              disabled={sendingAll}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 shadow transition"
            >
              <FiMail />
              {sendingAll ? 'Sending All...' : 'Send All Emails'}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-200 text-left text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {file.email_records.map((rec) => (
                  <tr key={rec.id} className={`border-t ${!rec.is_sent ? 'bg-red-50' : ''} hover:bg-gray-50 transition`}>
                    <td className="p-3">{rec.name}</td>
                    <td className="p-3">{rec.email}</td>
                    <td className="p-3">{rec.subject || '-'}</td>
                    <td className="p-3 text-center">
                      {rec.is_sent ? (
                        <FiCheck className="text-green-600 mx-auto" />
                      ) : (
                        <FiX className="text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {rec.is_sent ? (
                        <span className="text-green-500 font-semibold">Sent</span>
                      ) : (
                        <button
                          onClick={() => handleSend(rec.id)}
                          disabled={sendingId === rec.id}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-1 transition"
                        >
                          <FiSend className="text-xs" />
                          {sendingId === rec.id ? 'Sending...' : 'Send'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
