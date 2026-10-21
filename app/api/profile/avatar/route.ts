import { NextResponse } from 'next/server'

import { auth } from '../../../../auth'
import { prisma } from '../../../../lib/prisma'
import { isProfileImageId } from '../../../../lib/profile-images'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Invalid request body' } },
      { status: 400 },
    )
  }

  const avatarId =
    typeof body === 'object' && body !== null && 'avatarId' in body
      ? body.avatarId
      : undefined

  if (typeof avatarId !== 'string' || !(await isProfileImageId(avatarId))) {
    return NextResponse.json(
      { error: { code: 'INVALID_AVATAR', message: 'Unknown profile image' } },
      { status: 422 },
    )
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { avatarId },
  })

  return NextResponse.json({ avatarId })
}
