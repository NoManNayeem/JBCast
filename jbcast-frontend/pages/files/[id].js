// pages/files/[id].js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { FiCheck, FiX, FiMail } from 'react-icons/fi'
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

  const getToken = () => {
    const match = document.cookie.match(/token=([^;]+)/)
    return match ? match[1] : null
  }

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

  const handleSend = async (recordId) => {
    setSendingId(recordId)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/email/${recordId}/send/`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      fetchFileDetails()
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
      fetchFileDetails()
    } catch (err) {
      console.error('Failed to send all emails:', err)
    } finally {
      setSendingAll(false)
    }
  }

  useEffect(() => {
    if (id) fetchFileDetails()
  }, [id])

  if (loading) return <p className="p-6">Loading...</p>
  if (!file) return <p className="p-6">No data found.</p>

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{file.title}</h1>
            <p className="text-sm text-gray-600">
              Uploaded at: {new Date(file.uploaded_at).toLocaleString()}
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <button
            onClick={handleSendAll}
            disabled={sendingAll}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FiMail />
            {sendingAll ? 'Sending All...' : 'Send All Emails'}
          </button>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Sent</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {file.email_records.map((rec) => (
                <tr
                  key={rec.id}
                  className={`border-t ${!rec.is_sent ? 'bg-red-50' : ''}`}
                >
                  <td className="p-3">{rec.name}</td>
                  <td className="p-3">{rec.email}</td>
                  <td className="p-3">{rec.subject || '-'}</td>
                  <td className="p-3">
                    {rec.is_sent ? (
                      <FiCheck className="text-green-600" />
                    ) : (
                      <FiX className="text-red-600" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {rec.is_sent ? (
                      <span className="text-green-500 font-semibold">Sent</span>
                    ) : (
                      <button
                        onClick={() => handleSend(rec.id)}
                        disabled={sendingId === rec.id}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                      >
                        {sendingId === rec.id ? 'Sending...' : 'Send'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  )
}
