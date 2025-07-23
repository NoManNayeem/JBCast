// components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center text-sm text-gray-600 py-4 mt-10 border-t">
      JBCast — Powered by{' '}
      <a
        href="https://www.jbc-ltd.com/en"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        JB Connect Ltd.
      </a>{' '}
      © {new Date().getFullYear()}
    </footer>
  )
}
