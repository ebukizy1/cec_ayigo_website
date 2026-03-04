import Head from "next/head";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/Categories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { LatestBlogs } from "@/components/home/LatestBlogs";

export default function Home() {
  return (
    <>
      <Head>
        <title>CeC - Shop Easy</title>
        <meta name='description' content='Discover quality products with ease at CeC. Browse our collection and find exactly what you need.' />
        <meta name='keywords' content='e-commerce, online shopping, products, CeC' />
        <link rel='icon' href='/public/favicon.ico' />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <link rel="preconnect" href="https://pixabay.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://pixabay.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
      </Head>
      
      <div className='min-h-screen bg-[#F8FAFC]'>
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <LatestBlogs />
      </div>
    </>
  );
}
