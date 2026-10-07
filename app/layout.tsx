import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'
import Navbar from './Navbar'
import { auth } from '../auth'

export default async function RootLayout({

export const metadata: Metadata = {
  title: 'SideCause',
  description:
    'Complete community service projects and level up!',
}

const navLinks = [
  { text: 'SideCause', url: '/' },
  { text: 'Posts', url: '/posts' },
  { text: 'Login', url: '/login' }
];

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth()

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
