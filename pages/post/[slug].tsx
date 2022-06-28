import { GetStaticProps } from 'next';
import Header from '../../components/Header';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react';

interface Props {
  post: Post
}

interface IFormInput {
  _id: string
  name: string
  email: string
  comment: string
}


function Post({ post }: Props) {
  console.log(post);
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>()

  const [ submitted, setSubmitted ] = useState(false)

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log('Submited data: ', data)

    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(() => {
      console.log(data)
      setSubmitted(true)
    }).catch((err) => {
      console.log(err)
      setSubmitted(false)
    })
  }

  return (
    <main>
      <Header />
      {
        post.mainImage && (
          <img 
            className='object-cover w-full h-60' 
            src={urlFor(post.mainImage).url()!} alt={post.title} 
          />
        )
      }
      <article className='max-w-3xl p-5 mx-auto'>
        <h1 className='mt-10 mb-3 text-3xl'>{post.title}</h1>
        <h2 className='text-xl font-light text-gray-500'>{post.description}</h2>
        <div className='flex items-center space-x-2'>
          <img 
              className='w-10 h-10 rounded-full' 
              src={urlFor(post.author.image).url()!} alt={post.author.name} 
            />
            <p className='text-sm font-extralight'>
              Blog post by <span className='text-green-600'>{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}
            </p>
        </div>

        <div className='mt-10'>
          <PortableText 
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET} 
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={
              {
                h1: (props: any) => (
                  <h1 className='my-5 text-2xl font-bold' {...props} />
                ),
                h2: (props: any) => (
                  <h2 className='my-5 text-xl font-bold' {...props} />
                ),
                li: (props: any) => (
                  <li className='ml-4 list-disc' {...props} />
                ),
                link: (props: any) => (
                  <span className='block text-center'>
                    <a className='px-4 py-2 font-bold text-white bg-yellow-500 rounded shadow cursor-pointer hover:bg-yellow-400 focus:shadow-outline focus:outline-none' {...props} />
                  </span>
                )
              }
            }
          />
        </div>

      </article>

      <hr className='max-w-lg mx-auto my-5 border border-yellow-500' />

      {
        submitted ? (
          <div className='flex flex-col py-10 my-10 bg-yellow-500 mx-auto max-w-2xl text-white text-center'>
            <h3 className='text-3xl font-bold'>Thank you for submitting your comment!</h3>
            <p>Once it has been approved, it will appear bellow!</p>
          </div>
        ) : (
          <form className='flex flex-col max-w-2xl p-5 mx-auto mb-10' onSubmit={handleSubmit(onSubmit)}>
            <h3 className='text-sm text-yellow-500' >Enjoyed this article?</h3>
            <h4 className='text-3xl font-bold'>Leave a comment below!</h4>
            <hr className='py-3 mt-2' />

            <input
              type="hidden"
              {...register('_id')}
              name='_id'
              value={post._id}
            />

            <label className='block mb-5'>
              <span className='text-gray-700'>Name</span>
              <input
                className='block w-full px-3 py-2 mt-1 border rounded shadow outline-none form-input ring-yellow-500 focus:ring'
                type="text" 
                placeholder='John Appleseed' 
                {...register('name', {required: true})}
              />
            </label>
            <label className='block mb-5'>
              <span className='text-gray-700'>Email</span>
              <input
                className='block w-full px-3 py-2 mt-1 border rounded shadow outline-none form-input ring-yellow-500 focus:ring'
                type="email" 
                placeholder='abc@afna.com' 
                {...register('email', {required: true})}
              />
            </label>
            <label className='block mb-5'>
              <span className='text-gray-700'>Comment</span>
              <textarea 
                className='block w-full px-3 py-2 mt-1 border rounded shadow outline-none form-textarea ring-yellow-500 focus:ring'
                rows={8} 
                placeholder='Comment...' 
                {...register('comment', {required: true, minLength: 20})}
              />
            </label>

            {/* errors will eturn when field validations fails */}
            <div className='p-5'>
              {
                errors.name && (<p className='text-red-500'>N{errors.name.message}</p>)
              }
              {
                errors.email && (<p className='text-red-500'>E{errors.email.message}</p>)
              }
              {
                errors.comment && (<p className='text-red-500'>C{errors.comment.message}</p>)
              }
            </div>
            <input 
              className='px-4 py-2 font-bold text-white bg-yellow-500 rounded shadow cursor-pointer hover:bg-yellow-400 focus:shadow-outline focus:outline-none'
              type="submit" 
              value='Submit'
            /> 
          </form>
        )
      }

      {/* Comments */}
      {
        post.comments.length > 0 && (
          <div className='flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2'>
            <h3 className='text-4xl'>Comments</h3>
            <hr className='pb-2' />

            {
              post.comments.map(c => (
                <div key={c._id}>
                  <p>
                    <span className='text-yellow-500'>{c.name}: </span><span>{c.comment}</span>
                  </p>
                </div>
              ))
            }

          </div>
        )
      }


    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `
    *[_type == 'post'] {
      _id,
      slug {
        current
      }
    }
  `
  const posts = await sanityClient.fetch(query)
  
  const paths = posts.map((p: Post) => ({
    params: {
      slug: p.slug.current
    }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps =async ({params}) => {
  const query = `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      _createdAt,
      title,
      author -> {
        name,
        image
      },
      'comments': *[
        _type == "comment" && 
        post._ref == ^._id && 
        approved == true
      ],
      description,
      mainImage,
      slug,
      body
    }
  `

  const post = await sanityClient.fetch(query, {
    slug: params?.slug
  })

  if (!post) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      post
    },
    revalidate: 3600 // after 60 seconds, it will update the old catch.
  }
}