import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'
import Navbar from './Navbar'
import { auth } from '../auth'

export const metadata: Metadata = {
  title: 'SideCause',
  description: 'Complete community service projects and level up!',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth()

  return (
    <html lang="en">
      <body>
        <div>
          <Navbar session={session} />
        </div>
        {children}
      </body>
    </html>
  )
}
