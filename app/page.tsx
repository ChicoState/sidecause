import Navbar from './Navbar'
export default function HomePage() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
          <p className="eyebrow">SideCause</p>
          <h2 id="hero-title">Find community service projects and level up!</h2>
          <p className="hero__lede">
            SideCause is a community post board for posting and completing community service in your neighborhood.
          </p>
        </div>
      </section>

      <section className="principles" aria-labelledby="principles-title">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
        </div>
        <ol className="principles__list">
          <li>
            <span aria-hidden="true">01</span>
            <h3>Post a Quest!</h3>
            <p>Users can share work that needs to be done.</p>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <h3>Accept a Quest!</h3>
            <p>Users can accept work from the community board.</p>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <h3>Level Up!</h3>
            <p>Once complete, earn XP and level up.</p>
          </li>
        </ol>
      </section>
    </main>
  )
}
