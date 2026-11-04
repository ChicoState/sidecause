import { auth } from '../../../../../auth'
import {
  joinBounty,
  withdrawFromBounty,
  type AttendanceResult,
} from '../../../../../lib/bounties/attendance'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await auth()
  const volunteerId = session?.user?.id
  if (!volunteerId) {
    return errorResponse(
      401,
      'UNAUTHENTICATED',
      'Sign in to join this opportunity.',
    )
  }

  const { id } = await params
  return resultResponse(joinBounty(id, volunteerId), 201)
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth()
  const volunteerId = session?.user?.id
  if (!volunteerId) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Sign in to withdraw.')
  }

  const { id } = await params
  return resultResponse(withdrawFromBounty(id, volunteerId), 200)
}

async function resultResponse(
  resultPromise: Promise<AttendanceResult>,
  successStatus: number,
): Promise<Response> {
  let result: AttendanceResult
  try {
    result = await resultPromise
  } catch {
    return errorResponse(
      500,
      'INTERNAL_ERROR',
      'We could not update your sign-up. Please try again.',
    )
  }

  if (!result.ok) {
    const status = result.code === 'BOUNTY_NOT_FOUND' ? 404 : 409
    return errorResponse(status, result.code, result.message)
  }

  return Response.json({ data: { success: true } }, { status: successStatus })
}

function errorResponse(
  status: number,
  code: string,
  message: string,
): Response {
  return Response.json({ error: { code, message } }, { status })
}
