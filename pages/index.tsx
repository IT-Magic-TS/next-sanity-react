import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link';
import Header from '../components/Header';
import { sanityClient, urlFor } from '../sanity'
import { Post } from '../typings';

interface Props {
  posts: Post[]
}

export const getServerSideProps = async (props: Props) => {
  const query = `
  *[_type == 'post'] {
    _id,
    title, slug,
    author -> {
      name, image
    },
    description,
    mainImage,
    slug
  }
  `

  const posts = await sanityClient.fetch(query)

  return {
    props: {
      posts
    }
  }
}

export default function Home(props: Props){
  const {posts} = props
  console.log(posts)
  return (
    <div className='mx-auto max-w-7xl'>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <div className='flex items-center justify-between py-10 bg-yellow-400 border-black border-y lg:py-0'>
        <div className='px-10 space-y-5'>
          <h1 className='max-w-xl font-serif text-6xl'>
            <span className='underline decoration-black decoration-4'>Medium</span> is a place to write, read, and connect
          </h1>
          <h2>
            It's easy and free to post your thinking of any topic and connect with million of readers.
          </h2>
        </div>
        <img 
          className='hidden h-32 md:inline-flex lg:h-full'
          src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png" 
          alt="logo" 
        />
      </div>

      {/* Posts */}
      <div className='grid grid-cols-1 gap-3 p-2 sm:grid-cols-2 lg:grid-cols-3 md:gap-6 md:pd-6'>
        {
          posts.map(p => (
            <Link href={`/post/${p.slug.current}`} key={p._id}>
              <div className='overflow-hidden border rounded-lg cursor-pointer group'>
                <img 
                  className='object-cover w-full transition-transform duration-200 ease-in-out h-60 group-hover:scale-105' 
                  src={urlFor(p.mainImage).url()!} alt={p.title} 
                />
                <div className='flex justify-between p-5'>
                  <div>
                    <p className='text-lg font-bold'>{p.title}</p>
                    <p className='text-xs'>{p.description} by {p.author.name}</p>
                  </div>
                  <div className='w-1/4'>
                    <img className='float-right rounded-full w-14 h-14' src={urlFor(p.author.image).url()!} alt={p.author.name} />
                  </div>
                </div>
              </div>
            </Link>
          ))
        }
      </div>

    </div>
  )       
}

