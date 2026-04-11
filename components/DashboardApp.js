'use client'
import { useState, useEffect, useContext, useCallback } from 'react'
import { NavContext } from '@/lib/nav-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, PlusCircle, List, FileText, Globe, Film, Kanban,
  Tags, Sheet, Image, Settings, LogOut, Loader2, Trash2, Eye, Edit,
  Sparkles, ArrowLeft, ExternalLink, ChevronRight, Search, Clock, Zap,
  BarChart3, TrendingUp, Activity, CheckCircle, AlertCircle, Archive, DollarSign
} from 'lucide-react'

const CONTENT_TYPES = ['Breaking News', 'News Analysis', 'Feature', 'Documentary', 'Explainer', 'Interview', 'Special Report', 'Video Script', 'Podcast Script']
const URGENCIES = ['low', 'normal', 'high', 'breaking']
const STATUSES = ['new', 'reviewing', 'rewritten', 'scripted', 'ready_to_publish', 'published', 'sent_to_video', 'video_complete', 'archived']
const VIDEO_STATUSES = ['script_needed', 'script_ready', 'in_avatar', 'in_edit', 'ready_upload', 'uploaded']

function statusColor(s) {
  const map = { new: 'bg-blue-100 text-blue-700', reviewing: 'bg-yellow-100 text-yellow-700', rewritten: 'bg-purple-100 text-purple-700',
    scripted: 'bg-indigo-100 text-indigo-700', ready_to_publish: 'bg-green-100 text-green-700', published: 'bg-green-600 text-white',
    sent_to_video: 'bg-orange-100 text-orange-700', video_complete: 'bg-teal-100 text-teal-700', archived: 'bg-gray-100 text-gray-600',
    draft: 'bg-gray-100 text-gray-600', script_needed: 'bg-red-100 text-red-700', script_ready: 'bg-blue-100 text-blue-700',
    in_avatar: 'bg-purple-100 text-purple-700', in_edit: 'bg-yellow-100 text-yellow-700', ready_upload: 'bg-green-100 text-green-700',
    uploaded: 'bg-green-600 text-white', mocked: 'bg-orange-100 text-orange-700' }
  return map[s] || 'bg-gray-100 text-gray-700'
}

// ===== LOGIN =====
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@diajemnews.com')
  const [password, setPassword] = useState('DiajemAdmin2025!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('diajem_token', data.token)
      onLogin(data.token, data.user)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy relative">
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1738190228336-aa4cf73874b7?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center'}} />
      <Card className="w-full max-w-md mx-4 relative z-10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mb-4">
            <span className="text-3xl font-serif font-bold text-brand-navy">DIAJEM</span>
            <p className="text-xs tracking-[0.2em] text-brand-gold font-semibold uppercase">Editorial Dashboard</p>
          </div>
          <CardDescription>Sign in to manage your newsroom</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-500 text-sm bg-red-50 rounded-md p-3">{error}</div>}
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <Button type="submit" className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-semibold" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ===== SIDEBAR =====
function Sidebar({ currentPath, navigate, user, onLogout }) {
  const items = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/dashboard/stories/new', icon: PlusCircle, label: 'New Story' },
    { path: '/dashboard/stories', icon: List, label: 'Story Queue' },
    { path: '/dashboard/articles', icon: FileText, label: 'Draft Articles' },
    { path: '/dashboard/articles/published', icon: Globe, label: 'Published' },
    { path: '/dashboard/scripts', icon: Film, label: 'Script Studio' },
    { path: '/dashboard/video', icon: Kanban, label: 'Video Board' },
    { path: '/dashboard/ads', icon: DollarSign, label: 'Advertisements' },
    { path: '/dashboard/categories', icon: Tags, label: 'Categories' },
    { path: '/dashboard/sheets', icon: Sheet, label: 'Sheets Sync' },
    { path: '/dashboard/media', icon: Image, label: 'Media Library' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="w-64 bg-brand-dark min-h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <button onClick={() => navigate('/dashboard')} className="block">
          <span className="text-2xl font-serif font-bold text-brand-gold">DIAJEM</span>
          <p className="text-[9px] tracking-[0.2em] text-brand-gold-light uppercase">Editorial Dashboard</p>
        </button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {items.map(item => {
            let active = false
            if (item.path === '/dashboard') {
              active = currentPath === '/dashboard'
            } else if (item.path === '/dashboard/articles') {
              active = currentPath === '/dashboard/articles'
            } else if (item.path === '/dashboard/stories') {
              active = currentPath === '/dashboard/stories'
            } else if (item.path === '/dashboard/scripts') {
              active = currentPath === '/dashboard/scripts'
            } else {
              active = currentPath === item.path || (currentPath.startsWith(item.path + '/'))
            }
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? 'bg-brand-gold/20 text-brand-gold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-white/10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-brand-gold text-xs mb-3 w-full transition">
          <Globe className="h-3.5 w-3.5" />View Public Site
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold text-sm font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-white justify-start" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />Logout
        </Button>
      </div>
    </div>
  )
}

// ===== LAYOUT =====
function DashboardLayout({ children, title, actions, currentPath, navigate, user, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath={currentPath} navigate={navigate} user={user} onLogout={onLogout} />
      <div className="ml-64">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif font-bold text-gray-900">{title}</h1>
            <div className="flex items-center gap-3">{actions}</div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

// ===== OVERVIEW =====
function OverviewPage({ navigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/stats').then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  const cards = [
    { label: 'Total Stories', value: stats?.totalStories || 0, icon: List, color: 'text-blue-600 bg-blue-50' },
    { label: 'Draft Articles', value: stats?.draftArticles || 0, icon: FileText, color: 'text-amber-600 bg-amber-50' },
    { label: 'Published', value: stats?.publishedArticles || 0, icon: Globe, color: 'text-green-600 bg-green-50' },
    { label: 'Scripts', value: stats?.totalScripts || 0, icon: Film, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className="text-3xl font-bold mt-1">{c.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${c.color}`}><c.icon className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.statusBreakdown && Object.keys(stats.statusBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge className={statusColor(status)}>{status.replace(/_/g, ' ')}</Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-center py-8">No stories yet. Create your first story!</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map(log => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <Activity className="h-4 w-4 text-brand-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700">{log.details}</p>
                      <p className="text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-center py-8">No activity yet.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => navigate('/dashboard/stories/new')} className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy">
          <PlusCircle className="h-4 w-4 mr-2" />New Story
        </Button>
        <Button variant="outline" onClick={() => navigate('/dashboard/stories')}>
          <List className="h-4 w-4 mr-2" />View Story Queue
        </Button>
      </div>
    </div>
  )
}

// ===== NEW STORY =====
function NewStoryPage({ navigate, categories, subcategories }) {
  const [form, setForm] = useState({
    source_url: '', source_title: '', source_text: '', source_outlet: '', source_notes: '',
    category_id: '', subcategory_id: '', region: '', country: '', content_type: 'Breaking News',
    urgency: 'normal', featured_image_url: '', tags: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredSubs = subcategories.filter(s => s.category_id === form.category_id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.source_title) { setError('Source title is required'); return }
    setSaving(true); setError('')
    try {
      const cat = categories.find(c => c.id === form.category_id)
      const sub = subcategories.find(s => s.id === form.subcategory_id)
      const data = await api('/stories', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          category_name: cat?.name || '',
          subcategory_name: sub?.name || '',
          tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        })
      })
      navigate(`/dashboard/stories/${data.id}`)
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e?.target ? e.target.value : e }))

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {error && <div className="text-red-500 text-sm bg-red-50 rounded-md p-3">{error}</div>}

      <Card>
        <CardHeader><CardTitle>Source Information</CardTitle><CardDescription>Enter the original source details</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Source Title *</Label><Input value={form.source_title} onChange={set('source_title')} placeholder="Original headline or title" /></div>
            <div><Label>Source URL</Label><Input value={form.source_url} onChange={set('source_url')} placeholder="https://..." /></div>
          </div>
          <div><Label>Source Text</Label><Textarea value={form.source_text} onChange={set('source_text')} placeholder="Paste the full source article text here..." rows={8} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Source Outlet</Label><Input value={form.source_outlet} onChange={set('source_outlet')} placeholder="e.g., BBC, Al Jazeera" /></div>
            <div><Label>Source Notes</Label><Input value={form.source_notes} onChange={set('source_notes')} placeholder="Any additional notes" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm(p => ({ ...p, category_id: v, subcategory_id: '' }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subcategory</Label>
              <Select value={form.subcategory_id} onValueChange={(v) => setForm(p => ({ ...p, subcategory_id: v }))} disabled={!form.category_id}>
                <SelectTrigger><SelectValue placeholder={form.category_id ? 'Select subcategory' : 'Select category first'} /></SelectTrigger>
                <SelectContent>
                  {filteredSubs.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Region</Label><Input value={form.region} onChange={set('region')} placeholder="e.g., West Africa" /></div>
            <div><Label>Country</Label><Input value={form.country} onChange={set('country')} placeholder="e.g., Nigeria" /></div>
            <div>
              <Label>Content Type</Label>
              <Select value={form.content_type} onValueChange={(v) => setForm(p => ({ ...p, content_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONTENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Urgency</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm(p => ({ ...p, urgency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{URGENCIES.map(u => <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={set('tags')} placeholder="politics, economy, trade" /></div>
            <div><Label>Featured Image URL</Label><Input value={form.featured_image_url} onChange={set('featured_image_url')} placeholder="https://..." /></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><PlusCircle className="h-4 w-4 mr-2" />Create Story</>}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/stories')}>Cancel</Button>
      </div>
    </form>
  )
}

// ===== STORY QUEUE =====
function StoryQueuePage({ navigate, categories, subcategories }) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [subFilter, setSubFilter] = useState('')
  const [search, setSearch] = useState('')

  const filteredSubs = subcategories.filter(s => s.category_id === catFilter)

  const loadStories = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter && filter !== 'all') params.set('status', filter)
      if (catFilter) params.set('category_id', catFilter)
      if (subFilter) params.set('subcategory_id', subFilter)
      if (search) params.set('search', search)
      const data = await api(`/stories?${params}`)
      setStories(data.stories || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [filter, catFilter, subFilter, search])

  useEffect(() => { loadStories() }, [loadStories])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search stories..." value={search} onChange={e => setSearch(e.target.value)}
            className="max-w-xs" onKeyDown={e => e.key === 'Enter' && loadStories()} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v === 'all' ? '' : v); setSubFilter('') }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {catFilter && filteredSubs.length > 0 && (
          <Select value={subFilter} onValueChange={(v) => setSubFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All subcategories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {filteredSubs.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Button variant="outline" size="sm" onClick={loadStories}><Search className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>
      ) : stories.length > 0 ? (
        <div className="space-y-3">
          {stories.map(story => (
            <Card key={story.id} className="hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/dashboard/stories/${story.id}`)}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={statusColor(story.status)}>{story.status.replace(/_/g, ' ')}</Badge>
                      {story.urgency === 'breaking' && <Badge className="bg-red-600 text-white">BREAKING</Badge>}
                      {story.urgency === 'high' && <Badge variant="outline" className="border-red-400 text-red-600">High</Badge>}
                      <Badge variant="outline">{story.content_type}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{story.source_title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {story.category_name && <span>{story.category_name}</span>}
                      {story.subcategory_name && <span className="text-brand-gold">/ {story.subcategory_name}</span>}
                      {story.region && <span>{story.region}</span>}
                      {story.source_outlet && <span>via {story.source_outlet}</span>}
                      <span>{new Date(story.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <List className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">No stories found</p>
          <Button onClick={() => navigate('/dashboard/stories/new')} className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy">
            <PlusCircle className="h-4 w-4 mr-2" />Create First Story
          </Button>
        </div>
      )}
    </div>
  )
}

// ===== STORY DETAIL =====
function StoryDetailPage({ storyId, navigate, categories }) {
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState('')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  const loadStory = useCallback(async () => {
    try {
      const data = await api(`/stories/${storyId}`)
      setStory(data)
      setEditForm(data)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }, [storyId])

  useEffect(() => { loadStory() }, [loadStory])

  const generateArticle = async () => {
    setAiLoading('article'); setError('')
    try {
      await api('/ai/rewrite', { method: 'POST', body: JSON.stringify({ story_id: storyId }) })
      await loadStory()
    } catch (e) { setError('AI Rewrite failed: ' + e.message) }
    setAiLoading('')
  }

  const generateScript = async () => {
    if (!story.article?.id) { setError('Generate an article first'); return }
    setAiLoading('script'); setError('')
    try {
      await api('/ai/script', { method: 'POST', body: JSON.stringify({ article_id: story.article.id }) })
      await loadStory()
    } catch (e) { setError('AI Script generation failed: ' + e.message) }
    setAiLoading('')
  }

  const updateStatus = async (status) => {
    try {
      await api(`/stories/${storyId}`, { method: 'PUT', body: JSON.stringify({ status }) })
      await loadStory()
    } catch (e) { setError(e.message) }
  }

  const publishArticle = async () => {
    if (!story.article?.id) return
    try {
      await api(`/articles/${story.article.id}`, { method: 'PUT', body: JSON.stringify({ is_published: true }) })
      await loadStory()
    } catch (e) { setError(e.message) }
  }

  const saveEdit = async () => {
    try {
      const cat = categories.find(c => c.id === editForm.category_id)
      await api(`/stories/${storyId}`, {
        method: 'PUT',
        body: JSON.stringify({
          source_title: editForm.source_title, source_url: editForm.source_url,
          source_text: editForm.source_text, source_outlet: editForm.source_outlet,
          source_notes: editForm.source_notes, category_id: editForm.category_id,
          category_name: cat?.name || editForm.category_name,
          subcategory: editForm.subcategory, region: editForm.region, country: editForm.country,
          content_type: editForm.content_type, urgency: editForm.urgency,
          featured_image_url: editForm.featured_image_url,
          tags: typeof editForm.tags === 'string' ? editForm.tags.split(',').map(t => t.trim()) : editForm.tags
        })
      })
      setEditing(false)
      await loadStory()
    } catch (e) { setError(e.message) }
  }

  const deleteStory = async () => {
    if (!confirm('Delete this story and all related articles/scripts?')) return
    try {
      await api(`/stories/${storyId}`, { method: 'DELETE' })
      navigate('/dashboard/stories')
    } catch (e) { setError(e.message) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>
  if (!story) return <div className="text-center py-16"><p className="text-gray-500">Story not found</p></div>

  return (
    <div className="space-y-6 max-w-5xl">
      {error && <div className="text-red-500 text-sm bg-red-50 rounded-md p-3 flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/stories')}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <Badge className={statusColor(story.status)}>{story.status.replace(/_/g, ' ')}</Badge>
        {story.urgency === 'breaking' && <Badge className="bg-red-600 text-white">BREAKING</Badge>}
      </div>

      {/* Story Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{story.source_title}</CardTitle>
              <CardDescription className="mt-1">
                {story.category_name && <span className="mr-3">{story.category_name}</span>}
                {story.region && <span className="mr-3">{story.region}</span>}
                {story.source_outlet && <span>via {story.source_outlet}</span>}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}><Edit className="h-4 w-4 mr-1" />{editing ? 'Cancel' : 'Edit'}</Button>
              <Button variant="destructive" size="sm" onClick={deleteStory}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Source Title</Label><Input value={editForm.source_title || ''} onChange={e => setEditForm(p => ({ ...p, source_title: e.target.value }))} /></div>
                <div><Label>Source URL</Label><Input value={editForm.source_url || ''} onChange={e => setEditForm(p => ({ ...p, source_url: e.target.value }))} /></div>
              </div>
              <div><Label>Source Text</Label><Textarea value={editForm.source_text || ''} onChange={e => setEditForm(p => ({ ...p, source_text: e.target.value }))} rows={6} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Source Outlet</Label><Input value={editForm.source_outlet || ''} onChange={e => setEditForm(p => ({ ...p, source_outlet: e.target.value }))} /></div>
                <div><Label>Region</Label><Input value={editForm.region || ''} onChange={e => setEditForm(p => ({ ...p, region: e.target.value }))} /></div>
                <div><Label>Country</Label><Input value={editForm.country || ''} onChange={e => setEditForm(p => ({ ...p, country: e.target.value }))} /></div>
              </div>
              <div className="flex gap-3">
                <Button onClick={saveEdit} className="bg-brand-gold text-brand-navy">Save Changes</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              {story.source_url && <p className="text-sm text-blue-600 mb-3"><a href={story.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">{story.source_url} <ExternalLink className="h-3 w-3" /></a></p>}
              {story.source_text && <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap">{story.source_text}</div>}
              {story.tags?.length > 0 && <div className="flex gap-2 mt-3 flex-wrap">{story.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Actions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Workflow</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <Button key={s} variant={story.status === s ? 'default' : 'outline'} size="sm"
                className={story.status === s ? 'bg-brand-gold text-brand-navy' : ''} onClick={() => updateStatus(s)}>
                {s.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-dashed border-purple-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-5 w-5 text-purple-500" />AI Article Rewrite</CardTitle>
            <CardDescription>Generate a professional article from the source material</CardDescription>
          </CardHeader>
          <CardContent>
            {story.article ? (
              <div>
                <p className="text-green-600 text-sm mb-2 flex items-center gap-1"><CheckCircle className="h-4 w-4" />Article generated</p>
                <p className="font-medium text-sm mb-2">{story.article.headline}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/articles/${story.article.id}`)}><Eye className="h-4 w-4 mr-1" />View/Edit Article</Button>
                  {!story.article.is_published && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={publishArticle}>
                      <Globe className="h-4 w-4 mr-1" />Publish
                    </Button>
                  )}
                  {story.article.is_published && <Badge className="bg-green-600 text-white">Published</Badge>}
                </div>
              </div>
            ) : (
              <Button onClick={generateArticle} disabled={!!aiLoading || !story.source_text}
                className="bg-purple-600 hover:bg-purple-700 text-white">
                {aiLoading === 'article' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> :
                  <><Sparkles className="h-4 w-4 mr-2" />Generate Article</>}
              </Button>
            )}
            {!story.source_text && !story.article && <p className="text-amber-600 text-xs mt-2">Add source text to enable AI rewrite</p>}
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-indigo-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Film className="h-5 w-5 text-indigo-500" />AI Script Generation</CardTitle>
            <CardDescription>Generate a video script from the article</CardDescription>
          </CardHeader>
          <CardContent>
            {story.script ? (
              <div>
                <p className="text-green-600 text-sm mb-2 flex items-center gap-1"><CheckCircle className="h-4 w-4" />Script generated</p>
                <p className="font-medium text-sm mb-2">{story.script.script_title}</p>
                <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/scripts/${story.script.id}`)}><Eye className="h-4 w-4 mr-1" />View/Edit Script</Button>
              </div>
            ) : (
              <Button onClick={generateScript} disabled={!!aiLoading || !story.article}
                className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {aiLoading === 'script' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> :
                  <><Sparkles className="h-4 w-4 mr-2" />Generate Script</>}
              </Button>
            )}
            {!story.article && !story.script && <p className="text-amber-600 text-xs mt-2">Generate an article first</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ===== ARTICLES LIST =====
function ArticlesListPage({ navigate, published = false, categories, subcategories }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('')
  const [subFilter, setSubFilter] = useState('')

  const filteredSubs = (subcategories || []).filter(s => s.category_id === catFilter)

  const loadArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('is_published', String(published))
      if (catFilter) params.set('category_id', catFilter)
      if (subFilter) params.set('subcategory_id', subFilter)
      const data = await api(`/articles?${params}`)
      setArticles(data.articles || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [published, catFilter, subFilter])

  useEffect(() => { loadArticles() }, [loadArticles])

  const togglePublish = async (article) => {
    try {
      await api(`/articles/${article.id}`, {
        method: 'PUT', body: JSON.stringify({ is_published: !article.is_published })
      })
      setArticles(prev => prev.filter(a => a.id !== article.id))
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v === 'all' ? '' : v); setSubFilter('') }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(categories || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {catFilter && filteredSubs.length > 0 && (
          <Select value={subFilter} onValueChange={(v) => setSubFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All subcategories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {filteredSubs.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      {articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map(article => (
            <Card key={article.id} className="hover:shadow-md transition">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/dashboard/articles/${article.id}`)}>
                    <div className="flex items-center gap-2 mb-1">
                      {article.is_published ? <Badge className="bg-green-600 text-white">Published</Badge> : <Badge variant="outline">Draft</Badge>}
                      {article.category_name && <Badge variant="outline">{article.category_name}</Badge>}
                      {article.subcategory_name && <span className="text-xs text-brand-gold">/ {article.subcategory_name}</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900">{article.headline}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">{article.excerpt}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{article.author_name}</span>
                      {article.read_time > 0 && <span>{article.read_time} min read</span>}
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/articles/${article.id}`)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => togglePublish(article)}>
                      {article.is_published ? <Archive className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    </Button>
                    {article.is_published && article.public_url && (
                      <Button variant="outline" size="sm" onClick={() => window.open(article.public_url, '_blank')}><ExternalLink className="h-4 w-4" /></Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{published ? 'No published articles yet' : 'No draft articles yet'}</p>
        </div>
      )}
    </div>
  )
}

// ===== ARTICLE EDIT =====
function ArticleEditPage({ articleId, navigate }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    api(`/articles/${articleId}`).then(data => { setArticle(data); setForm(data) })
      .catch(console.error).finally(() => setLoading(false))
  }, [articleId])

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api(`/articles/${articleId}`, {
        method: 'PUT', body: JSON.stringify({
          headline: form.headline, excerpt: form.excerpt, body_html: form.body_html,
          seo_title: form.seo_title, meta_description: form.meta_description,
          author_name: form.author_name, featured_image_url: form.featured_image_url,
          tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()) : form.tags,
          read_time: parseInt(form.read_time) || 0
        })
      })
      setArticle(updated)
      setForm(updated)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const publish = async () => {
    try {
      const updated = await api(`/articles/${articleId}`, {
        method: 'PUT', body: JSON.stringify({ is_published: true, headline: form.headline })
      })
      setArticle(updated)
      setForm(updated)
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>
  if (!article) return <p className="text-gray-500">Article not found</p>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/articles')}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        {article.is_published ? <Badge className="bg-green-600 text-white">Published</Badge> : <Badge variant="outline">Draft</Badge>}
      </div>

      <Card>
        <CardHeader><CardTitle>Article Editor</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Headline</Label><Input value={form.headline || ''} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))} /></div>
          <div><Label>Excerpt</Label><Textarea value={form.excerpt || ''} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={3} /></div>
          <div><Label>Body (HTML)</Label><Textarea value={form.body_html || ''} onChange={e => setForm(p => ({ ...p, body_html: e.target.value }))} rows={15} className="font-mono text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>SEO Title</Label><Input value={form.seo_title || ''} onChange={e => setForm(p => ({ ...p, seo_title: e.target.value }))} /></div>
            <div><Label>Meta Description</Label><Input value={form.meta_description || ''} onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Author</Label><Input value={form.author_name || ''} onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))} /></div>
            <div><Label>Read Time (min)</Label><Input type="number" value={form.read_time || ''} onChange={e => setForm(p => ({ ...p, read_time: e.target.value }))} /></div>
            <div><Label>Featured Image URL</Label><Input value={form.featured_image_url || ''} onChange={e => setForm(p => ({ ...p, featured_image_url: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={save} className="bg-brand-gold text-brand-navy" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
            {!article.is_published && <Button onClick={publish} className="bg-green-600 hover:bg-green-700 text-white"><Globe className="h-4 w-4 mr-2" />Publish</Button>}
          </div>
        </CardContent>
      </Card>

      {form.body_html && (
        <Card>
          <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: form.body_html }} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ===== SCRIPTS LIST =====
function ScriptsListPage({ navigate }) {
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/scripts').then(data => setScripts(data || []))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  return scripts.length > 0 ? (
    <div className="space-y-3">
      {scripts.map(script => (
        <Card key={script.id} className="hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/dashboard/scripts/${script.id}`)}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={statusColor(script.status)}>{script.status}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900">{script.script_title}</h3>
                <p className="text-gray-500 text-sm mt-1">{script.short_hook}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ) : (
    <div className="text-center py-16">
      <Film className="h-16 w-16 text-gray-200 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">No scripts yet. Generate scripts from articles in the Story Queue.</p>
    </div>
  )
}

// ===== SCRIPT EDIT =====
function ScriptEditPage({ scriptId, navigate }) {
  const [script, setScript] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    api(`/scripts/${scriptId}`).then(data => { setScript(data); setForm(data) })
      .catch(console.error).finally(() => setLoading(false))
  }, [scriptId])

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api(`/scripts/${scriptId}`, {
        method: 'PUT', body: JSON.stringify({
          script_title: form.script_title, short_hook: form.short_hook, full_script: form.full_script,
          anchor_intro: form.anchor_intro, lower_thirds: form.lower_thirds, on_screen_text: form.on_screen_text,
          thumbnail_text: form.thumbnail_text, youtube_description: form.youtube_description,
          youtube_tags: form.youtube_tags, podcast_intro: form.podcast_intro, podcast_version: form.podcast_version,
          status: form.status
        })
      })
      setScript(updated); setForm(updated)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>
  if (!script) return <p className="text-gray-500">Script not found</p>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/scripts')}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <Badge className={statusColor(script.status)}>{script.status}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Script Editor</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="script" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="podcast">Podcast</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="space-y-4">
              <div><Label>Script Title</Label><Input value={form.script_title || ''} onChange={e => setForm(p => ({ ...p, script_title: e.target.value }))} /></div>
              <div><Label>Short Hook (15 words max)</Label><Input value={form.short_hook || ''} onChange={e => setForm(p => ({ ...p, short_hook: e.target.value }))} /></div>
              <div><Label>Anchor Intro</Label><Textarea value={form.anchor_intro || ''} onChange={e => setForm(p => ({ ...p, anchor_intro: e.target.value }))} rows={3} /></div>
              <div><Label>Full Script</Label><Textarea value={form.full_script || ''} onChange={e => setForm(p => ({ ...p, full_script: e.target.value }))} rows={12} /></div>
            </TabsContent>

            <TabsContent value="youtube" className="space-y-4">
              <div><Label>Thumbnail Text</Label><Input value={form.thumbnail_text || ''} onChange={e => setForm(p => ({ ...p, thumbnail_text: e.target.value }))} /></div>
              <div><Label>YouTube Description</Label><Textarea value={form.youtube_description || ''} onChange={e => setForm(p => ({ ...p, youtube_description: e.target.value }))} rows={6} /></div>
              <div><Label>YouTube Tags</Label><Input value={form.youtube_tags || ''} onChange={e => setForm(p => ({ ...p, youtube_tags: e.target.value }))} /></div>
            </TabsContent>

            <TabsContent value="podcast" className="space-y-4">
              <div><Label>Podcast Intro</Label><Textarea value={form.podcast_intro || ''} onChange={e => setForm(p => ({ ...p, podcast_intro: e.target.value }))} rows={4} /></div>
              <div><Label>Podcast Version</Label><Textarea value={form.podcast_version || ''} onChange={e => setForm(p => ({ ...p, podcast_version: e.target.value }))} rows={10} /></div>
            </TabsContent>

            <TabsContent value="production" className="space-y-4">
              <div><Label>Lower Thirds</Label><Textarea value={form.lower_thirds || ''} onChange={e => setForm(p => ({ ...p, lower_thirds: e.target.value }))} rows={4} /></div>
              <div><Label>On-Screen Text</Label><Textarea value={form.on_screen_text || ''} onChange={e => setForm(p => ({ ...p, on_screen_text: e.target.value }))} rows={4} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status || 'draft'} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6">
            <Button onClick={save} className="bg-brand-gold text-brand-navy" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Script'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ===== VIDEO BOARD =====
function VideoBoardPage({ navigate }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', notes: '' })

  const loadTasks = async () => {
    try {
      const data = await api('/video-tasks')
      setTasks(data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadTasks() }, [])

  const addTask = async () => {
    if (!newTask.title) return
    try {
      await api('/video-tasks', { method: 'POST', body: JSON.stringify(newTask) })
      setNewTask({ title: '', notes: '' }); setShowAdd(false)
      loadTasks()
    } catch (e) { console.error(e) }
  }

  const moveTask = async (taskId, newStatus) => {
    try {
      await api(`/video-tasks/${taskId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
      loadTasks()
    } catch (e) { console.error(e) }
  }

  const deleteTask = async (taskId) => {
    try {
      await api(`/video-tasks/${taskId}`, { method: 'DELETE' })
      loadTasks()
    } catch (e) { console.error(e) }
  }

  const columns = [
    { key: 'script_needed', label: 'Script Needed', color: 'border-red-400' },
    { key: 'script_ready', label: 'Script Ready', color: 'border-blue-400' },
    { key: 'in_avatar', label: 'In Avatar Production', color: 'border-purple-400' },
    { key: 'in_edit', label: 'In Edit', color: 'border-yellow-400' },
    { key: 'ready_upload', label: 'Ready to Upload', color: 'border-green-400' },
    { key: 'uploaded', label: 'Uploaded', color: 'border-emerald-400' },
  ]

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{tasks.length} total tasks</p>
        <Button size="sm" onClick={() => setShowAdd(true)} className="bg-brand-gold text-brand-navy"><PlusCircle className="h-4 w-4 mr-1" />Add Task</Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Task title" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} />
            <Input placeholder="Notes" value={newTask.notes} onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={addTask} className="bg-brand-gold text-brand-navy">Add</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {columns.map(col => (
          <div key={col.key} className={`rounded-lg border-t-4 ${col.color} bg-white p-3 min-h-[200px]`}>
            <h3 className="text-xs font-semibold text-gray-700 uppercase mb-3">{col.label}</h3>
            <div className="space-y-2">
              {tasks.filter(t => t.status === col.key).map(task => (
                <div key={task.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-gray-900 text-xs">{task.title}</p>
                  {task.notes && <p className="text-gray-500 text-xs mt-1">{task.notes}</p>}
                  <div className="flex items-center gap-1 mt-2">
                    <Select value={task.status} onValueChange={(v) => moveTask(task.id, v)}>
                      <SelectTrigger className="h-6 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{VIDEO_STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteTask(task.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== ADS MANAGEMENT PAGE =====
function AdsPage({ navigate }) {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingAd, setEditingAd] = useState(null)
  const [form, setForm] = useState({ name: '', ad_type: 'image', image_url: '', link_url: '', embed_code: '', zone: 'top_banner', is_active: true })

  const adZones = [
    { value: 'top_banner', label: 'Top Banner (728x90)' },
    { value: 'homepage_inline', label: 'Homepage Inline Banner' },
    { value: 'sidebar_1', label: 'Sidebar Ad 1' },
    { value: 'sidebar_2', label: 'Sidebar Ad 2' },
    { value: 'article_top', label: 'Article Top Ad' },
    { value: 'article_mid', label: 'Article Mid Ad' },
    { value: 'article_end', label: 'Article End Ad' },
    { value: 'article_sidebar', label: 'Article Sidebar Widget' },
    { value: 'category_sidebar', label: 'Category Sidebar' }
  ]

  const loadAds = async () => {
    try {
      const data = await api('/ads')
      setAds(data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadAds() }, [])

  const saveAd = async () => {
    if (!form.name) return alert('Name is required')
    if (form.ad_type === 'image' && !form.image_url) return alert('Image URL required for image ads')
    if (form.ad_type === 'code' && !form.embed_code) return alert('Embed code required for code ads')
    try {
      if (editingAd) {
        await api(`/ads/${editingAd.id}`, { method: 'PUT', body: JSON.stringify(form) })
      } else {
        await api('/ads', { method: 'POST', body: JSON.stringify(form) })
      }
      setForm({ name: '', ad_type: 'image', image_url: '', link_url: '', embed_code: '', zone: 'top_banner', is_active: true })
      setShowAdd(false)
      setEditingAd(null)
      loadAds()
    } catch (e) { console.error(e) }
  }

  const deleteAd = async (id) => {
    if (!confirm('Delete this ad?')) return
    try {
      await api(`/ads/${id}`, { method: 'DELETE' })
      loadAds()
    } catch (e) { console.error(e) }
  }

  const editAd = (ad) => {
    setEditingAd(ad)
    setForm({ 
      name: ad.name, 
      ad_type: ad.ad_type || 'image',
      image_url: ad.image_url || '', 
      link_url: ad.link_url || '', 
      embed_code: ad.embed_code || '',
      zone: ad.zone, 
      is_active: ad.is_active 
    })
    setShowAdd(true)
  }

  const toggleActive = async (ad) => {
    try {
      await api(`/ads/${ad.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !ad.is_active }) })
      loadAds()
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{ads.length} advertisements</p>
        <Button size="sm" onClick={() => { setShowAdd(true); setEditingAd(null); setForm({ name: '', ad_type: 'image', image_url: '', link_url: '', embed_code: '', zone: 'top_banner', is_active: true }) }} className="bg-brand-gold text-brand-navy">
          <PlusCircle className="h-4 w-4 mr-1" />Add Advertisement
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingAd ? 'Edit' : 'Add'} Advertisement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Ad Name</Label>
              <Input placeholder="e.g., Expedia Widget - Article End" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Ad Type</Label>
              <Select value={form.ad_type} onValueChange={(v) => setForm(p => ({ ...p, ad_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image Ad (Banner)</SelectItem>
                  <SelectItem value="code">Code/Embed (Widget, Script)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {form.ad_type === 'image' && (
              <>
                <div>
                  <Label>Image URL</Label>
                  <Input placeholder="https://example.com/ad-image.jpg" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} />
                  <p className="text-xs text-gray-500 mt-1">Upload image via Media Library first, then paste URL here</p>
                </div>
                <div>
                  <Label>Click URL (Link)</Label>
                  <Input placeholder="https://example.com/landing-page" value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} />
                </div>
              </>
            )}
            
            {form.ad_type === 'code' && (
              <div>
                <Label>Embed Code (HTML/JavaScript)</Label>
                <Textarea 
                  placeholder='<div class="eg-widget" data-widget="search">...</div><script src="..."></script>' 
                  value={form.embed_code} 
                  onChange={e => setForm(p => ({ ...p, embed_code: e.target.value }))}
                  rows={6}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">Paste your affiliate code, widget script, or embed code here</p>
              </div>
            )}
            
            <div>
              <Label>Ad Zone</Label>
              <Select value={form.zone} onValueChange={(v) => setForm(p => ({ ...p, zone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {adZones.map(z => <SelectItem key={z.value} value={z.value}>{z.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm(p => ({ ...p, is_active: v }))} />
              <Label>Active</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveAd} className="bg-brand-gold text-brand-navy">{editingAd ? 'Update' : 'Add'}</Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setEditingAd(null) }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map(ad => (
          <Card key={ad.id}>
            <CardContent className="pt-4">
              {ad.ad_type === 'image' && ad.image_url && (
                <div className="aspect-video bg-gray-100 mb-3 rounded overflow-hidden">
                  <img src={ad.image_url} alt={ad.name} className="w-full h-full object-cover" />
                </div>
              )}
              {ad.ad_type === 'code' && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
                  <code className="text-xs text-gray-600 break-all line-clamp-3">{ad.embed_code}</code>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{ad.name}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{adZones.find(z => z.value === ad.zone)?.label}</Badge>
                  </div>
                  <Switch checked={ad.is_active} onCheckedChange={() => toggleActive(ad)} />
                </div>
                {ad.link_url && <p className="text-xs text-gray-500 truncate">{ad.link_url}</p>}
                {ad.ad_type === 'code' && <p className="text-xs text-gray-400 italic">Code/Embed Ad</p>}
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" onClick={() => editAd(ad)} className="text-xs h-7"><Edit className="h-3 w-3 mr-1" />Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteAd(ad.id)} className="text-xs h-7"><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  {ad.link_url && (
                    <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="text-xs h-7"><ExternalLink className="h-3 w-3" /></Button>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ads.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-500">
          <p>No advertisements yet. Click "Add Advertisement" to get started.</p>
        </div>
      )}
    </div>
  )
}

// ===== CATEGORIES PAGE =====
function CategoriesPage({ categories, subcategories, onRefresh }) {
  const [loading, setLoading] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [newSubName, setNewSubName] = useState('')
  const [newSubCatId, setNewSubCatId] = useState('')
  const [expandedCat, setExpandedCat] = useState('')

  const addCat = async () => {
    if (!newCat.trim()) return
    setLoading(true)
    try {
      await api('/categories', { method: 'POST', body: JSON.stringify({ name: newCat.trim(), order: (categories || []).length + 1 }) })
      setNewCat('')
      onRefresh()
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const deleteCat = async (id) => {
    if (!confirm('Delete this category and all its subcategories?')) return
    try {
      // Delete subcategories first
      const subs = (subcategories || []).filter(s => s.category_id === id)
      for (const sub of subs) {
        await api(`/subcategories/${sub.id}`, { method: 'DELETE' })
      }
      await api(`/categories/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (e) { console.error(e) }
  }

  const addSub = async () => {
    if (!newSubName.trim() || !newSubCatId) return
    setLoading(true)
    try {
      const subs = (subcategories || []).filter(s => s.category_id === newSubCatId)
      await api('/subcategories', {
        method: 'POST',
        body: JSON.stringify({ name: newSubName.trim(), category_id: newSubCatId, order: subs.length + 1 })
      })
      setNewSubName('')
      onRefresh()
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const deleteSub = async (id) => {
    if (!confirm('Delete this subcategory?')) return
    try {
      await api(`/subcategories/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Add Category</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="New category name" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} />
            <Button onClick={addCat} className="bg-brand-gold text-brand-navy" disabled={loading}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Add Subcategory</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select value={newSubCatId} onValueChange={setNewSubCatId}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Parent category" /></SelectTrigger>
              <SelectContent>{(categories || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Subcategory name" value={newSubName} onChange={e => setNewSubName(e.target.value)} className="flex-1" onKeyDown={e => e.key === 'Enter' && addSub()} />
            <Button onClick={addSub} className="bg-brand-gold text-brand-navy" disabled={loading || !newSubCatId}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(categories || []).map(cat => {
          const catSubs = (subcategories || []).filter(s => s.category_id === cat.id)
          const isExpanded = expandedCat === cat.id
          return (
            <Card key={cat.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 text-left flex-1" onClick={() => setExpandedCat(isExpanded ? '' : cat.id)}>
                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <span className="font-semibold">{cat.name}</span>
                    <Badge variant="outline" className="text-xs">{catSubs.length} subcategories</Badge>
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCat(cat.id)}><Trash2 className="h-4 w-4 text-gray-400" /></Button>
                </div>
                {isExpanded && catSubs.length > 0 && (
                  <div className="mt-3 ml-6 space-y-1">
                    {catSubs.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-md text-sm">
                        <span>{sub.name}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteSub(sub.id)}><Trash2 className="h-3 w-3 text-gray-400" /></Button>
                      </div>
                    ))}
                  </div>
                )}
                {isExpanded && catSubs.length === 0 && (
                  <p className="mt-3 ml-6 text-sm text-gray-400">No subcategories</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ===== SHEETS SYNC =====
function SheetsPage() {
  const [settings, setSettings] = useState({})
  const [exports, setExports] = useState([])
  const [loading, setLoading] = useState(true)
  const [sheetId, setSheetId] = useState('')
  const [tabName, setTabName] = useState('Sheet1')

  useEffect(() => {
    Promise.all([api('/settings'), api('/sheet-exports')])
      .then(([s, e]) => {
        setSettings(s)
        setSheetId(s.google_sheet_id || '')
        setTabName(s.google_sheet_tab || 'Sheet1')
        setExports(e || [])
      }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const saveSettings = async () => {
    try {
      await api('/settings', {
        method: 'PUT', body: JSON.stringify({ google_sheet_id: sheetId, google_sheet_tab: tabName })
      })
    } catch (e) { console.error(e) }
  }

  const doExport = async () => {
    try {
      await api('/sheet-exports', { method: 'POST', body: JSON.stringify({}) })
      const e = await api('/sheet-exports')
      setExports(e || [])
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets Configuration</CardTitle>
          <CardDescription>Configure the Google Sheet for data export. Note: Google Sheets API credentials are not yet configured, exports will be logged locally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Google Sheet ID</Label><Input value={sheetId} onChange={e => setSheetId(e.target.value)} placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" /></div>
          <div><Label>Tab Name</Label><Input value={tabName} onChange={e => setTabName(e.target.value)} placeholder="Sheet1" /></div>
          <div className="flex gap-2">
            <Button onClick={saveSettings} className="bg-brand-gold text-brand-navy">Save Settings</Button>
            <Button variant="outline" onClick={doExport}><Sheet className="h-4 w-4 mr-2" />Export Now</Button>
          </div>
        </CardContent>
      </Card>

      {exports.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Export History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exports.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <Badge className={statusColor(exp.status)}>{exp.status}</Badge>
                    <span className="ml-2 text-gray-500">{new Date(exp.exported_at).toLocaleString()}</span>
                  </div>
                  {exp.error_message && <span className="text-gray-400 text-xs">{exp.error_message}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ===== MEDIA LIBRARY =====
function MediaLibraryPage() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [copied, setCopied] = useState('')

  const loadMedia = async () => {
    try {
      const data = await api('/media')
      setMedia(data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadMedia() }, [])

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const token = localStorage.getItem('diajem_token')
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        })
        if (!res.ok) {
          const errData = await res.json()
          console.error('Upload error:', errData.error)
        }
      } catch (e) { console.error('Upload failed:', e) }
    }
    setUploading(false)
    loadMedia()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const handleFileInput = (e) => {
    handleUpload(e.target.files)
    e.target.value = ''
  }

  const deleteMedia = async (id) => {
    if (!confirm('Delete this file?')) return
    try {
      await api(`/media/${id}`, { method: 'DELETE' })
      setMedia(prev => prev.filter(m => m.id !== id))
    } catch (e) { console.error(e) }
  }

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(''), 2000)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const isImage = (mime) => mime?.startsWith('image/')

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-brand-gold bg-brand-gold/5' : 'border-gray-300 hover:border-brand-gold/50'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-brand-gold" />
            <p className="text-gray-600 font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center">
              <Image className="h-8 w-8 text-brand-gold" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">Drag and drop files here</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
            </div>
            <label className="cursor-pointer">
              <input type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={handleFileInput} className="hidden" />
              <span className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">Browse Files</span>
            </label>
            <p className="text-xs text-gray-400">Supports images, videos, audio, PDFs, and documents</p>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {media.length > 0 ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">{media.length} file{media.length !== 1 ? 's' : ''} uploaded</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map(item => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="aspect-square bg-gray-100 relative">
                  {isImage(item.mime_type) ? (
                    <img src={item.url} alt={item.original_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <FileText className="h-12 w-12 text-gray-300 mb-2" />
                      <span className="text-xs text-gray-500 text-center truncate w-full">{item.original_name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => copyUrl(item.url)} className="h-8 text-xs">
                      {copied === item.url ? <><CheckCircle className="h-3 w-3 mr-1" />Copied</> : <><ExternalLink className="h-3 w-3 mr-1" />Copy URL</>}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMedia(item.id)} className="h-8 text-xs">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-gray-700 truncate" title={item.original_name}>{item.original_name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-400">{formatSize(item.size)}</span>
                    <span className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No files uploaded yet. Drag and drop or click browse to upload.</p>
        </div>
      )}
    </div>
  )
}

// ===== SETTINGS =====
function SettingsPage() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [siteName, setSiteName] = useState('Diajem Global Black News')
  const [siteDesc, setSiteDesc] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  useEffect(() => {
    api('/settings').then(data => {
      setSettings(data)
      setSiteName(data.site_name || 'Diajem Global Black News')
      setSiteDesc(data.site_description || '')
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    try {
      await api('/settings', {
        method: 'PUT', body: JSON.stringify({ site_name: siteName, site_description: siteDesc })
      })
    } catch (e) { console.error(e) }
  }

  const syncYouTube = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const result = await api('/youtube/sync', { method: 'POST' })
      setSyncResult(result)
      alert(`Success! Synced ${result.count} new videos from YouTube.`)
    } catch (e) {
      console.error(e)
      alert('YouTube sync failed: ' + e.message)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader><CardTitle>Site Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Site Name</Label><Input value={siteName} onChange={e => setSiteName(e.target.value)} /></div>
          <div><Label>Site Description</Label><Textarea value={siteDesc} onChange={e => setSiteDesc(e.target.value)} rows={3} /></div>
          <Button onClick={save} className="bg-brand-gold text-brand-navy">Save Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>YouTube Integration</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Sync videos from your YouTube channels to Diajem TV category</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm"><strong>Connected Channels:</strong></p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• @diajemnews → Diajem TV (News)</li>
              <li>• @diajemsports → Diajem TV (Sports)</li>
            </ul>
          </div>
          <Button onClick={syncYouTube} disabled={syncing} className="bg-brand-gold text-brand-navy">
            {syncing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing...</> : 'Sync YouTube Videos'}
          </Button>
          {syncResult && (
            <p className="text-sm text-green-600">✓ {syncResult.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ===== MAIN DASHBOARD ROUTER =====
export default function DashboardApp() {
  const { path, navigate } = useContext(NavContext)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [seeded, setSeeded] = useState(false)
  const pathname = path.split('?')[0]

  useEffect(() => {
    const stored = localStorage.getItem('diajem_token')
    if (stored) {
      setToken(stored)
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${stored}` } })
        .then(r => r.json())
        .then(data => {
          if (data.user) setUser(data.user)
          else { localStorage.removeItem('diajem_token'); setToken(null) }
        })
        .catch(() => { localStorage.removeItem('diajem_token'); setToken(null) })
        .finally(() => setAuthChecked(true))
    } else {
      setAuthChecked(true)
    }
  }, [])

  // Auto-seed on first load
  useEffect(() => {
    if (!seeded) {
      fetch('/api/seed', { method: 'POST' }).then(() => setSeeded(true)).catch(console.error)
    }
  }, [seeded])

  // Load categories and subcategories when authenticated
  useEffect(() => {
    if (token) {
      api('/categories').then(setCategories).catch(console.error)
      api('/subcategories').then(setSubcategories).catch(console.error)
    }
  }, [token])

  const handleLogin = (t, u) => { setToken(t); setUser(u) }
  const handleLogout = () => {
    setToken(null); setUser(null)
    localStorage.removeItem('diajem_token')
    navigate('/dashboard')
  }

  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy">
      <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
    </div>
  )

  if (!token) return <LoginPage onLogin={handleLogin} />

  // Determine page title and content
  let title = 'Overview'
  let content = <OverviewPage navigate={navigate} />
  let actions = null

  if (pathname === '/dashboard/stories/new') {
    title = 'New Story'
    content = <NewStoryPage navigate={navigate} categories={categories} subcategories={subcategories} />
  } else if (pathname === '/dashboard/stories' && !pathname.includes('/dashboard/stories/')) {
    title = 'Story Queue'
    content = <StoryQueuePage navigate={navigate} categories={categories} subcategories={subcategories} />
    actions = <Button size="sm" onClick={() => navigate('/dashboard/stories/new')} className="bg-brand-gold text-brand-navy"><PlusCircle className="h-4 w-4 mr-1" />New Story</Button>
  } else if (pathname.match(/^\/dashboard\/stories\/[^\/]+$/)) {
    const storyId = pathname.split('/dashboard/stories/')[1]
    title = 'Story Detail'
    content = <StoryDetailPage storyId={storyId} navigate={navigate} categories={categories} subcategories={subcategories} />
  } else if (pathname === '/dashboard/articles/published') {
    title = 'Published Articles'
    content = <ArticlesListPage navigate={navigate} published={true} categories={categories} subcategories={subcategories} />
  } else if (pathname === '/dashboard/articles' && !pathname.includes('/dashboard/articles/')) {
    title = 'Draft Articles'
    content = <ArticlesListPage navigate={navigate} published={false} categories={categories} subcategories={subcategories} />
  } else if (pathname.match(/^\/dashboard\/articles\/[^\/]+$/) && !pathname.includes('published')) {
    const articleId = pathname.split('/dashboard/articles/')[1]
    title = 'Article Editor'
    content = <ArticleEditPage articleId={articleId} navigate={navigate} />
  } else if (pathname === '/dashboard/scripts' && !pathname.includes('/dashboard/scripts/')) {
    title = 'Script Studio'
    content = <ScriptsListPage navigate={navigate} />
  } else if (pathname.match(/^\/dashboard\/scripts\/[^\/]+$/)) {
    const scriptId = pathname.split('/dashboard/scripts/')[1]
    title = 'Script Editor'
    content = <ScriptEditPage scriptId={scriptId} navigate={navigate} />
  } else if (pathname === '/dashboard/video') {
    title = 'Video Production Board'
    content = <VideoBoardPage navigate={navigate} />
  } else if (pathname === '/dashboard/ads') {
    title = 'Advertisement Management'
    content = <AdsPage navigate={navigate} />
  } else if (pathname === '/dashboard/categories') {
    title = 'Categories'
    content = <CategoriesPage categories={categories} subcategories={subcategories} onRefresh={() => {
      api('/categories').then(setCategories).catch(console.error)
      api('/subcategories').then(setSubcategories).catch(console.error)
    }} />
  } else if (pathname === '/dashboard/sheets') {
    title = 'Google Sheets Sync'
    content = <SheetsPage />
  } else if (pathname === '/dashboard/media') {
    title = 'Media Library'
    content = <MediaLibraryPage />
  } else if (pathname === '/dashboard/settings') {
    title = 'Settings'
    content = <SettingsPage />
  }

  return (
    <DashboardLayout title={title} actions={actions} currentPath={pathname} navigate={navigate} user={user} onLogout={handleLogout}>
      {content}
    </DashboardLayout>
  )
}
