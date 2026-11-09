import Link from 'next/link'

import { auth } from '../../auth'
import { PostsList } from './PostsList'
import { getPublicPostCards } from './post-data'
import styles from './posts.module.css'

export default async function PostsPage() {
  const [posts, session] = await Promise.all([getPublicPostCards(), auth()])

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
