import Link from 'next/link'

type UserProps = {
  session: { user?: { name?: string | null } } | null
}

export default function ProfilePage({ session }: UserProps) {
    return (
    <main>     
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
            {/* profile image */}
            <h2 id="hero-title">{session?.user?.name}</h2>
            <p>
        <br/><br/>Quests created: {/*# of posts created by user*/} &emsp; Quests compeleted: {/*# of posts completed by user*/}</p>
        </div>
      </section>
    </main>
    )
}