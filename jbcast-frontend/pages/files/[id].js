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
  FiLoader,
  FiPaperclip,
  FiEye,
  FiExternalLink,
  FiXCircle
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

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewType, setPreviewType] = useState(null) // 'image' | 'pdf' | 'external'

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

  // ---------- Attachment preview helpers ----------
  const isImageUrl = (url) => {
    if (!url) return false
    const clean = url.split('?')[0].toLowerCase()
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(clean)
  }

  const isPdfUrl = (url) => {
    if (!url) return false
    const clean = url.split('?')[0].toLowerCase()
    return clean.endsWith('.pdf')
  }

  const isDriveUrl = (url) => {
    try {
      const h = new URL(url).hostname
      return h.includes('drive.google.com')
    } catch {
      return false
    }
  }

  const extractDriveId = (url) => {
    try {
      const u = new URL(url)
      // /file/d/<ID>/...
      const m = u.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/)
      if (m && m[1]) return m[1]
      // open?id=<ID> or uc?export=download&id=<ID>
      const id = u.searchParams.get('id')
      if (id) return id
    } catch {}
    return null
  }

  const pdfViewerUrl = (url) => {
    // Prefer Drive embed when possible
    if (isDriveUrl(url)) {
      const fid = extractDriveId(url)
      if (fid) return `https://drive.google.com/file/d/${fid}/preview`
      // Fallback to Docs viewer if ID not found
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`
    }
    // Direct PDF → use as-is in iframe
    if (isPdfUrl(url)) return url
    // Unknown but likely a PDF (or previewable) → Google Docs Viewer
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`
  }

  const guessPreviewType = (url) => {
    if (!url) return 'external'
    if (isImageUrl(url)) return 'image'
    if (isPdfUrl(url) || isDriveUrl(url)) return 'pdf'
    return 'external'
  }

  const openPreview = (url) => {
    setPreviewType(guessPreviewType(url))
    setPreviewUrl(url)
    setPreviewOpen(true)
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setPreviewUrl(null)
    setPreviewType(null)
  }

  // Close modal on ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closePreview()
    if (previewOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [previewOpen])

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
                  <th className="p-3">Attachments</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {file.email_records.map((rec) => {
                  const atts = Array.isArray(rec.attachments) ? rec.attachments : []
                  const hasAtts = atts.length > 0
                  return (
                    <tr key={rec.id} className={`border-t ${!rec.is_sent ? 'bg-red-50' : ''} hover:bg-gray-50 transition`}>
                      <td className="p-3">{rec.name}</td>
                      <td className="p-3">{rec.email}</td>
                      <td className="p-3">{rec.subject || '-'}</td>

                      {/* Attachments */}
                      <td className="p-3">
                        {!hasAtts ? (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                            <FiPaperclip /> No attachment
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {atts.map((url, idx) => (
                              <button
                                key={`${rec.id}-att-${idx}`}
                                onClick={() => openPreview(url)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                title={url}
                              >
                                <FiEye />
                                Preview {idx + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        {rec.is_sent ? (
                          <FiCheck className="text-green-600 mx-auto" />
                        ) : (
                          <FiX className="text-red-600 mx-auto" />
                        )}
                      </td>

                      {/* Actions */}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closePreview}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-5xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FiPaperclip className="text-blue-600" />
                Attachment Preview
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                aria-label="Close preview"
              >
                <FiXCircle size={20} />
              </button>
            </div>

            <div className="p-4">
              {previewType === 'image' && (
                <div className="w-full flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Attachment preview"
                    className="max-h-[70vh] rounded shadow"
                  />
                </div>
              )}

              {previewType === 'pdf' && (
                <iframe
                  title="PDF preview"
                  src={pdfViewerUrl(previewUrl)}
                  className="w-full h-[80vh] rounded border"
                />
              )}

              {previewType === 'external' && (
                <div className="text-center text-gray-700">
                  <p className="mb-4">
                    This file type can’t be previewed here. You can open it in a new tab:
                  </p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <FiExternalLink />
                    Open Attachment
                  </a>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end">
              <a
                href={previewUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-black"
              >
                <FiExternalLink />
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
