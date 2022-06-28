   import { createCurrentUserHook, createClient } from 'next-sanity'
   import createImageUrlBuilder from '@sanity/image-url'

   export const config = {
    /**
     * Find your project ID and daaset in 'sanity.json' in your studio project.
     * These are considered 'public', but you can use environment variables.
     * If you want differ between locl dev and production
     * https://nextjs.org/docs/basic-features/environment-variables
     */
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    apiVersion: '2021-03-25',
    /**
    * Set useCdn to 'false' if your application require the freshets possible
    * data alays (potentially sligthtly slower and bit more expensive).
    * Authenticated request will always bypass the CDN
    */
    useCdn: process.env.NODE_ENV === 'production' 
   }

   export const sanityClient = createClient(config)

   export const urlFor = (source) => createImageUrlBuilder(config).image(source)

   export const useCurrentUser = createCurrentUserHook(config)