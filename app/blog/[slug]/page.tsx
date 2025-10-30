'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/language-context'
import { BackgroundAnimations } from '@/components/background-animations'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Tag,
  Eye,
  Share2,
  Loader2
} from 'lucide-react'

export default function BlogPostPage() {
  const params = useParams()
  const { language } = useLanguage()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const slug = params.slug as string

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blog/posts/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {language === 'ar' ? 'المقال غير موجود' : 'Post not found'}
          </h1>
          <Link
            href="/blog"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </Link>
        </div>
      </div>
    )
  }

  const title = language === 'ar' ? post.titleAr : post.titleEn
  const content = language === 'ar' ? post.contentAr : post.contentEn

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      <BackgroundAnimations />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-12">
        <div className="container mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Category Badge */}
            <div className="mb-4">
              <Badge className="bg-indigo-600 text-white text-sm px-4 py-2">
                {language === 'ar' ? post.category?.nameAr : post.category?.nameEn}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              {title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{post.author?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString(
                    language === 'ar' ? 'ar-EG' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span>{post.views} {language === 'ar' ? 'مشاهدة' : 'views'}</span>
              </div>
            </div>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative h-96 rounded-2xl overflow-hidden mb-12 shadow-2xl">
                <Image
                  src={post.coverImage}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-a:text-indigo-600 dark:prose-a:text-indigo-400
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-code:text-indigo-600 dark:prose-code:text-indigo-400
                prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800
                prose-img:rounded-xl prose-img:shadow-lg"
            >
              <div 
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
                className="whitespace-pre-wrap"
              />
            </motion.article>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الوسوم' : 'Tags'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {post.tags.map((tagRel: any) => (
                    <span
                      key={tagRel.tag.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <Tag className="h-4 w-4" />
                      {language === 'ar' ? tagRel.tag.nameAr : tagRel.tag.nameEn}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'شارك المقال' : 'Share Article'}
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert(language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!')
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  {language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Posts CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'هل استمتعت بالمقال؟' : 'Enjoyed the Article?'}
            </h2>
            <p className="text-lg mb-8 text-indigo-100">
              {language === 'ar' 
                ? 'اقرأ المزيد من المقالات المفيدة في مدونتنا'
                : 'Read more helpful articles on our blog'}
            </p>
            <Link
              href="/blog"
              className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              {language === 'ar' ? 'تصفح المدونة' : 'Browse Blog'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
