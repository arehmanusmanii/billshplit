export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Billshplit 💸</h1>
      
      {/* This is a simple card layout */}
      <div className="grid gap-4">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <p className="text-lg font-semibold">Friday Night Pizza</p>
          <p className="text-gray-400 text-sm">Total: $45.00</p>
        </div>
      </div>
    </main>
  )
}
