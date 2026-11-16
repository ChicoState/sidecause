import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '../../../auth'
import { CreatePostForm } from './CreatePostForm'
import styles from './create.module.css'

export default async function NewPostPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <main className={styles.page}>
      <article className={styles.formPanel}>
        <Link className={styles.backLink} href="/posts">
          <span aria-hidden="true">←</span> Back to posts
        </Link>
        <h1 className={styles.pageTitle}>Create a post</h1>
        <CreatePostForm accountEmail={session.user.email ?? ''} />
      </article>
    </main>
  )
}
