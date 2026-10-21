import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'
import Navbar from './Navbar'
import { auth } from '../auth'
import { prisma } from '../lib/prisma'
import { getProfileImageOptions } from '../lib/profile-images'

export const metadata: Metadata = {
  title: 'SideCause',
  description: 'Complete community service projects and level up!',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth()
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { avatarId: true },
      })
    : null
  const imageOptions = user ? await getProfileImageOptions() : []
  const avatar = imageOptions.find((image) => image.id === user?.avatarId)

  return (
    <html lang="en">
      <body>
        <div>
          <Navbar avatar={avatar} session={session} />
        </div>
        {children}
      </body>
    </html>
  )
}
