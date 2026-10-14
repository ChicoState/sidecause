import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { prisma } from '../../lib/prisma'

export default async function ProfilePage() {
    const session = await auth()
    if (!session?.user?.email) {
    redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
        displayName: true,
        createdAt: true,
        },
    })
    
    return (
    <main>     
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
            {/* profile image */}
            <h2 id="hero-title">{session?.user?.name}</h2>
            <p className="eyebrow">Member since: {user?.createdAt.toLocaleDateString()}</p>
            <p><br/><br/>Quests created: {/*# of posts created by user*/} &emsp; Quests compeleted: {/*# of posts completed by user*/}</p>
        </div>
      </section>
    </main>
    )
}