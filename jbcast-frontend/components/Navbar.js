import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/token=([^;]+)/);
    setIsAuthenticated(!!match);
  }, []);

  const handleLogout = () => {
    // Clear token cookie
      localStorage.removeItem('access_token');
      document.cookie = 'token=; Max-Age=0; path=/;';
    window.location.href = '/login';
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow">
      <Link href="/" className="text-xl font-semibold tracking-wide">JBCast</Link>
      <div className="flex space-x-4">
        {isAuthenticated ? (
          <>
            <Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-blue-400">Login</Link>
            <Link href="/register" className="hover:text-blue-400">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
