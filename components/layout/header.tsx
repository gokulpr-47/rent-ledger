'use client'

import { Menu } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card px-4 md:px-8 py-4 flex items-center gap-4">
      <button className="md:hidden p-2 hover:bg-muted rounded-lg">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1" />
      <div className="text-sm text-muted-foreground">
        Welcome to RentLedger
      </div>
    </header>
  )
}
