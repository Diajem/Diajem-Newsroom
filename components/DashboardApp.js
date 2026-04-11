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
  BarChart3, TrendingUp, Activity, CheckCircle, AlertCircle, Archive
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
    { path: '/dashboard/categories', icon: Tags, label: 'Categories' },
    { path: '/dashboard/sheets', icon: Sheet, label: 'Sheets Sync' },
    { path: '/dashboard/media', icon: Image, label: 'Media Library' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="w-64 bg-brand-dark min-h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <button onClick={() => navigate('/')} className="block">
          <span className="text-2xl font-serif font-bold text-brand-gold">DIAJEM</span>
          <p className="text-[9px] tracking-[0.2em] text-brand-gold-light uppercase">Editorial Dashboard</p>
        </button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {items.map(item => {
            const active = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path) && item.path.length > '/dashboard'.length)
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
function NewStoryPage({ navigate, categories }) {
  const [form, setForm] = useState({
    source_url: '', source_title: '', source_text: '', source_outlet: '', source_notes: '',
    category_id: '', subcategory: '', region: '', country: '', content_type: 'Breaking News',
    urgency: 'normal', featured_image_url: '', tags: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.source_title) { setError('Source title is required'); return }
    setSaving(true); setError('')
    try {
      const cat = categories.find(c => c.id === form.category_id)
      const data = await api('/stories', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          category_name: cat?.name || '',
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
              <Select value={form.category_id} onValueChange={(v) => setForm(p => ({ ...p, category_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Subcategory</Label><Input value={form.subcategory} onChange={set('subcategory')} placeholder="Optional subcategory" /></div>
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
function StoryQueuePage({ navigate }) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  const loadStories = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.set('status', filter)
      if (search) params.set('search', search)
      const data = await api(`/stories?${params}`)
      setStories(data.stories || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [filter, search])

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
function ArticlesListPage({ navigate, published = false }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api(`/articles?is_published=${published}`).then(data => setArticles(data.articles || []))
      .catch(console.error).finally(() => setLoading(false))
  }, [published])

  const togglePublish = async (article) => {
    try {
      await api(`/articles/${article.id}`, {
        method: 'PUT', body: JSON.stringify({ is_published: !article.is_published })
      })
      setArticles(prev => prev.filter(a => a.id !== article.id))
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  return articles.length > 0 ? (
    <div className="space-y-3">
      {articles.map(article => (
        <Card key={article.id} className="hover:shadow-md transition">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/dashboard/articles/${article.id}`)}>
                <div className="flex items-center gap-2 mb-1">
                  {article.is_published ? <Badge className="bg-green-600 text-white">Published</Badge> : <Badge variant="outline">Draft</Badge>}
                  {article.category_name && <Badge variant="outline">{article.category_name}</Badge>}
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

// ===== CATEGORIES PAGE =====
function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCat, setNewCat] = useState('')

  const load = async () => {
    try {
      const data = await api('/categories')
      setCategories(data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addCat = async () => {
    if (!newCat.trim()) return
    try {
      await api('/categories', { method: 'POST', body: JSON.stringify({ name: newCat.trim(), order: categories.length + 1 }) })
      setNewCat('')
      load()
    } catch (e) { console.error(e) }
  }

  const deleteCat = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await api(`/categories/${id}`, { method: 'DELETE' })
      load()
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex gap-2">
        <Input placeholder="New category name" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} />
        <Button onClick={addCat} className="bg-brand-gold text-brand-navy">Add</Button>
      </div>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div>
              <span className="font-medium">{cat.name}</span>
              <span className="text-gray-400 text-sm ml-2">/{cat.slug}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => deleteCat(cat.id)}><Trash2 className="h-4 w-4 text-gray-400" /></Button>
          </div>
        ))}
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
  return (
    <div className="text-center py-16">
      <Image className="h-16 w-16 text-gray-200 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-500 mb-2">Media Library</h3>
      <p className="text-gray-400">Coming soon. Media uploads and management will be available here.</p>
    </div>
  )
}

// ===== SETTINGS =====
function SettingsPage() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [siteName, setSiteName] = useState('Diajem Global Black News')
  const [siteDesc, setSiteDesc] = useState('')

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

  // Load categories when authenticated
  useEffect(() => {
    if (token) {
      api('/categories').then(setCategories).catch(console.error)
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
    content = <NewStoryPage navigate={navigate} categories={categories} />
  } else if (pathname === '/dashboard/stories' && !pathname.includes('/dashboard/stories/')) {
    title = 'Story Queue'
    content = <StoryQueuePage navigate={navigate} />
    actions = <Button size="sm" onClick={() => navigate('/dashboard/stories/new')} className="bg-brand-gold text-brand-navy"><PlusCircle className="h-4 w-4 mr-1" />New Story</Button>
  } else if (pathname.match(/^\/dashboard\/stories\/[^\/]+$/)) {
    const storyId = pathname.split('/dashboard/stories/')[1]
    title = 'Story Detail'
    content = <StoryDetailPage storyId={storyId} navigate={navigate} categories={categories} />
  } else if (pathname === '/dashboard/articles/published') {
    title = 'Published Articles'
    content = <ArticlesListPage navigate={navigate} published={true} />
  } else if (pathname === '/dashboard/articles' && !pathname.includes('/dashboard/articles/')) {
    title = 'Draft Articles'
    content = <ArticlesListPage navigate={navigate} published={false} />
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
  } else if (pathname === '/dashboard/categories') {
    title = 'Categories'
    content = <CategoriesPage />
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
