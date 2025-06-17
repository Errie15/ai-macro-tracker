'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Test Sida
          </h1>
          <p className="text-gray-700">
            Om du ser denna sida fungerar Next.js och Tailwind korrekt!
          </p>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>
          <div className="space-y-2">
            <p className="text-green-600">✅ Next.js fungerar</p>
            <p className="text-green-600">✅ Tailwind CSS fungerar</p>
            <p className="text-green-600">✅ Komponenter renderas</p>
          </div>
        </div>
      </div>
    </div>
  );
} 