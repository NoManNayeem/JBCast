import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { MdUploadFile, MdTitle } from 'react-icons/md'
import { FaTrashAlt, FaPaperPlane, FaInfoCircle } from 'react-icons/fa'
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
  const fileInputRef = useRef(null)
  const router = useRouter()

  const getToken = () => localStorage.getItem('access_token')

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      setFiles(res.data)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return

    const formData = new FormData()
    formData.append('title', title)
    formData.append('file', file)

    try {
      setUploading(true)
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload/`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      setTitle('')
      setFile(null)
      fetchFiles()
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${fileId}/delete/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      setFiles(files.filter(f => f.id !== fileId))
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete file.')
    }
  }

  const handleSendAll = async (fileId) => {
    if (!confirm('Are you sure you want to send all emails?')) return
    try {
      setSendingId(fileId)
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${fileId}/send/`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      alert('Emails sent successfully.')
      fetchFiles()
    } catch (err) {
      console.error('Send all failed:', err)
      alert('Failed to send emails.')
    } finally {
      setSendingId(null)
    }
  }

  const goToDetail = (id) => {
    router.push(`/files/${id}`)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const triggerFileBrowse = () => fileInputRef.current?.click()

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-64px-64px)] pt-20 pb-20 bg-gray-100 px-4">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MdUploadFile className="text-blue-600 text-4xl" />
            File Management
          </h1>

          <form
            onSubmit={handleUpload}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className="bg-white p-6 rounded-lg shadow mb-8 grid gap-4 md:grid-cols-3"
          >
            <div className="col-span-full md:col-span-1 relative">
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                <MdTitle className="text-blue-600 text-xl" />
                Title
              </label>
              <input
                type="text"
                placeholder="Enter file title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div
              className={`col-span-full md:col-span-1 border-2 ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'
              } rounded px-4 py-6 text-center cursor-pointer transition`}
              onClick={triggerFileBrowse}
            >
              <MdUploadFile className="mx-auto text-4xl text-blue-600 mb-2" />
              <p className="text-sm text-gray-700">
                {file ? file.name : 'Drag & drop your file here or click to upload'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xls, .xlsx"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                required={!file}
              />
            </div>

            <div className="col-span-full md:col-span-1 self-end">
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>

          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : files.length === 0 ? (
            <p className="text-center text-gray-500 italic">No files uploaded yet.</p>
          ) : (
            <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-max w-full text-sm text-gray-700">
                <thead className="bg-gray-200 text-left text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3 whitespace-nowrap">Title</th>
                    <th className="p-3 whitespace-nowrap">Uploaded At</th>
                    <th className="p-3 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium whitespace-nowrap">{file.title}</td>
                      <td className="p-3 whitespace-nowrap">{new Date(file.uploaded_at).toLocaleString()}</td>
                      <td className="p-3 text-center whitespace-nowrap space-x-2">
                        <button
                          onClick={() => goToDetail(file.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          <FaInfoCircle className="text-xs" /> Details
                        </button>
                        <button
                          onClick={() => handleSendAll(file.id)}
                          disabled={sendingId === file.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          <FaPaperPlane className="text-xs" />{' '}
                          {sendingId === file.id ? 'Sending...' : 'Send All'}
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <FaTrashAlt className="text-xs" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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
