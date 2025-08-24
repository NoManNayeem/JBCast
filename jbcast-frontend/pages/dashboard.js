import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { MdUploadFile, MdTitle } from 'react-icons/md'
import { FaTrashAlt, FaPaperPlane, FaInfoCircle, FaCloudUploadAlt } from 'react-icons/fa'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Dashboard() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [sendingId, setSendingId] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [counts, setCounts] = useState({}) // { [fileId]: {sent, total} }
  const fileInputRef = useRef(null)
  const router = useRouter()

  const API = process.env.NEXT_PUBLIC_API_BASE_URL
  const getToken = () => localStorage.getItem('access_token')
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API}/api/files/`, { headers: authHeader() })
      const list = res.data || []
      setFiles(list)
      // Backend now includes sent_count & total_count
      const map = {}
      list.forEach((f) => {
        map[f.id] = {
          sent: typeof f.sent_count === 'number' ? f.sent_count : 0,
          total: typeof f.total_count === 'number' ? f.total_count : 0,
        }
      })
      setCounts(map)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return
    const formData = new FormData()
    formData.append('title', title)
    formData.append('file', file)
    try {
      setUploading(true)
      await axios.post(`${API}/api/upload/`, formData, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      })
      setTitle('')
      setFile(null)
      await fetchFiles()
    } catch (err) {
      console.error('Upload error:', err)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    try {
      await axios.delete(`${API}/api/files/${fileId}/delete/`, { headers: authHeader() })
      const next = files.filter((f) => f.id !== fileId)
      setFiles(next)
      const updatedCounts = { ...counts }
      delete updatedCounts[fileId]
      setCounts(updatedCounts)
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete file.')
    }
  }

  const handleSendAll = async (fileId) => {
    if (!confirm('Are you sure you want to send all emails?')) return
    try {
      setSendingId(fileId)
      await axios.post(`${API}/api/files/${fileId}/send/`, {}, { headers: authHeader() })
      alert('Bulk send triggered.')
      // Re-fetch to refresh counts (sending is async server-side)
      setTimeout(() => fetchFiles(), 1500)
    } catch (err) {
      console.error('Send all failed:', err)
      alert('Failed to initiate sending.')
    } finally {
      setSendingId(null)
    }
  }

  const goToDetail = (id) => router.push(`/files/${id}`)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const isAllowedFile = (f) => {
    if (!f) return false
    const name = (f.name || '').toLowerCase()
    return name.endsWith('.csv') || name.endsWith('.xls') || name.endsWith('.xlsx')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0]
      if (!isAllowedFile(dropped)) {
        alert('Only .csv, .xls, and .xlsx files are allowed.')
        return
      }
      setFile(dropped)
    }
  }

  const triggerFileBrowse = () => fileInputRef.current?.click()

  const canSendFor = (fid) => {
    const c = counts[fid] || { sent: 0, total: 0 }
    if (c.total === 0) return false // no recipients
    return c.sent < c.total // only if some emails remain
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-64px-64px)] pt-20 pb-20 bg-gray-100 px-4">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MdUploadFile className="text-blue-600 text-4xl" />
            File Management
          </h1>

          {/* Upload Card */}
          <form
            onSubmit={handleUpload}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
              <div className="flex items-center gap-2">
                <FaCloudUploadAlt className="text-2xl" />
                <p className="text-lg font-semibold">Upload Recipients File</p>
              </div>
              <p className="text-white/90 text-sm mt-1">
                Accepts <span className="font-medium">.csv</span>, <span className="font-medium">.xls</span>,{' '}
                <span className="font-medium">.xlsx</span>. Optional column:{' '}
                <span className="font-medium">Attachments</span> (comma / semicolon / newline separated URLs).
              </p>
            </div>

            {/* Body */}
            <div className="p-6 grid gap-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Title */}
                <div className="md:col-span-1">
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <MdTitle className="text-blue-600 text-xl" />
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., JB CAST Wave 1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Dropzone */}
                <div
                  className={`md:col-span-1 relative rounded-xl transition border-2 ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300 bg-gray-50'
                  } flex flex-col items-center justify-center text-center px-4 py-10 cursor-pointer group`}
                  onClick={triggerFileBrowse}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerFileBrowse()}
                >
                  <MdUploadFile className={`text-6xl mb-2 ${dragActive ? 'text-blue-600' : 'text-blue-500'} group-hover:scale-105 transition`} />
                  <p className="text-sm text-gray-700">
                    {file ? (
                      <>
                        <span className="font-semibold">{file.name}</span>
                        {file.size ? <span className="text-gray-500"> • {(file.size / (1024 * 1024)).toFixed(2)} MB</span> : null}
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">Drag &amp; drop</span> your file here or{' '}
                        <span className="text-blue-600 underline">browse</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 25MB • Keep headers: <strong>Name</strong>, <strong>Email</strong>, <strong>Subject</strong>,{' '}
                    <strong>Body</strong>, <strong>Attachments</strong> (optional)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .xls, .xlsx"
                    onChange={(e) => {
                      const chosen = e.target.files?.[0]
                      if (chosen && !isAllowedFile(chosen)) {
                        alert('Only .csv, .xls, and .xlsx files are allowed.')
                        e.target.value = ''
                        return
                      }
                      setFile(chosen || null)
                    }}
                    className="hidden"
                    required={!file}
                  />
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex flex-col gap-3 justify-end">
                  <button
                    type="submit"
                    disabled={uploading || !file || !title}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow"
                  >
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                  {file ? (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 border"
                    >
                      Remove File
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Format Helper */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">CSV / Excel format</p>
                <ul className="text-sm text-gray-700 list-disc pl-5 mb-3">
                  <li>Required columns: <strong>Name</strong>, <strong>Email</strong>, <strong>Subject</strong>, <strong>Body</strong></li>
                  <li>Optional column: <strong>Attachments</strong> — one or more URLs separated by comma, semicolon, or newline</li>
                  <li>Example rows below (quotes are OK):</li>
                </ul>
                <pre className="text-xs bg-white border border-gray-200 rounded p-3 overflow-x-auto">
{`Name,Email,Subject,Body,Attachments
"Jane Doe",jane@example.com,"Welcome to JBC","Hello Jane,\\nYour schedule is attached.","https://example.com/guide.pdf"
"John Smith",john@example.com,,"Hello John","https://example.com/info.pdf; https://drive.google.com/file/d/FILE_ID/view"`}
                </pre>
              </div>
            </div>
          </form>

          {/* Files Table */}
          {loading ? (
            <p className="text-center text-gray-600">Loading…</p>
          ) : files.length === 0 ? (
            <p className="text-center text-gray-500 italic">No files uploaded yet.</p>
          ) : (
            <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-max w-full text-sm text-gray-700">
                <thead className="bg-gray-200 text-left text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3 whitespace-nowrap">Title</th>
                    <th className="p-3 whitespace-nowrap">Uploaded At</th>
                    <th className="p-3 whitespace-nowrap">Sent</th>
                    <th className="p-3 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => {
                    const c = counts[f.id] || { sent: 0, total: 0 }
                    const { sent, total } = c
                    const pct = total > 0 ? Math.round((sent / total) * 100) : 0
                    const allSent = total > 0 && sent >= total
                    const noRecipients = total === 0
                    const btnDisabled = sendingId === f.id || allSent || noRecipients
                    const btnLabel = sendingId === f.id
                      ? 'Sending…'
                      : noRecipients
                      ? 'No Recipients'
                      : allSent
                      ? 'All Sent'
                      : 'Send All'

                    return (
                      <tr key={f.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium whitespace-nowrap">{f.title}</td>
                        <td className="p-3 whitespace-nowrap">{new Date(f.uploaded_at).toLocaleString()}</td>
                        <td className="p-3 whitespace-nowrap">
                          {`${sent}/${total}`}
                          <div className="mt-1 w-28 h-2 bg-gray-200 rounded">
                            <div
                              className={`h-2 rounded transition-all ${allSent ? 'bg-green-600' : 'bg-green-500'}`}
                              style={{ width: `${pct}%` }}
                              aria-label={`Progress ${pct}%`}
                            />
                          </div>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap space-x-2">
                          <button
                            onClick={() => goToDetail(f.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            <FaInfoCircle className="text-xs" /> Details
                          </button>
                          <button
                            onClick={() => handleSendAll(f.id)}
                            disabled={btnDisabled}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded text-white ${
                              btnDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            <FaPaperPlane className="text-xs" /> {btnLabel}
                          </button>
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <FaTrashAlt className="text-xs" /> Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
