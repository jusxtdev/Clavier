import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 text-center">
      <h1 className="text-6xl font-bold text-stone-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-stone-900 mb-4">Page Not Found</h2>
      <p className="text-stone-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link
        to="/"
        className="inline-block bg-stone-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-stone-800"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;