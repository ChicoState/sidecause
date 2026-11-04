import { PostsList } from './PostsList'
import { getPublicPostCards } from './post-data'
import styles from './posts.module.css'

export default async function PostsPage() {
  const posts = await getPublicPostCards()

  return (
    <main className={styles.postsPage}>
      <section className={styles.postsBoard} aria-labelledby="posts-title">
        <h1 className={styles.postsTitle} id="posts-title">
          Posts
        </h1>
        <div className={styles.controls} aria-label="Post browsing controls">
          <button disabled type="button">
            Filters
          </button>
          <button disabled type="button">
            Chico, CA
          </button>
        </div>
        <div className={styles.listViewport}>
          <PostsList posts={posts} />
        </div>
      </section>
    </main>
  )
}
