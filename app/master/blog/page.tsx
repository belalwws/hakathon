'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/language-context'
import { BackgroundAnimations } from '@/components/background-animations'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Tag,
  Loader2,
  Save,
  X,
  ArrowLeft,
  Upload,
  Image as ImageIcon
} from 'lucide-react'

export default function MasterBlogPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    excerptAr: '',
    excerptEn: '',
    contentAr: '',
    contentEn: '',
    coverImage: '',
    categoryId: '',
    tagIds: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [postsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/blog/posts?limit=100&status=all'),
        fetch('/api/blog/categories'),
        fetch('/api/blog/tags')
      ])
      
      if (postsRes.ok) {
        const postsData = await postsRes.json()
        console.log('📊 Posts data received:', postsData)
        // API يرجع object فيه posts array
        if (postsData.posts && Array.isArray(postsData.posts)) {
          setPosts(postsData.posts)
        } else if (Array.isArray(postsData)) {
          setPosts(postsData)
        } else {
          setPosts([])
        }
      }
      if (categoriesRes.ok) {
        const catsData = await categoriesRes.json()
        setCategories(Array.isArray(catsData) ? catsData : [])
      }
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        setTags(Array.isArray(tagsData) ? tagsData : [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setPosts([])
      setCategories([])
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  const handleNewPost = () => {
    setEditingPost(null)
    setFormData({
      titleAr: '',
      titleEn: '',
      excerptAr: '',
      excerptEn: '',
      contentAr: '',
      contentEn: '',
      coverImage: '',
      categoryId: categories[0]?.id || '',
      tagIds: [],
      status: 'draft',
      featured: false
    })
    setShowEditor(true)
  }

  const handleEditPost = (post: any) => {
    setEditingPost(post)
    setFormData({
      titleAr: post.titleAr,
      titleEn: post.titleEn,
      excerptAr: post.excerptAr,
      excerptEn: post.excerptEn,
      contentAr: post.contentAr,
      contentEn: post.contentEn,
      coverImage: post.coverImage || '',
      categoryId: post.categoryId,
      tagIds: post.tags?.map((t: any) => t.tag.id) || [],
      status: post.status,
      featured: post.featured
    })
    setShowEditor(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = editingPost 
        ? `/api/blog/posts/${editingPost.slug}` 
        : '/api/blog/posts'
      
      const method = editingPost ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(language === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved successfully!')
        setShowEditor(false)
        fetchData()
      } else {
        alert(language === 'ar' ? 'حدث خطأ!' : 'An error occurred!')
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert(language === 'ar' ? 'حدث خطأ!' : 'An error occurred!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm(language === 'ar' ? 'هل تريد حذف المقال؟' : 'Delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/posts/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert(language === 'ar' ? 'تم الحذف بنجاح!' : 'Deleted successfully!')
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // تحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'الرجاء اختيار صورة فقط' : 'Please select an image file')
      return
    }

    // تحقق من حجم الملف (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 10MB)' : 'Image too large (max 10MB)')
      return
    }

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, coverImage: data.url }))
        alert(language === 'ar' ? '✅ تم رفع الصورة بنجاح!' : '✅ Image uploaded successfully!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(language === 'ar' ? '❌ فشل رفع الصورة' : '❌ Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      <BackgroundAnimations />
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/master')}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">
              {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
            </span>
          </motion.button>

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
          >
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {language === 'ar' ? '✍️ إدارة المدونة' : '✍️ Blog Management'}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {language === 'ar' ? `${posts.length} مقال منشور` : `${posts.length} posts published`}
                </p>
                <Badge variant="outline" className="text-sm bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  {posts.filter(p => p.status === 'published').length} {language === 'ar' ? 'منشور' : 'published'}
                </Badge>
                <Badge variant="outline" className="text-sm bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  {posts.filter(p => p.status === 'draft').length} {language === 'ar' ? 'مسودة' : 'draft'}
                </Badge>
                <Badge variant="outline" className="text-sm bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                  ⭐ {posts.filter(p => p.featured).length} {language === 'ar' ? 'مميز' : 'featured'}
                </Badge>
              </div>
            </div>
            <Button
              onClick={handleNewPost}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg"
            >
              <Plus className="h-6 w-6 mr-2" />
              {language === 'ar' ? 'مقال جديد' : 'New Post'}
            </Button>
          </motion.div>

          {/* Editor Modal */}
          {showEditor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowEditor(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingPost 
                        ? (language === 'ar' ? 'تعديل المقال' : 'Edit Post')
                        : (language === 'ar' ? 'مقال جديد' : 'New Post')
                      }
                    </h2>
                    <button
                      onClick={() => setShowEditor(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Title Arabic */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        العنوان (عربي) *
                      </label>
                      <input
                        type="text"
                        value={formData.titleAr}
                        onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    {/* Title English */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Title (English) *
                      </label>
                      <input
                        type="text"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    {/* Excerpt Arabic */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        الملخص (عربي) *
                      </label>
                      <textarea
                        value={formData.excerptAr}
                        onChange={(e) => setFormData({ ...formData, excerptAr: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    {/* Excerpt English */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Excerpt (English) *
                      </label>
                      <textarea
                        value={formData.excerptEn}
                        onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    {/* Content Arabic */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        المحتوى (عربي) *
                      </label>
                      <textarea
                        value={formData.contentAr}
                        onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                        rows={10}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        required
                      />
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-start gap-1">
                        <ImageIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>💡 للصور داخل المحتوى: ارفعها على Cloudinary أولاً ثم استخدم الرابط هنا</span>
                      </p>
                    </div>

                    {/* Content English */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Content (English) *
                      </label>
                      <textarea
                        value={formData.contentEn}
                        onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                        rows={10}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        required
                      />
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-start gap-1">
                        <ImageIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>💡 For images in content: Upload to Cloudinary first, then use the link here</span>
                      </p>
                    </div>

                    {/* Cover Image Upload & URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {language === 'ar' ? '🖼️ صورة الغلاف' : '🖼️ Cover Image'}
                      </label>
                      
                      {/* Upload Button */}
                      <div className="mb-3">
                        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                          {uploading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>{language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5" />
                              <span>{language === 'ar' ? 'رفع من جهازك (Cloudinary)' : 'Upload from device (Cloudinary)'}</span>
                            </>
                          )}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {language === 'ar' ? 'JPG, PNG, GIF, WebP (حد أقصى 10MB)' : 'JPG, PNG, GIF, WebP (max 10MB)'}
                        </p>
                      </div>

                      {/* أو أدخل رابط */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                            {language === 'ar' ? 'أو' : 'OR'}
                          </span>
                        </div>
                      </div>

                      <input
                        type="url"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder={language === 'ar' ? 'أو أدخل رابط الصورة...' : 'Or paste image URL...'}
                        className="mt-3 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />

                      {/* معاينة الصورة */}
                      {formData.coverImage && (
                        <div className="mt-3 relative group">
                          <img
                            src={formData.coverImage}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, coverImage: '' })}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {language === 'ar' ? 'الفئة' : 'Category'} *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {language === 'ar' ? cat.nameAr : cat.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {language === 'ar' ? 'الوسوم' : 'Tags'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              const newTagIds = formData.tagIds.includes(tag.id)
                                ? formData.tagIds.filter(id => id !== tag.id)
                                : [...formData.tagIds, tag.id]
                              setFormData({ ...formData, tagIds: newTagIds })
                            }}
                            className={`px-4 py-2 rounded-full text-sm transition-colors ${
                              formData.tagIds.includes(tag.id)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {language === 'ar' ? tag.nameAr : tag.nameEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {language === 'ar' ? 'الحالة' : 'Status'} *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</option>
                        <option value="published">{language === 'ar' ? 'منشور' : 'Published'}</option>
                        <option value="archived">{language === 'ar' ? 'مؤرشف' : 'Archived'}</option>
                      </select>
                    </div>

                    {/* Featured */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600"
                      />
                      <label htmlFor="featured" className="text-gray-700 dark:text-gray-300">
                        {language === 'ar' ? 'مقال مميز' : 'Featured Post'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditor(false)}
                    disabled={saving}
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {language === 'ar' ? 'حفظ' : 'Save'}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Posts List */}
          <div className="grid gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-6">
                  {/* Cover Image */}
                  {post.coverImage && (
                    <div className="hidden md:block w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={post.coverImage}
                        alt={language === 'ar' ? post.titleAr : post.titleEn}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <Badge className={
                        post.status === 'published' ? 'bg-green-600 hover:bg-green-700' :
                        post.status === 'draft' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
                      }>
                        {post.status === 'published' ? (language === 'ar' ? '✅ منشور' : '✅ Published') :
                         post.status === 'draft' ? (language === 'ar' ? '📝 مسودة' : '📝 Draft') :
                         (language === 'ar' ? '📦 مؤرشف' : '📦 Archived')}
                      </Badge>
                      {post.featured && (
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          ⭐ {language === 'ar' ? 'مميز' : 'Featured'}
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800">
                        📚 {language === 'ar' ? post.category?.nameAr : post.category?.nameEn}
                      </Badge>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {language === 'ar' ? post.titleAr : post.titleEn}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {language === 'ar' ? post.excerptAr : post.excerptEn}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        <span className="font-medium">
                          {new Date(post.publishedAt).toLocaleDateString(
                            language === 'ar' ? 'ar-EG' : 'en-US',
                            { year: 'numeric', month: 'short', day: 'numeric' }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                        <Eye className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{post.views}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                          <Tag className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">{post.tags.length} {language === 'ar' ? 'وسم' : 'tags'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPost(post)}
                      className="hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(post.slug)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {language === 'ar' ? 'لا توجد مقالات بعد' : 'No posts yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {language === 'ar' 
                    ? 'ابدأ بإنشاء أول مقال لمدونتك' 
                    : 'Start by creating your first blog post'}
                </p>
                <Button
                  onClick={handleNewPost}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {language === 'ar' ? 'إنشاء مقال' : 'Create Post'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
