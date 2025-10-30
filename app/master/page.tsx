'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Building2, Users, Database, Activity, TrendingUp, Shield, 
  Calendar, UserPlus, BarChart3, DollarSign, Zap, Globe,
  ArrowUpRight, ArrowDownRight, Sparkles, Trophy, Image, BookOpen,
  Settings, Bell, Search, Menu, Plus, Edit, Trash2, Eye, Tag, Loader2,
  Save, X, Upload, Copy, Check
} from 'lucide-react'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts'
import { useLanguage } from '@/contexts/language-context'

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  _count: {
    users: number
    hackathons: number
  }
  createdAt: string
}

interface Stats {
  totalOrganizations: number
  totalUsers: number
  totalHackathons: number
  totalParticipants: number
  activePlans: Record<string, number>
  recentActivity?: {
    organizations: number
    users: number
    hackathons: number
  }
}

interface MonthlyData {
  month: string
  users: number
  hackathons: number
  organizations: number
}

interface Analytics {
  monthlyGrowth: MonthlyData[]
  planDistribution: { name: string; value: number }[]
  roleDistribution: { name: string; value: number }[]
  hackathonStatus: { name: string; value: number }[]
  offboardedOrgs: number
}

export default function MasterDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard') // Tab state
  
  // Blog states
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
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
  
  // Image upload states
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  
  // Users states
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    if (user?.role !== 'master') {
      router.push('/login')
      return
    }

    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      // Fetch all organizations
      const orgsRes = await fetch('/api/master/organizations', {
        headers: {
          'x-development-mode': 'true',
        },
      })
      
      if (orgsRes.ok) {
        const data = await orgsRes.json()
        setOrganizations(data.organizations || [])
      }

      // Fetch platform stats
      const statsRes = await fetch('/api/master/stats', {
        headers: {
          'x-development-mode': 'true',
        },
      })
      
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats || null)
      }

      // Fetch analytics data
      const analyticsRes = await fetch('/api/master/analytics', {
        headers: {
          'x-development-mode': 'true',
        },
      })
      
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data.analytics || null)
      }

      // Fetch blog data if on blog tab
      if (activeTab === 'blog') {
        fetchBlogData()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBlogData = async () => {
    try {
      const [postsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/blog/posts?limit=100&status=all'),
        fetch('/api/blog/categories'),
        fetch('/api/blog/tags')
      ])
      
      if (postsRes.ok) {
        const postsData = await postsRes.json()
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
      console.error('Error fetching blog data:', error)
      setPosts([])
      setCategories([])
      setTags([])
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch('/api/master/users', {
        headers: {
          'x-development-mode': 'true',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setUsersLoading(false)
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
        alert('Saved successfully!')
        setShowEditor(false)
        fetchBlogData()
      } else {
        alert('An error occurred!')
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('An error occurred!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/posts/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Deleted successfully!')
        fetchBlogData()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image too large (max 10MB)')
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
        if (activeTab === 'blog') {
          setFormData(prev => ({ ...prev, coverImage: data.url }))
          alert('✅ Image uploaded successfully!')
        } else if (activeTab === 'upload') {
          setUploadedUrl(data.url)
        }
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('❌ Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Dynamic data from backend
  const monthlyData = analytics?.monthlyGrowth || []
  
  const planData = analytics?.planDistribution || []
  const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444']
  
  const roleData = analytics?.roleDistribution || []
  
  const hackathonStatusData = analytics?.hackathonStatus || []

  // Load blog data when switching to blog tab
  useEffect(() => {
    if (activeTab === 'blog' && posts.length === 0) {
      fetchBlogData()
    }
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers()
    }
  }, [activeTab])

  // Filtered users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <div className="w-24 h-24 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-10 w-10 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Loading Dashboard...</p>
          <div className="flex items-center justify-center gap-1 mt-3">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              HackPro Master Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-64"
              />
            </div>
            
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-sm">
                <div className="font-semibold">Master Admin</div>
                <div className="text-xs text-gray-500">Super Admin</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-4 space-y-2">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-2 ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 className="h-4 w-4" />
              {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-2 ${activeTab === 'blog' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''}`}
              onClick={() => setActiveTab('blog')}
            >
              <BookOpen className="h-4 w-4" />
              {language === 'ar' ? 'إدارة المدونة' : 'Blog Management'}
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-2 ${activeTab === 'upload' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Image className="h-4 w-4" />
              {language === 'ar' ? 'رفع الصور' : 'Upload Images'}
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-2 ${activeTab === 'users' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-4 w-4" />
              {language === 'ar' ? 'المستخدمين' : 'Users'}
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-2 ${activeTab === 'organizations' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''}`}
              onClick={() => setActiveTab('organizations')}
            >
              <Building2 className="h-4 w-4" />
              {language === 'ar' ? 'المؤسسات' : 'Organizations'}
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-2 ${activeTab === 'hackathons' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''}`}
              onClick={() => setActiveTab('hackathons')}
            >
              <Trophy className="h-4 w-4" />
              {language === 'ar' ? 'الهاكاثونات' : 'Hackathons'}
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-2 ${activeTab === 'settings' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-4 w-4" />
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </Button>
          </div>
          
          <div className="mt-auto p-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
              <Database className="h-8 w-8 mb-2" />
              <div className="text-sm font-semibold mb-1">Multi-Tenant System</div>
              <div className="text-xs opacity-90">Neon Database (Free)</div>
              <div className="text-xs opacity-90 mt-1">💰 Cost: $0</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Render content based on active tab */}
            {activeTab === 'dashboard' && (
              <>
                {/* Welcome Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Welcome back, Master Admin 👋
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Track and manage all platform data from your dashboard
                  </p>
                </motion.div>

            {/* Stats Grid */}
            {stats && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              >
                <SimpleStatCard
                  title="Total Organizations"
                  value={stats.totalOrganizations}
                  trend={`+${stats.recentActivity?.organizations || 0}`}
                  trendUp={true}
                  color="green"
                />
                <SimpleStatCard
                  title="Inactive Organizations"
                  value={analytics?.offboardedOrgs || 0}
                  trend="-2"
                  trendUp={false}
                  color="red"
                />
                <SimpleStatCard
                  title="Active Hackathons"
                  value={stats.totalHackathons}
                  trend={`+${stats.recentActivity?.hackathons || 0}`}
                  trendUp={true}
                  color="blue"
                />
              </motion.div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Welcome Card with Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                  <h3 className="text-lg font-semibold mb-2">Platform Growth �</h3>
                  <p className="text-sm opacity-90 mb-6">Monthly users, hackathons & organizations growth</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                        <XAxis dataKey="month" stroke="white" fontSize={12} />
                        <YAxis stroke="white" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                        <Bar dataKey="users" name="Users" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="hackathons" name="Hackathons" fill="#c084fc" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="organizations" name="Organizations" fill="#e879f9" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              {/* Employee Type Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Subscription Plans</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={planData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {planData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold">{planData.reduce((a, b) => a + b.value, 0)}</div>
                        <div className="text-sm text-gray-500">Total Plans</div>
                      </div>
                      <div className="space-y-2">
                        {planData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span className="capitalize">{item.name}</span>
                            </div>
                            <span className="font-semibold">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Length of Service Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">User Roles Distribution</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roleData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              {/* Job Level Horizontal Bars */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Hackathon Status</h3>
                  <div className="space-y-4">
                    {hackathonStatusData.map((item, index) => {
                      const total = hackathonStatusData.reduce((a, b) => a + b.value, 0)
                      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="font-medium capitalize">{item.name}</span>
                            <span className="text-gray-500">{percentage}% ({item.value})</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Bottom Section: Upcoming Task & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Task */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Organizations</h3>
                  <div className="space-y-3">
                    {organizations.slice(0, 5).map((org, index) => (
                      <div key={org.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{org.name}</div>
                          <div className="text-xs text-gray-500">{org._count.users} users · {org._count.hackathons} events</div>
                        </div>
                        <Badge className={org.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}>
                          {org.status}
                        </Badge>
                      </div>
                    ))}
                    {organizations.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No organizations yet
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Activity</h3>
                  <div className="space-y-4">
                    {stats && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">New Organizations</span>
                          </div>
                          <span className="text-sm font-semibold text-green-600">+{stats.recentActivity?.organizations || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">New Users</span>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">+{stats.recentActivity?.users || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm">New Hackathons</span>
                          </div>
                          <span className="text-sm font-semibold text-purple-600">+{stats.recentActivity?.hackathons || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm">Total Participants</span>
                          </div>
                          <span className="text-sm font-semibold text-orange-600">{stats.totalParticipants}</span>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
              </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {language === 'ar' ? '👥 إدارة المستخدمين' : '👥 Users Management'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {language === 'ar' 
                        ? `${filteredUsers.length} مستخدم من أصل ${users.length}` 
                        : `${filteredUsers.length} users of ${users.length} total`}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'ابحث عن مستخدم...' : 'Search users...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">{language === 'ar' ? 'جميع الأدوار' : 'All Roles'}</option>
                      <option value="participant">{language === 'ar' ? 'مشارك' : 'Participant'}</option>
                      <option value="judge">{language === 'ar' ? 'حكم' : 'Judge'}</option>
                      <option value="admin">{language === 'ar' ? 'مدير' : 'Admin'}</option>
                      <option value="expert">{language === 'ar' ? 'خبير' : 'Expert'}</option>
                      <option value="supervisor">{language === 'ar' ? 'مشرف' : 'Supervisor'}</option>
                      <option value="master">{language === 'ar' ? 'سوبر أدمن' : 'Master'}</option>
                    </select>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {language === 'ar' ? 'جاري تحميل المستخدمين...' : 'Loading users...'}
                    </p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {language === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery || filterRole !== 'all'
                        ? (language === 'ar' ? 'جرب تغيير فلاتر البحث' : 'Try adjusting your filters')
                        : (language === 'ar' ? 'لم يتم العثور على أي مستخدمين' : 'No users registered yet')}
                    </p>
                  </Card>
                ) : (
                  <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
                            </p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{users.length}</p>
                          </div>
                          <Users className="h-12 w-12 text-blue-600 dark:text-blue-400 opacity-50" />
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                              {language === 'ar' ? 'المشاركين' : 'Participants'}
                            </p>
                            <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                              {users.filter(u => u.role === 'participant').length}
                            </p>
                          </div>
                          <UserPlus className="h-12 w-12 text-green-600 dark:text-green-400 opacity-50" />
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                              {language === 'ar' ? 'الحكام' : 'Judges'}
                            </p>
                            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                              {users.filter(u => u.role === 'judge').length}
                            </p>
                          </div>
                          <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400 opacity-50" />
                        </div>
                      </Card>
                      
                      <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                              {language === 'ar' ? 'المديرين' : 'Admins'}
                            </p>
                            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                              {users.filter(u => ['admin', 'expert', 'supervisor', 'master'].includes(u.role)).length}
                            </p>
                          </div>
                          <Settings className="h-12 w-12 text-orange-600 dark:text-orange-400 opacity-50" />
                        </div>
                      </Card>
                    </div>

                    {/* Users Table */}
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {language === 'ar' ? 'المستخدم' : 'User'}
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {language === 'ar' ? 'الدور' : 'Role'}
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {language === 'ar' ? 'المؤسسة' : 'Organization'}
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {language === 'ar' ? 'تاريخ التسجيل' : 'Joined'}
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {language === 'ar' ? 'الحالة' : 'Status'}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((user, index) => (
                              <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 dark:text-white">
                                        {user.name || (language === 'ar' ? 'لا يوجد اسم' : 'No name')}
                                      </div>
                                      {user.nationalId && (
                                        <div className="text-xs text-gray-500">ID: {user.nationalId}</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className={
                                    user.role === 'master' ? 'bg-red-600' :
                                    user.role === 'admin' ? 'bg-orange-600' :
                                    user.role === 'supervisor' ? 'bg-yellow-600' :
                                    user.role === 'expert' ? 'bg-purple-600' :
                                    user.role === 'judge' ? 'bg-blue-600' :
                                    'bg-green-600'
                                  }>
                                    {user.role === 'participant' ? (language === 'ar' ? 'مشارك' : 'Participant') :
                                     user.role === 'judge' ? (language === 'ar' ? 'حكم' : 'Judge') :
                                     user.role === 'admin' ? (language === 'ar' ? 'مدير' : 'Admin') :
                                     user.role === 'expert' ? (language === 'ar' ? 'خبير' : 'Expert') :
                                     user.role === 'supervisor' ? (language === 'ar' ? 'مشرف' : 'Supervisor') :
                                     user.role === 'master' ? (language === 'ar' ? 'سوبر أدمن' : 'Master') :
                                     user.role}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  {user.organization ? (
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm text-gray-900 dark:text-gray-100">
                                        {user.organization.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-400">
                                      {language === 'ar' ? 'لا يوجد' : 'None'}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(user.createdAt).toLocaleDateString(
                                      language === 'ar' ? 'ar-EG' : 'en-US',
                                      { year: 'numeric', month: 'short', day: 'numeric' }
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    {language === 'ar' ? 'نشط' : 'Active'}
                                  </Badge>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            )}

            {/* Organizations Tab */}
            {activeTab === 'organizations' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {language === 'ar' ? '🏢 إدارة المؤسسات' : '🏢 Organizations Management'}
                </h2>
                <div className="grid gap-4">
                  {organizations.map((org) => (
                    <Card key={org.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{org.name}</h3>
                            <p className="text-sm text-gray-500">/{org.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{org._count.users}</div>
                            <div className="text-xs text-gray-500">
                              {language === 'ar' ? 'مستخدمين' : 'Users'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{org._count.hackathons}</div>
                            <div className="text-xs text-gray-500">
                              {language === 'ar' ? 'هاكاثونات' : 'Hackathons'}
                            </div>
                          </div>
                          <Badge className={org.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}>
                            {org.status === 'active' 
                              ? (language === 'ar' ? 'نشط' : 'Active')
                              : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                          </Badge>
                          <Badge className="capitalize">
                            {org.plan === 'free' ? (language === 'ar' ? 'مجاني' : 'Free') :
                             org.plan === 'starter' ? (language === 'ar' ? 'مبتدئ' : 'Starter') :
                             org.plan === 'professional' ? (language === 'ar' ? 'احترافي' : 'Professional') :
                             org.plan === 'enterprise' ? (language === 'ar' ? 'مؤسسي' : 'Enterprise') :
                             org.plan}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {organizations.length === 0 && (
                    <Card className="p-12">
                      <div className="text-center">
                        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {language === 'ar' ? 'لا توجد مؤسسات حتى الآن' : 'No organizations yet'}
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Hackathons Tab */}
            {activeTab === 'hackathons' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {language === 'ar' ? '🏆 إدارة الهاكاثونات' : '🏆 Hackathons Management'}
                </h2>
                <Card className="p-6">
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {language === 'ar' ? 'إدارة الهاكاثونات' : 'Hackathons Management'}
                    </h3>
                    <p className="text-gray-500">
                      {language === 'ar' 
                        ? `إجمالي الهاكاثونات: ${stats?.totalHackathons || 0}` 
                        : `Total Hackathons: ${stats?.totalHackathons || 0}`}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {language === 'ar' ? 'قريباً...' : 'Coming soon...'}
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {language === 'ar' ? '⚙️ إعدادات المنصة' : '⚙️ Platform Settings'}
                </h2>
                <div className="grid gap-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {language === 'ar' ? 'إعدادات قاعدة البيانات' : 'Database Configuration'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'ar' ? 'مزود قاعدة البيانات' : 'Database Provider'}
                        </span>
                        <Badge>Neon PostgreSQL</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'ar' ? 'التعددية' : 'Multi-Tenancy'}
                        </span>
                        <Badge className="bg-green-500">
                          {language === 'ar' ? 'مفعّل' : 'Enabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'ar' ? 'التكلفة الشهرية' : 'Monthly Cost'}
                        </span>
                        <Badge className="bg-blue-500">
                          {language === 'ar' ? '0 دولار (مجاني)' : '$0 (Free Tier)'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {language === 'ar' ? 'إحصائيات المنصة' : 'Platform Statistics'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold">{stats?.totalOrganizations || 0}</div>
                        <div className="text-sm text-gray-500">
                          {language === 'ar' ? 'مؤسسات' : 'Organizations'}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        <div className="text-sm text-gray-500">
                          {language === 'ar' ? 'مستخدمين' : 'Users'}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold">{stats?.totalHackathons || 0}</div>
                        <div className="text-sm text-gray-500">
                          {language === 'ar' ? 'هاكاثونات' : 'Hackathons'}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold">{stats?.totalParticipants || 0}</div>
                        <div className="text-sm text-gray-500">
                          {language === 'ar' ? 'مشاركين' : 'Participants'}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Blog Management Section */}
            {activeTab === 'blog' && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">✍️ Blog Management</h2>
                    <div className="flex items-center gap-4 flex-wrap">
                      <p className="text-gray-600 dark:text-gray-400">{posts.length} posts published</p>
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        {posts.filter(p => p.status === 'published').length} published
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                        {posts.filter(p => p.status === 'draft').length} draft
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                        ⭐ {posts.filter(p => p.featured).length} featured
                      </Badge>
                    </div>
                  </div>
                  <Button onClick={handleNewPost} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </div>

                {/* Blog Editor Modal */}
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
                          <h2 className="text-2xl font-bold">{editingPost ? 'Edit Post' : 'New Post'}</h2>
                          <button onClick={() => setShowEditor(false)} className="text-gray-500 hover:text-gray-700">
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Title (Arabic) *</label>
                            <input type="text" value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Title (English) *</label>
                            <input type="text" value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Excerpt (Arabic) *</label>
                            <textarea value={formData.excerptAr} onChange={(e) => setFormData({ ...formData, excerptAr: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Excerpt (English) *</label>
                            <textarea value={formData.excerptEn} onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Content (Arabic) *</label>
                            <textarea value={formData.contentAr} onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })} rows={10} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-sm" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Content (English) *</label>
                            <textarea value={formData.contentEn} onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })} rows={10} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-sm" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">🖼️ Cover Image</label>
                            <div className="mb-3">
                              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                                {uploading ? <><Loader2 className="h-5 w-5 animate-spin" /><span>Uploading...</span></> : <><Upload className="h-5 w-5" /><span>Upload from device (Cloudinary)</span></>}
                              </label>
                            </div>
                            <input type="url" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} placeholder="Or paste image URL..." className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                            {formData.coverImage && (
                              <div className="mt-3 relative group">
                                <img src={formData.coverImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                <button type="button" onClick={() => setFormData({ ...formData, coverImage: '' })} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          {categories.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium mb-2">Category *</label>
                              <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" required>
                                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.nameEn}</option>))}
                              </select>
                            </div>
                          )}
                          {tags.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium mb-2">Tags</label>
                              <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                  <button key={tag.id} type="button" onClick={() => {const newTagIds = formData.tagIds.includes(tag.id) ? formData.tagIds.filter(id => id !== tag.id) : [...formData.tagIds, tag.id]; setFormData({ ...formData, tagIds: newTagIds })}} className={`px-4 py-2 rounded-full text-sm ${formData.tagIds.includes(tag.id) ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    {tag.nameEn}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium mb-2">Status *</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="h-5 w-5 rounded border-gray-300 text-indigo-600" />
                            <label htmlFor="featured">Featured Post</label>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setShowEditor(false)} disabled={saving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save</>}
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Posts List */}
                <div className="grid gap-6">
                  {posts.map((post, index) => (
                    <Card key={post.id} className="p-6">
                      <div className="flex justify-between items-start gap-6">
                        {post.coverImage && (
                          <div className="hidden md:block w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={post.coverImage} alt={post.titleEn} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <Badge className={post.status === 'published' ? 'bg-green-600' : post.status === 'draft' ? 'bg-yellow-600' : 'bg-gray-600'}>
                              {post.status === 'published' ? '✅ Published' : post.status === 'draft' ? '📝 Draft' : '📦 Archived'}
                            </Badge>
                            {post.featured && <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">⭐ Featured</Badge>}
                            <Badge variant="outline">📚 {post.category?.nameEn}</Badge>
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{post.titleEn}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{post.excerptEn}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(post.publishedAt).toLocaleDateString('en-US')}</div>
                            <div className="flex items-center gap-2"><Eye className="h-4 w-4" />{post.views}</div>
                            {post.tags?.length > 0 && <div className="flex items-center gap-2"><Tag className="h-4 w-4" />{post.tags.length} tags</div>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditPost(post)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(post.slug)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {posts.length === 0 && (
                  <div className="text-center py-20">
                    <h3 className="text-2xl font-bold mb-3">No posts yet</h3>
                    <p className="text-gray-600 mb-6">Start by creating your first blog post</p>
                    <Button onClick={handleNewPost} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <Plus className="h-5 w-5 mr-2" />Create Post
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Upload Images Section */}
            {activeTab === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Image className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Image Upload Center</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Upload images to Cloudinary and get direct links</p>
                </div>

                <Card className="p-8">
                  <div className="mb-8">
                    <label className="flex flex-col items-center justify-center gap-4 p-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 transition-all cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Upload className="h-8 w-8 text-indigo-600 animate-pulse" />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-indigo-600 mb-1">Uploading...</p>
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-16 w-16 text-indigo-600" />
                          <div className="text-center">
                            <p className="text-lg font-semibold mb-1">Click to select image</p>
                            <p className="text-sm text-gray-500">JPG, PNG, GIF, WebP (max 10MB)</p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  {uploadedUrl && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="rounded-lg overflow-hidden">
                        <img src={uploadedUrl} alt="Uploaded" className="w-full h-auto" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" value={uploadedUrl} readOnly className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg font-mono text-sm" />
                        <Button onClick={copyToClipboard} className={copied ? 'bg-green-600' : 'bg-indigo-600'}>
                          {copied ? <><Check className="h-4 w-4 mr-2" />Copied</> : <><Copy className="h-4 w-4 mr-2" />Copy</>}
                        </Button>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">✅ Image uploaded successfully to Cloudinary! You can use this link anywhere.</p>
                      </div>
                    </motion.div>
                  )}
                </Card>

                <Card className="mt-8 bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">📝 How to use:</h3>
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-2"><span className="font-bold">1.</span><span>Click the upload area and select an image from your device</span></li>
                    <li className="flex gap-2"><span className="font-bold">2.</span><span>Wait for the image to upload to Cloudinary</span></li>
                    <li className="flex gap-2"><span className="font-bold">3.</span><span>Copy the link and use it in your content</span></li>
                    <li className="flex gap-2"><span className="font-bold">4.</span><span>In HTML: <code className="bg-white/20 px-2 py-1 rounded">&lt;img src="link" /&gt;</code></span></li>
                  </ol>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Stat Card Component
function SimpleStatCard({ title, value, trend, trendUp, color }: { 
  title: string
  value: number
  trend: string
  trendUp: boolean
  color: 'green' | 'red' | 'blue'
}) {
  const colorClasses: Record<'green' | 'red' | 'blue', string> = {
    green: 'text-green-600 bg-green-50 dark:bg-green-950',
    red: 'text-red-600 bg-red-50 dark:bg-red-950',
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  }
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${colorClasses[color]}`}>
          {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend}
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </Card>
  )
}
