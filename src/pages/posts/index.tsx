import { GetStaticProps } from "next";
import Head from "next/head";
import { createClient } from "../../services/prismic";
import styles from './styles.module.scss';
import { RichText } from 'prismic-dom';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updateAt: string;
}

interface PostProps {
  posts: Post[]
}

export default function Post({ posts }: PostProps) {
  return (
    <>
    <Head>
      <title>Posts | Ignews</title>
    </Head>

    <main className={styles.container}>
      <div className={styles.posts}>
        {
          posts.map(post => (
            <a key={post.slug} href="">
              <time>{post.updateAt}</time>
              <strong>{post.title}</strong>
              <p>{post.excerpt}</p>
            </a>
          ))
        }
      </div>
    </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = createClient({ previewData })

  const resp = await prismic.getAllByType('post')

  const posts = resp.map(post => ({
    slug: post.uid,
    title: RichText.asText(post.data.title),
    excerpt: post.data.content.find(content => content.type === 'heading2')?.text ?? '',
    updateAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }))

  return {
    props: {
      posts
    }
  }
}