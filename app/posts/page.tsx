import Link from 'next/link'

import { auth } from '../../auth'
import { getPublicPostCards } from './post-data'
import { PostsBrowser } from './PostsBrowser'
import styles from './posts.module.css'

export default async function PostsPage() {
  const [posts, session] = await Promise.all([getPublicPostCards(), auth()])

  return (
    <main className={styles.postsPage}>
      <section className={styles.postsBoard} aria-labelledby="posts-title">
        <h1 className={styles.postsTitle} id="posts-title">
          Posts
        </h1>
        <PostsBrowser posts={posts} />
      </section>
      {session?.user?.id ? (
        <Link className={styles.createPostButton} href="/posts/new">
          <span className={styles.createPostIcon} aria-hidden="true">
            +
          </span>
          <span>
            Create
            <br />
            Post
          </span>
        </Link>
      ) : null}
    </main>
  )
}
