"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, LogOut } from "lucide-react"
import { signout } from "@/app/login/actions"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-black/[0.06] safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around px-6 py-3">

        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            pathname === "/" ? "text-black" : "text-gray-400 hover:text-black"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          href="/friends"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            pathname === "/friends" ? "text-black" : "text-gray-400 hover:text-black"
          )}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Friends</span>
        </Link>

        <form action={signout}>
          <button
            type="submit"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-black transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium">Sign Out</span>
          </button>
        </form>

      </div>
    </nav>
  )
}
