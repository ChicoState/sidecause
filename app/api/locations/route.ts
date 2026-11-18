import { NextResponse } from 'next/server'

import { auth } from '../../../auth'
import { normalizeLocationName } from '../../../lib/geomelon'
import { prisma } from '../../../lib/prisma'

const resultLimit = 10

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } },
      { status: 401 },
    )
  }

  const query = new URL(request.url).searchParams.get('q') ?? ''
  if (query.length > 100) {
    return NextResponse.json(
      { error: { code: 'INVALID_QUERY', message: 'Query is too long' } },
      { status: 400 },
    )
  }

  const normalizedQuery = normalizeLocationName(query)
  if (normalizedQuery.length < 2) {
    return NextResponse.json({ locations: [] })
  }

  const locations = await prisma.location.findMany({
    where: { normalizedName: { startsWith: normalizedQuery } },
    orderBy: [{ kind: 'asc' }, { name: 'asc' }],
    select: { id: true, kind: true, name: true, regionName: true },
    take: resultLimit,
  })

  return NextResponse.json({ locations })
}
