import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const resolvedParams = await searchParams;
  const message = resolvedParams.message;

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6 flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Billshplit 💸</h1>
        <p className="text-gray-400">Sign in to track your debts</p>
      </div>

      <form className="flex flex-col gap-4">
        {message && (
          <p className="bg-rose-500/20 text-rose-400 p-4 rounded-xl text-center text-sm border border-rose-500/50">
            {message}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="fullName">
            Full Name (Only for Sign Up)
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="e.g. John Doe"
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            formAction={login}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Log In
          </button>
          <button
            formAction={signup}
            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-white/10 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Sign Up
          </button>
        </div>
      </form>
    </main>
  )
}
