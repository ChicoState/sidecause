export default function HomePage() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
          <p className="eyebrow">Sidecause</p>
          <h1 id="hero-title">Small acts can move a community forward.</h1>
          <p className="hero__lede">
            Sidecause will help neighbors find practical ways to contribute
            their time, from a one-hour errand to a weekend project.
          </p>
          <p className="hero__note">
            The community board is being built. Check back soon to browse
            opportunities or share one of your own.
          </p>
        </div>
      </section>

      <section className="principles" aria-labelledby="principles-title">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2 id="principles-title">A clear path from need to impact.</h2>
        </div>
        <ol className="principles__list">
          <li>
            <span aria-hidden="true">01</span>
            <h3>Find a cause</h3>
            <p>Browse opportunities that need a neighbor’s help.</p>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <h3>Make a commitment</h3>
            <p>Claim one task at a time and know exactly what is needed.</p>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <h3>See it through</h3>
            <p>Mark the work finished so the community can see progress.</p>
          </li>
        </ol>
      </section>
    </main>
  )
}
