'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { AnimatedSection } from '@/components/animated-section'
import { HoverCard } from '@/components/hover-card'
import { BackgroundAnimations } from '@/components/background-animations'
import { OptimizedImage } from '@/components/optimized-image'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  Tag,
  TrendingUp,
  Code2,
  Lightbulb,
  Trophy,
  Users,
  Loader2
} from 'lucide-react'

export default function BlogPage() {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // جلب المقالات من API
  useEffect(() => {
    fetchPosts()
  }, [searchQuery, activeCategory])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(activeCategory !== 'all' && { category: activeCategory })
      })
      
      const response = await fetch(`/api/blog/posts?${params}`)
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const categoryFilters = [
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'tutorials', label: language === 'ar' ? 'دروس' : 'Tutorials', icon: <Code2 className="h-4 w-4" /> },
    { id: 'tips', label: language === 'ar' ? 'نصائح' : 'Tips', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'success-stories', label: language === 'ar' ? 'قصص نجاح' : 'Success Stories', icon: <Trophy className="h-4 w-4" /> },
    { id: 'community', label: language === 'ar' ? 'المجتمع' : 'Community', icon: <Users className="h-4 w-4" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 transition-colors">
      <BackgroundAnimations />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="mb-6 text-sm px-4 py-2">
                  {language === 'ar' ? '📝 المدونة' : '📝 Blog'}
                </Badge>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {language === 'ar' ? 'مدونة HackPro' : 'HackPro Blog'}
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 dark:text-gray-400 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {language === 'ar' 
                  ? 'اكتشف أحدث النصائح والدروس والقصص الملهمة من عالم الهاكاثونات'
                  : 'Discover the latest tips, tutorials, and inspiring stories from the world of hackathons'}
              </motion.p>

              {/* Search Bar */}
              <motion.div
                className="relative max-w-2xl mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث في المقالات...' : 'Search articles...'}
                  className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-lg"
                />
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Category Filters */}
          <AnimatedSection delay={0.6}>
            <div className="flex flex-wrap justify-center gap-3 mt-12">
              {categoryFilters.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'لا توجد مقالات' : 'No articles found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any, index: number) => (
                <AnimatedSection key={post.id} delay={index * 0.1}>
                  <HoverCard>
                    <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <OptimizedImage
                          src={post.coverImage || 'https://via.placeholder.com/800x600'}
                          alt={language === 'ar' ? post.titleAr : post.titleEn}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-indigo-600 text-white">
                            {language === 'ar' ? post.category?.nameAr : post.category?.nameEn}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                          {language === 'ar' ? post.titleAr : post.titleEn}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
                          {language === 'ar' ? post.excerptAr : post.excerptEn}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{post.author?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.publishedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{post.views || 0} {language === 'ar' ? 'مشاهدة' : 'views'}</span>
                          </div>

                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                          >
                            {language === 'ar' ? 'اقرأ المزيد' : 'Read more'}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {post.tags.map((tagRel: any) => (
                              <span
                                key={tagRel.tag.id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              >
                                <Tag className="h-3 w-3" />
                                {language === 'ar' ? tagRel.tag.nameAr : tagRel.tag.nameEn}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </HoverCard>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-2xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === 'ar' ? 'اشترك في النشرة البريدية' : 'Subscribe to Newsletter'}
              </h2>
              <p className="text-lg mb-8 text-indigo-100">
                {language === 'ar' 
                  ? 'احصل على أحدث المقالات والنصائح مباشرة في بريدك'
                  : 'Get the latest articles and tips delivered to your inbox'}
              </p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
                  className="flex-1 px-6 py-3 rounded-full text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-100 transition-colors"
                >
                  {language === 'ar' ? 'اشترك' : 'Subscribe'}
                </button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
