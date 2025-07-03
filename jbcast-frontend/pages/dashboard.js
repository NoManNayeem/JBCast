import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { MdUploadFile } from 'react-icons/md'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Dashboard() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const getToken = () => {
    const match = document.cookie.match(/token=([^;]+)/)
    return match ? match[1] : null
  }

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
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
          'Content-Type': 'multipart/form-data'
        }
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
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
    setFiles(files.filter(f => f.id !== fileId))
  } catch (err) {
    console.error('Delete failed:', err)
    alert('Failed to delete file.')
  }
}


  const goToDetail = (id) => {
    router.push(`/files/${id}`)  // ✅ Correct frontend route
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MdUploadFile className="text-blue-600 text-3xl" />
          Uploaded Files
        </h1>

        {/* Upload Section */}
        <form
          onSubmit={handleUpload}
          className="bg-white p-4 rounded shadow-md mb-8 flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0"
        >
          <input
            type="text"
            placeholder="File Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-3 py-2 border rounded w-full"
            required
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".csv, .xls, .xlsx"
            className="flex-1 w-full"
            required
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        {/* File List */}
        {loading ? (
          <p>Loading...</p>
        ) : files.length === 0 ? (
          <p>No files found.</p>
        ) : (
          <div className="bg-white shadow-md rounded overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Uploaded At</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-t">
                    <td className="p-3">{file.title}</td>
                    <td className="p-3">{new Date(file.uploaded_at).toLocaleString()}</td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => goToDetail(file.id)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Details
                      </button>
                      <button
                        disabled
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        Send All
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
