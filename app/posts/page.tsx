import { getPublicPostCards } from './post-data'
import { PostsBrowser } from './PostsBrowser'
import styles from './posts.module.css'

export default async function PostsPage() {
  const posts = await getPublicPostCards()

  return (
    <main className={styles.postsPage}>
      <section className={styles.postsBoard} aria-labelledby="posts-title">
        <h1 className={styles.postsTitle} id="posts-title">
          Posts
        </h1>
        <PostsBrowser posts={posts} />
      </section>
    </main>
  )
}
