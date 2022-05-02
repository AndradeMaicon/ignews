import {GetStaticPaths, GetStaticProps } from "next"
import { useSession } from "next-auth/react";
import { route } from "next/dist/server/router";
import Head from "next/head"
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom"
import { useEffect } from "react";
import { createClient } from "../../../services/prismic"

import styles from '../post.module.scss';

type Post = {
  slug: string;
  title: string;
  content: string;
  updateAt: string;
}

interface PostPreviewProps {
  post: Post;
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if(session?.activeSubscription){
      router.push(`/posts/${post.slug}`)
    }
  }, [session])

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
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        <div className={styles.continueReading}>
          Wanna continue reading?
          <Link href="/">
            <a>Subscribe now 🤗</a>
          </Link>
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({params, previewData}) => {
  const prismic = createClient({ previewData })
  const {slug} = params;

  const resp = await prismic.getByUID('post', String(slug), {})

  const post = {
    slug,
    title: RichText.asText(resp.data.title),
    content: RichText.asHtml(resp.data.content.slice(0, 4)),
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
