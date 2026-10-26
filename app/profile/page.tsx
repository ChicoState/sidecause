import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { prisma } from '../../lib/prisma'
import { getProfileImageOptions } from '../../lib/profile-images'
import ProfileView from './ProfileView'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      avatarId: true,
      createdAt: true,
      description: true,
      displayName: true,
      location: true,
    },
  })
  const imageOptions = await getProfileImageOptions()

  return (
    <ProfileView
      avatarId={user?.avatarId ?? imageOptions[0].id}
      imageOptions={imageOptions}
      memberSince={user?.createdAt}
      name={user?.displayName ?? session.user.name}
      location={user?.location}
      description={user?.description}
    />
  )
}
