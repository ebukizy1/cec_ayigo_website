import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Verified, TrendingUp } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  review: string;
  verified: boolean;
}

export function ReviewsSection() {
  const [reviews] = useState<Review[]>([
    {
      id: "1",
      name: "Temi Adisa",
      avatar: "https://ui-avatars.com/api/?name=Temi+Adisa&background=f97316&color=fff&size=80",
      rating: 5,
      date: "3 days ago",
      review: "Honestly didn’t expect it to last this long. I’ve been running my laptop and fan every evening, and it’s been solid. Great buy.",
      verified: true,
    },
    {
      id: "2",
      name: "Ngozi E.",
      avatar: "https://ui-avatars.com/api/?name=Ngozi+E&background=a855f7&color=fff&size=80",
      rating: 5,
      date: "1 week ago",
      review: "I got the solar camera for my shop and it’s been amazing. The image quality is super clear and I love how it sends alerts instantly.",
      verified: true,
    },
    {
      id: "3",
      name: "Olu Williams",
      avatar: "https://ui-avatars.com/api/?name=Olu+Williams&background=3b82f6&color=fff&size=80",
      rating: 5,
      date: "2 weeks ago",
      review: "Installed the solar lights around my house and the difference is night and day. It’s bright, quiet, and saves me a ton on bills.",
      verified: true,
    },
  ]);
  
  

  return (
    <section className="w-full py-16 md:py-20 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full font-semibold text-sm mb-4 shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="h-4 w-4 fill-current" />
            Customer Reviews
            <TrendingUp className="h-4 w-4" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            What Our
            <motion.span 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '300% 300%' }}
            >
              Customers Say
            </motion.span>
          </h2>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">4.9</span>
            </div>
            <div className="text-gray-600">
              <span className="font-bold text-gray-900">50K+</span> happy customers
            </div>
          </div>
        </motion.div>

        {/* Reviews Grid - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <motion.img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 truncate">
                      {review.name}
                    </h4>
                    {review.verified && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Verified className="h-4 w-4 text-blue-500 fill-current flex-shrink-0" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-700 leading-relaxed">
                "{review.review}"
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ReviewsSection;