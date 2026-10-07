import styles from './posts.module.css'

export type PostPreview = {
  id: string
  title: string
  location: string
}

type PostsListProps = {
  posts: PostPreview[]
}

export function PostsList({ posts }: PostsListProps) {
  if (posts.length === 0) {
    return (
      <p className={styles.emptyState} role="status">
        No posts
      </p>
    )
  }

  return (
    <ul className={styles.postsList} aria-label="Posts">
      {posts.map((post) => (
        <li className={styles.postCard} key={post.id}>
          <div>
            <h2>{post.title}</h2>
            <p>{post.location}</p>
          </div>
          <button disabled type="button">
            View details
          </button>
        </li>
      ))}
    </ul>
  )
}
