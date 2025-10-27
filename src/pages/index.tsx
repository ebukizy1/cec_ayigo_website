import Head from "next/head";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoriesSection } from "@/components/home/Categories";
import { LatestBlogs } from "@/components/home/LatestBlogs";
import {ReviewsSection} from "@/components/home/Review";

export default function Home() {
  return (
    <>
      <Head>
        <title>CeC - Shop Easy</title>
        <meta name='description' content='Discover quality products with ease at CeC. Browse our collection and find exactly what you need.' />
        <meta name='keywords' content='e-commerce, online shopping, products, CeC' />
        <link rel='icon' href='/public/favicon.ico' />
      </Head>
      
      <div className='min-h-screen'>
        <HeroSection />
        <ReviewsSection />
        <CategoriesSection />
        <FeaturedProducts />
        <LatestBlogs />
      </div>
    </>
  );
}