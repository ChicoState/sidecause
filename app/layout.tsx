import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'
import Navbar from './Navbar'

export const metadata: Metadata = {
  title: 'SideCause',
  description: 'Complete community service projects and level up!',
}

const navLinks = [
  { text: 'SideCause', url: '/' },
  { text: 'Posts', url: '/' },
  { text: 'Login', url: '/' },
]

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div>
          <Navbar links={navLinks} />
        </div>
        {children}
      </body>
    </html>
  )
}
