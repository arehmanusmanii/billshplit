export default function Home() {
  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Billshplit 💸</h1>
        <div className="w-10 h-10 bg-gray-700 rounded-full border border-white/10" />
      </header>

      {/* Balance Card - The "Pro" Look */}
      <div className="bg-gray-800 p-6 rounded-3xl border border-white/10 shadow-xl mb-6">
        <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">You are owed</p>
        <p className="text-4xl font-bold text-emerald-400">$45.00</p>
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Parties</h2>
      <div className="space-y-4">
        {/* Placeholder Party Item */}
        <div className="bg-gray-800/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
          <div>
            <p className="font-medium">Pizza Night 🍕</p>
            <p className="text-sm text-gray-500">3 members • Friday</p>
          </div>
          <span className="text-emerald-400 font-mono">+$15.00</span>
        </div>
      </div>
    </main>
  );
}
