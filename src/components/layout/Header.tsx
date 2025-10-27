import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "@/contexts/CartContext";
import { Menu, Search, ShoppingCart, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleAdminLogin = () => {
    router.push('/admin/login');
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setIsMenuOpen(false);
    }
  };

  const handleSearchKeyPress = (e: { key: string; }) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navItems = [
    { label: 'Products', href: '/products' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className='sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg shadow-md border-b border-orange-100'>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Left - CEC AYIGO Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <div className="relative flex items-center gap-2">
              {/* Glow Effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-purple-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                animate={{ 
                  background: [
                    "radial-gradient(circle, rgba(251,146,60,0.2), rgba(236,72,153,0.2), rgba(168,85,247,0.2))",
                    "radial-gradient(circle, rgba(168,85,247,0.2), rgba(236,72,153,0.2), rgba(251,146,60,0.2))",
                    "radial-gradient(circle, rgba(251,146,60,0.2), rgba(234, 67, 150, 0.2), rgba(168,85,247,0.2))"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Animated A Icon */}
              {/* <motion.div 
                className="relative w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md"
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <span className="text-white font-black text-sm sm:text-base">A</span>
              </motion.div>
               */}
              {/* CEC AYIGO Logo Image */}
              <div className="relative">
                <Image
                  src="/image/COLORED.png"
                  alt="CEC AYIGO Logo"
                  width={100}
                  height={32}
                  className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-all duration-300 group-hover:brightness-110"
                  priority
                />
                {/* Shine Effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 rounded"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />
              </div>
            </div>
          </Link>

          {/* Center - Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search solar products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 pr-20 h-10 bg-white border border-orange-200 focus:border-orange-400 rounded-lg text-sm transition-all"
              />
              <Button
                onClick={handleSearch}
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-semibold rounded-md"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className='hidden lg:flex items-center gap-1'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='text-sm font-medium text-gray-700 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors'
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className='flex items-center gap-1.5 sm:gap-2'>
            
            {/* Search - Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className='lg:hidden h-9 w-9 p-0 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-lg'
                >
                  <Search className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-80 p-3 bg-white border-orange-200'>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 h-4 w-4" />
                  <Input
                    type='search'
                    placeholder='Search products...'
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className='pl-10 pr-16 h-9 border border-orange-200 rounded-lg text-sm'
                  />
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-md"
                  >
                    Go
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Link href='/cart'>
              <Button
                variant="ghost"
                size="sm"
                className='relative h-9 w-9 p-0 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 rounded-lg'
              >
                <ShoppingCart className='h-4 w-4' />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className='absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md'
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>

            {/* Admin */}
            <Button
              onClick={handleAdminLogin}
              variant="ghost"
              size="sm"
              className='hidden sm:flex h-9 w-9 p-0 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-lg'
            >
              <Lock className='h-4 w-4' />
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className='lg:hidden h-9 w-9 p-0 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-lg'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                    <X className='h-4 w-4' />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                    <Menu className='h-4 w-4' />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-orange-100 bg-white"
            >
              <div className="py-3 space-y-1">
                
                {/* Nav Items */}
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className='block px-4 py-2.5 mx-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors'
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile Search */}
                <div className="px-3 pt-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 h-4 w-4" />
                    <Input
                      type='search'
                      placeholder='Search products...'
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      className='pl-10 pr-16 h-10 border border-orange-200 rounded-lg text-sm'
                    />
                    <Button
                      onClick={handleSearch}
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-md"
                    >
                      Go
                    </Button>
                  </div>
                </div>

                {/* Admin Login - Mobile */}
                <div className="px-3 pt-2 pb-1">
                  <Button
                    onClick={handleAdminLogin}
                    variant="outline"
                    className="w-full h-9 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg text-sm"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}