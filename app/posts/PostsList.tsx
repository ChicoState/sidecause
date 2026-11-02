import Image from 'next/image'
import Link from 'next/link'

import type { PostCardData } from './post-data'
import styles from './posts.module.css'

type PostsListProps = {
  posts: PostCardData[]
}

export function PostsList({ posts }: PostsListProps) {
  if (posts.length === 0) {
    return (
      <p className={styles.emptyState} role="status">
        No tasks are available right now.
      </p>
    )
  }

  return (
    <ul className={styles.postsList} aria-label="Posts">
      {posts.map((post) => (
        <li className={styles.postCard} key={post.id}>
          <article className={styles.postContent}>
            {post.imageUrl ? (
              <div className={styles.postImage}>
                <Image
                  alt={`${post.title} community task`}
                  className={styles.postImageAsset}
                  fill
                  unoptimized
                  sizes="(min-width: 48rem) 36vw, 100vw"
                  src={post.imageUrl}
                />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className={`${styles.postImage} ${styles.postImageFallback}`}
              >
                <span>Community task</span>
              </div>
            )}
            <div className={styles.postInfo}>
              <h2>{post.title}</h2>
              <p>{post.location}</p>
            </div>
            <Link
              aria-label={`More details about ${post.title}`}
              className={styles.detailsButton}
              href={`/posts/${encodeURIComponent(post.id)}`}
            >
              More details
            </Link>
          </article>
        </li>
      ))}
    </ul>
  )
}
