export type BountyViewerAttendance = 'JOINED' | 'WITHDRAWN' | null

export type BountyVisibilityInput = {
  status: 'OPEN' | 'FULL' | 'FINISHED' | 'CANCELLED' | 'EXPIRED'
  deadline: Date
  posterId: string
  viewerId: string | null
  viewerAttendance: BountyViewerAttendance
  currentVolunteers: number
  maximumVolunteers: number
}

export function canViewBounty({
  status,
  deadline,
  posterId,
  viewerId,
  viewerAttendance,
  currentVolunteers,
  maximumVolunteers,
}: BountyVisibilityInput): boolean {
  const viewerIsPoster = viewerId !== null && posterId === viewerId
  const viewerIsAttendee = viewerAttendance === 'JOINED'
  const restrictedViewer = viewerIsPoster || viewerIsAttendee

  if (status === 'OPEN') {
    return deadline > new Date() && currentVolunteers < maximumVolunteers
  }
  if (status === 'FULL') return deadline > new Date() && restrictedViewer
  if (status === 'FINISHED') return restrictedViewer
  return false
}
