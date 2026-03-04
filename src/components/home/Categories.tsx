import React from "react";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Sun, 
  Lightbulb, 
  Battery, 
  Zap, 
  Camera,
  Wind,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  count: number;
}

const CATEGORIES: Category[] = [
  { 
    id: 'solar', 
    name: 'Solar Systems', 
    icon: <Sun className='h-7 w-7 text-white' />,
    gradient: 'from-orange-500 to-yellow-500',
    count: 85
  },
  { 
    id: 'batteries', 
    name: 'Batteries', 
    icon: <Battery className='h-7 w-7 text-white' />,
    gradient: 'from-green-500 to-emerald-500',
    count: 124
  },
  { 
    id: 'inverters', 
    name: 'Inverters', 
    icon: <Zap className='h-7 w-7 text-white' />,
    gradient: 'from-indigo-500 to-violet-500',
    count: 67
  },
  { 
    id: 'lights', 
    name: 'Street Lights', 
    icon: <Lightbulb className='h-7 w-7 text-white' />,
    gradient: 'from-amber-500 to-orange-500',
    count: 98
  },
  { 
    id: 'cameras', 
    name: 'Solar Cameras', 
    icon: <Camera className='h-7 w-7 text-white' />,
    gradient: 'from-blue-500 to-cyan-500',
    count: 56
  },
  { 
    id: 'fans', 
    name: 'Solar Fans', 
    icon: <Wind className='h-7 w-7 text-white' />,
    gradient: 'from-purple-500 to-pink-500',
    count: 42
  }
];

export function CategoriesSection() {
  return (
    <section className='py-16 md:py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50 relative overflow-hidden'>
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl" />
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10'>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-12 md:mb-16'
        >
          <motion.div 
            className='inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full font-semibold text-sm mb-4 shadow'
          >
            <Sparkles className='h-4 w-4' />
            Explore Categories
          </motion.div>
          
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3'>
            Explore Our Solar Solutions
          </h2>
          
          <p className='text-gray-600 max-w-2xl mx-auto text-base md:text-lg'>
            From complete solar systems to cameras and fans, find everything you need for clean energy
          </p>
        </motion.div>
        
        {/* Categories Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 mb-12'>
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.03 }}
              className='group'
            >
              <Link href={`/products?category=${category.id}`}>
                <div className='relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 cursor-pointer overflow-hidden h-full'>
                  
                  {/* Hover Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <motion.div 
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 md:mb-6 shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {category.icon}
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-2xl"
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  {/* Content */}
                  <div className='relative'>
                    <h3 className='font-bold text-lg md:text-xl text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 transition-all duration-300'>
                      {category.name}
                    </h3>
                    
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        {category.count}+ products
                      </span>
                      
                      <motion.div
                        className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                        whileHover={{ x: 5 }}
                      >
                        <ArrowRight className='h-5 w-5 text-orange-500' />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/products">
            <motion.button 
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-medium text-base md:text-lg shadow-sm hover:shadow transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default CategoriesSection;
