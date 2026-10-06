import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-primary-500 mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        The restaurant management page or resource you are looking for does not exist or has been relocated.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-lg shadow-primary-600/30 transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
