import React from "react";
import Link from "next/link";
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  MapPin, 
  Mail, 
  Phone,
  ArrowUpRight,
  Zap
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Solar Panels', href: '/products?category=solar' },
  { name: 'Batteries', href: '/products?category=batteries' },
  { name: 'Inverters', href: '/products?category=inverters' },
  { name: 'Street Lights', href: '/products?category=lights' },
  { name: 'Solar Cameras', href: '/products?category=cameras' },
  { name: 'Solar Fans', href: '/products?category=fans' }
];

const QUICK_LINKS = [
  { name: 'All Products', href: '/products' },
  { name: 'Blog Posts', href: '/blogs' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' }
];

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-400' },
  { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-400' },
  { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-400' }
];

export function Footer() {
  return (
    <footer className='bg-gray-900 relative overflow-hidden'>
      
    {/* Subtle Background Elements */}
    <div className="absolute inset-0 pointer-events-none opacity-30">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
    </div>
    
      <div className='container mx-auto px-4 py-12 md:py-16 relative z-10'>
        
        {/* Top Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12'>
          
          {/* Brand Section */}
          <motion.div 
            className='lg:col-span-1'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href='/' className='inline-block mb-4'>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-xl">A</span>
                </div>
                <span className='text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>
                  AYIGO
                </span>
              </div>
            </Link>
            <p className='text-gray-400 text-sm leading-relaxed mb-6'>
              Nigeria's smartest electronics store. Premium solar solutions and cutting-edge technology for your home and business.
            </p>
            
            {/* Social Links */}
            <div className='flex gap-3'>
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className={`w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white ${social.color} transition-all hover:bg-white/20 shadow-md hover:shadow-lg`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className='text-lg font-bold mb-4 text-white'>Quick Links</h3>
            <ul className='space-y-3'>
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className='text-gray-300 hover:text-orange-400 transition-colors text-sm flex items-center gap-1 group'
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className='text-lg font-bold mb-4 text-white'>Categories</h3>
            <ul className='space-y-3'>
              {CATEGORIES.map((category) => (
                <li key={category.name}>
                  <Link 
                    href={category.href} 
                    className='text-gray-300 hover:text-orange-400 transition-colors text-sm flex items-center gap-1 group'
                  >
                    <span>{category.name}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className='text-lg font-bold mb-4 text-white'>Contact Us</h3>
            <ul className='space-y-4'>
              <li className='flex items-start gap-3'>
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-orange-400" />
                </div>
                <span className='text-gray-300 text-sm leading-relaxed'>
                  D441b, Electrical Section, Alaba International Market, Lagos
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <a href="mailto:contact@ayigo.com" className='text-gray-300 hover:text-blue-400 text-sm transition-colors'>
                  contact@ayigo.com
                </a>
              </li>
              <li className='flex items-start gap-3'>
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-green-400" />
                </div>
                <a href="tel:+2348147254399" className='text-gray-300 hover:text-green-400 text-sm transition-colors'>
                  +234 814 725 4399
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
        
        {/* Bottom Section */}
        <motion.div 
          className='pt-8 border-t border-gray-700'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <p className='text-gray-400 text-sm text-center md:text-left'>
              &copy; {new Date().getFullYear()} AYIGO. All rights reserved.
            </p>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-400" />
             
              </div>
              <span>•</span>
              <span>Made in Nigeria 🇳🇬</span>
            </div>
          </div>

          {/* Developer Credit - Professional & Subtle */}
          <motion.div 
            className="pt-4 border-t border-gray-800"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-500">
              <span>Designed & Developed by</span>
              <a 
                href="mailto:akzumdigitals@gmail.com"
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-300 hover:to-pink-300 transition-all"
              >
                Akzum Digitals
              </a>
              <span className="hidden sm:inline">•</span>
              <a 
                href="tel:+2348037477275"
                className="text-gray-500 hover:text-orange-400 transition-colors"
              >
                +234 803 747 7275
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;