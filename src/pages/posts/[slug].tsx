import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react"
import Head from "next/head"
import { RichText } from "prismic-dom"
import { createClient } from "../../services/prismic"

import styles from './post.module.scss';

type Post = {
  slug: string;
  title: string;
  content: string;
  updateAt: string;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return(
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updateAt}</time>
          <div 
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({req, params, previewData}) => {
  const session = await getSession({ req })
  const prismic = createClient({ previewData })
  const {slug} = params;

  if(!session?.activeSubscription) {
    return {
      redirect: {
        destination: `/posts/preview/${slug}`,
        permanent: false,
      }
    }
  }

  const resp = await prismic.getByUID('post', String(slug), {})

  const post = {
    slug,
    title: RichText.asText(resp.data.title),
    content: RichText.asHtml(resp.data.content),
    updateAt: new Date(resp.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30 // 30 minutos
  }
}
