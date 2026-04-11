'use client'
import { useState, useEffect, useContext } from 'react'
import { NavContext } from '@/lib/nav-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Search, Menu, X, Clock, ArrowRight, Globe, Tv, Mic, ChevronRight, Mail, MapPin } from 'lucide-react'

const CATEGORIES = ['Africa', 'Diaspora', 'Caribbean', 'Sports', 'AI & Technology', 'Finance', 'Travel', 'Culture', 'Health & Wellbeing', 'Diajem TV', 'Podcast']

// ===== HEADER =====
function Header() {
  const { navigate } = useContext(NavContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="bg-brand-navy text-white">
        <div className="container flex items-center justify-between py-2 text-xs">
          <span className="text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-brand-gold hover:text-brand-gold-light transition">Editorial Dashboard</button>
          </div>
        </div>
      </div>
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex flex-col items-start">
            <span className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-brand-navy">DIAJEM</span>
            <span className="text-[10px] md:text-xs tracking-[0.3em] text-brand-gold font-semibold uppercase -mt-1">Global Black News</span>
          </button>
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-40 md:w-64 h-8 text-sm" autoFocus />
                <Button type="submit" size="sm" variant="ghost"><Search className="h-4 w-4" /></Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSearchOpen(false)}><X className="h-4 w-4" /></Button>
              </form>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)}><Search className="h-4 w-4" /></Button>
            )}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      <nav className="border-t border-gray-100 bg-white">
        <div className="container">
          <div className="hidden md:flex items-center gap-0 overflow-x-auto py-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => navigate(`/category/${cat.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-brand-gold whitespace-nowrap transition">{cat}</button>
            ))}
          </div>
        </div>
      </nav>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4">
          <div className="container flex flex-col gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { navigate(`/category/${cat.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`); setMenuOpen(false) }}
                className="py-2 text-left text-sm font-medium text-gray-700 hover:text-brand-gold border-b border-gray-50">{cat}</button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

// ===== FOOTER =====
function Footer() {
  const { navigate } = useContext(NavContext)
  return (
    <footer className="bg-brand-navy text-white mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <span className="text-2xl font-serif font-bold text-brand-gold">DIAJEM</span>
              <p className="text-xs tracking-[0.2em] text-brand-gold-light uppercase">Global Black News</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">The definitive source for Black international news, covering Africa, the Caribbean, and the global Diaspora.</p>
          </div>
          <div>
            <h4 className="font-semibold text-brand-gold mb-4 text-sm uppercase tracking-wider">Categories</h4>
            <div className="flex flex-col gap-2">
              {['Africa', 'Diaspora', 'Caribbean', 'Sports', 'AI & Technology', 'Finance'].map(c => (
                <button key={c} onClick={() => navigate(`/category/${c.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`)}
                  className="text-gray-400 hover:text-white text-sm text-left transition">{c}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-brand-gold mb-4 text-sm uppercase tracking-wider">More</h4>
            <div className="flex flex-col gap-2">
              {['Travel', 'Culture', 'Health & Wellbeing', 'Diajem TV', 'Podcast'].map(c => (
                <button key={c} onClick={() => navigate(`/category/${c.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`)}
                  className="text-gray-400 hover:text-white text-sm text-left transition">{c}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-brand-gold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <div className="flex flex-col gap-2">
              {[['About', '/about'], ['Contact', '/contact'], ['Privacy Policy', '/privacy'], ['Terms', '/terms'], ['Editorial Policy', '/editorial-policy'], ['Submit a Tip', '/submit-tip'], ['Advertise', '/advertise']].map(([label, href]) => (
                <button key={href} onClick={() => navigate(href)}
                  className="text-gray-400 hover:text-white text-sm text-left transition">{label}</button>
              ))}
            </div>
          </div>
        </div>
        <Separator className="my-8 bg-gray-800" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Diajem Global Black News. All rights reserved.</p>
          <p>Covering the stories that matter to the Black world.</p>
        </div>
      </div>
    </footer>
  )
}

// ===== ARTICLE CARD =====
function ArticleCard({ article, navigate, large = false }) {
  const imgUrl = article.featured_image_url || 'https://images.unsplash.com/photo-1655102718200-7230a1be8bfc?w=800&q=80'
  return (
    <button onClick={() => navigate(`/article/${article.slug}`)} className={`group text-left w-full ${large ? '' : ''}`}>
      <div className={`overflow-hidden rounded-lg bg-gray-100 ${large ? 'aspect-[16/9]' : 'aspect-[16/10]'} mb-3`}>
        <img src={imgUrl} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      </div>
      <div>
        {article.category_name && <Badge variant="outline" className="text-brand-gold border-brand-gold text-[10px] mb-2">{article.category_name}</Badge>}
        <h3 className={`font-serif font-bold text-gray-900 group-hover:text-brand-gold transition leading-tight ${large ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
          {article.headline}
        </h3>
        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          {article.author_name && <span>{article.author_name}</span>}
          {article.read_time > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.read_time} min read</span>}
          {article.published_at && <span>{new Date(article.published_at).toLocaleDateString()}</span>}
        </div>
      </div>
    </button>
  )
}

// ===== HOMEPAGE =====
function Homepage() {
  const { navigate } = useContext(NavContext)
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/public/articles?limit=20').then(r => r.json()),
      fetch('/api/public/categories').then(r => r.json())
    ]).then(([artData, catData]) => {
      setArticles(artData.articles || [])
      setCategories(catData || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const featured = articles[0]
  const latest = articles.slice(1, 7)
  const byCategory = {}
  articles.forEach(a => {
    if (a.category_name) {
      if (!byCategory[a.category_name]) byCategory[a.category_name] = []
      byCategory[a.category_name].push(a)
    }
  })

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-brand-gold text-xl font-serif animate-pulse">Loading...</div>
    </div>
  )

  return (
    <div>
      {/* Hero */}
      {featured ? (
        <section className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <ArticleCard article={featured} navigate={navigate} large />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-6">
              {latest.slice(0, 3).map(a => (
                <button key={a.id} onClick={() => navigate(`/article/${a.slug}`)} className="group flex gap-4 text-left">
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img src={a.featured_image_url || 'https://images.unsplash.com/photo-1649299313612-48cc3493f62e?w=200&q=80'}
                      alt={a.headline} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {a.category_name && <span className="text-brand-gold text-xs font-medium">{a.category_name}</span>}
                    <h4 className="font-serif font-bold text-sm text-gray-900 group-hover:text-brand-gold transition line-clamp-2 leading-tight">{a.headline}</h4>
                    <span className="text-xs text-gray-400 mt-1 block">{a.published_at ? new Date(a.published_at).toLocaleDateString() : ''}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-brand-navy" />
          <div className="absolute inset-0" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1655102718200-7230a1be8bfc?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15}} />
          <div className="container relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              The Definitive Source for<br /><span className="text-brand-gold">Black International News</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Comprehensive coverage of Africa, the Caribbean, and the global Diaspora. Breaking news, in-depth analysis, and stories that matter.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {['Africa', 'Caribbean', 'Diaspora', 'Sports', 'AI & Technology'].map(c => (
                <Button key={c} variant="outline" className="text-white border-gray-600 hover:border-brand-gold hover:text-brand-gold"
                  onClick={() => navigate(`/category/${c.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`)}>
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Headlines */}
      {latest.length > 0 && (
        <section className="container py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Latest Headlines</h2>
            <div className="h-px flex-1 bg-gray-200 ml-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latest.slice(0, 6).map(a => <ArticleCard key={a.id} article={a} navigate={navigate} />)}
          </div>
        </section>
      )}

      {/* Category Sections */}
      {Object.entries(byCategory).filter(([name]) => !['Diajem TV', 'Podcast'].includes(name)).slice(0, 4).map(([catName, catArticles]) => (
        <section key={catName} className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-gray-900">{catName}</h2>
            <button onClick={() => navigate(`/category/${catName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`)}
              className="text-brand-gold text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {catArticles.slice(0, 4).map(a => <ArticleCard key={a.id} article={a} navigate={navigate} />)}
          </div>
        </section>
      ))}

      {/* Diajem TV Section */}
      <section className="bg-brand-navy py-12 mt-8">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <Tv className="h-6 w-6 text-brand-gold" />
            <h2 className="text-2xl font-serif font-bold text-white">Diajem TV</h2>
          </div>
          {byCategory['Diajem TV']?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {byCategory['Diajem TV'].slice(0, 3).map(a => (
                <button key={a.id} onClick={() => navigate(`/article/${a.slug}`)} className="group text-left">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-800 mb-3">
                    <img src={a.featured_image_url || 'https://images.unsplash.com/photo-1611287158945-58d7fa81bb88?w=600&q=80'}
                      alt={a.headline} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                  </div>
                  <h3 className="font-serif font-bold text-white group-hover:text-brand-gold transition">{a.headline}</h3>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">Video content coming soon. Stay tuned for Diajem TV.</p>
            </div>
          )}
        </div>
      </section>

      {/* Podcast Section */}
      <section className="container py-12">
        <div className="flex items-center gap-3 mb-8">
          <Mic className="h-6 w-6 text-brand-gold" />
          <h2 className="text-2xl font-serif font-bold text-gray-900">Podcast</h2>
        </div>
        {byCategory['Podcast']?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {byCategory['Podcast'].slice(0, 4).map(a => (
              <button key={a.id} onClick={() => navigate(`/article/${a.slug}`)} className="group flex gap-4 text-left p-4 rounded-lg border border-gray-200 hover:border-brand-gold transition">
                <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                  <Mic className="h-8 w-8 text-brand-gold" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-900 group-hover:text-brand-gold transition">{a.headline}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{a.excerpt}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-lg bg-gray-50">
            <Mic className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">Podcast episodes coming soon.</p>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-brand-navy to-brand-dark py-12 mt-8">
        <div className="container text-center">
          <h2 className="text-2xl font-serif font-bold text-white mb-3">Stay Informed</h2>
          <p className="text-gray-400 mb-6">Get the latest stories from the Black world delivered to your inbox.</p>
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <Input placeholder="Your email address" className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500" />
            <Button className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-semibold">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  )
}

// ===== ARTICLE PAGE =====
function ArticlePage({ slug }) {
  const { navigate } = useContext(NavContext)
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/public/articles/${slug}`).then(r => r.json())
      .then(data => {
        setArticle(data.article || null)
        setRelated(data.related || [])
      }).catch(console.error).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="text-brand-gold font-serif animate-pulse text-xl">Loading...</div></div>
  if (!article) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Article Not Found</h2>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  )

  return (
    <article className="container py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={() => navigate('/')} className="hover:text-brand-gold">Home</button>
          <ChevronRight className="h-3 w-3" />
          {article.category_name && (
            <>
              <button onClick={() => navigate(`/category/${article.category_name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`)}
                className="hover:text-brand-gold">{article.category_name}</button>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-gray-400 truncate">{article.headline}</span>
        </div>
        {article.category_name && <Badge className="bg-brand-gold text-brand-navy mb-4">{article.category_name}</Badge>}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">{article.headline}</h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-6">{article.excerpt}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-200">
          <span className="font-medium text-gray-700">{article.author_name}</span>
          {article.published_at && <span>{new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
          {article.read_time > 0 && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{article.read_time} min read</span>}
        </div>
      </div>

      {article.featured_image_url && (
        <div className="aspect-video rounded-lg overflow-hidden mb-8">
          <img src={article.featured_image_url} alt={article.headline} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose max-w-none mb-12" dangerouslySetInnerHTML={{ __html: article.body_html }} />

      {article.tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-8 pt-6 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-500">Tags:</span>
          {article.tags.map(tag => <Badge key={tag} variant="outline" className="text-gray-600">{tag}</Badge>)}
        </div>
      )}

      {related.length > 0 && (
        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Related Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map(a => (
              <button key={a.id} onClick={() => navigate(`/article/${a.slug}`)} className="group flex gap-4 text-left">
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img src={a.featured_image_url || 'https://images.unsplash.com/photo-1649299313612-48cc3493f62e?w=200&q=80'}
                    alt={a.headline} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-gray-900 group-hover:text-brand-gold transition line-clamp-2">{a.headline}</h4>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{a.excerpt}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

// ===== CATEGORY PAGE =====
function CategoryPage({ slug }) {
  const { navigate } = useContext(NavContext)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const catName = slug.replace(/-/g, ' ').replace(/\band\b/g, '&').replace(/\b\w/g, l => l.toUpperCase())

  useEffect(() => {
    fetch(`/api/public/articles?category=${encodeURIComponent(catName)}&limit=50`).then(r => r.json())
      .then(data => setArticles(data.articles || []))
      .catch(console.error).finally(() => setLoading(false))
  }, [slug, catName])

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={() => navigate('/')} className="hover:text-brand-gold">Home</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">{catName}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">{catName}</h1>
        <div className="h-1 w-16 bg-brand-gold mt-3" />
      </div>
      {loading ? (
        <div className="text-center py-12"><div className="text-brand-gold font-serif animate-pulse">Loading...</div></div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(a => <ArticleCard key={a.id} article={a} navigate={navigate} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <Globe className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-serif text-gray-500 mb-2">No stories in {catName} yet</h3>
          <p className="text-gray-400">Check back soon for the latest coverage.</p>
        </div>
      )}
    </div>
  )
}

// ===== SEARCH PAGE =====
function SearchPage() {
  const { path, navigate } = useContext(NavContext)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(path.split('?')[1] || '')
    const q = params.get('q') || ''
    if (q) { setQuery(q); doSearch(q) }
  }, [path])

  const doSearch = async (q) => {
    setLoading(true)
    setSearched(true)
    try {
      const data = await fetch(`/api/public/search?q=${encodeURIComponent(q)}`).then(r => r.json())
      setResults(data.articles || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Search</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8 max-w-xl">
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search articles..." className="flex-1" />
        <Button type="submit" className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy">Search</Button>
      </form>
      {loading ? (
        <div className="text-center py-12"><div className="text-brand-gold font-serif animate-pulse">Searching...</div></div>
      ) : results.length > 0 ? (
        <div>
          <p className="text-gray-500 text-sm mb-6">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map(a => <ArticleCard key={a.id} article={a} navigate={navigate} />)}
          </div>
        </div>
      ) : searched ? (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No results found for "{query}"</p>
        </div>
      ) : null}
    </div>
  )
}

// ===== STATIC PAGES =====
function StaticPage({ title, children }) {
  const { navigate } = useContext(NavContext)
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-brand-gold">Home</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900">{title}</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">{title}</h1>
      <div className="prose max-w-none">{children}</div>
    </div>
  )
}

function AboutPage() {
  return (
    <StaticPage title="About Diajem Global Black News">
      <p>Diajem Global Black News is an international news platform dedicated to providing comprehensive, in-depth coverage of events, stories, and developments across Africa, the Caribbean, and the global Diaspora.</p>
      <p>Our mission is to amplify Black voices and stories from around the world, providing context, analysis, and reporting that mainstream outlets often overlook. We cover a wide range of topics including politics, technology, finance, culture, health, sports, and more.</p>
      <h2>Our Focus Areas</h2>
      <ul>
        <li><strong>Africa</strong> - Covering the continent's 54 nations with depth and nuance</li>
        <li><strong>Caribbean</strong> - News from the islands and their global impact</li>
        <li><strong>Diaspora</strong> - Stories from Black communities worldwide</li>
        <li><strong>AI & Technology</strong> - The intersection of technology and the Black experience</li>
        <li><strong>Finance</strong> - Economic news and analysis for the global Black community</li>
        <li><strong>Culture</strong> - Arts, entertainment, and cultural movements</li>
      </ul>
      <h2>Our Team</h2>
      <p>Our team of journalists, editors, and contributors spans multiple continents, bringing diverse perspectives and deep expertise to our coverage.</p>
    </StaticPage>
  )
}

function ContactPage() {
  return (
    <StaticPage title="Contact Us">
      <p>We would love to hear from you. Whether you have a story tip, a question, or feedback, please reach out to us.</p>
      <div className="bg-gray-50 rounded-lg p-6 my-6">
        <div className="flex items-center gap-3 mb-4"><Mail className="h-5 w-5 text-brand-gold" /><span>editorial@diajemnews.com</span></div>
        <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand-gold" /><span>London, United Kingdom</span></div>
      </div>
      <h2>Press Inquiries</h2>
      <p>For press inquiries, partnerships, or media requests, please email press@diajemnews.com.</p>
    </StaticPage>
  )
}

function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <p>Your privacy is important to us. This Privacy Policy explains how Diajem Global Black News collects, uses, and protects your personal information.</p>
      <h2>Information We Collect</h2>
      <p>We may collect information you provide directly, such as your email address when subscribing to our newsletter, as well as automatically collected information like cookies and usage data.</p>
      <h2>How We Use Your Information</h2>
      <p>We use collected information to provide and improve our services, send newsletters, and analyze site usage to improve the reader experience.</p>
      <h2>Contact</h2>
      <p>For privacy-related inquiries, please contact privacy@diajemnews.com.</p>
    </StaticPage>
  )
}

function TermsPage() {
  return (
    <StaticPage title="Terms of Service">
      <p>By accessing and using Diajem Global Black News, you agree to these Terms of Service.</p>
      <h2>Content Usage</h2>
      <p>All content published on this platform is the property of Diajem Global Black News unless otherwise stated. Unauthorized reproduction is prohibited.</p>
      <h2>User Conduct</h2>
      <p>Users agree to use the platform responsibly and in accordance with applicable laws.</p>
    </StaticPage>
  )
}

function EditorialPolicyPage() {
  return (
    <StaticPage title="Editorial Policy">
      <p>Diajem Global Black News is committed to the highest standards of journalism.</p>
      <h2>Our Principles</h2>
      <ul>
        <li><strong>Accuracy</strong> - We verify all facts before publication</li>
        <li><strong>Independence</strong> - Our editorial decisions are not influenced by commercial interests</li>
        <li><strong>Fairness</strong> - We present multiple perspectives on complex issues</li>
        <li><strong>Accountability</strong> - We correct errors promptly and transparently</li>
      </ul>
      <h2>Corrections</h2>
      <p>If you believe we have made an error, please contact corrections@diajemnews.com.</p>
    </StaticPage>
  )
}

function SubmitTipPage() {
  return (
    <StaticPage title="Submit a Tip">
      <p>Have a news tip or story lead? We want to hear from you. Our editorial team reviews all submissions.</p>
      <div className="bg-gray-50 rounded-lg p-6 my-6">
        <p className="font-medium mb-2">Send tips to:</p>
        <p className="text-brand-gold">tips@diajemnews.com</p>
      </div>
      <p>You can also reach out through our social media channels. All sources are protected and confidentiality is guaranteed when requested.</p>
    </StaticPage>
  )
}

function AdvertisePage() {
  return (
    <StaticPage title="Advertise With Us">
      <p>Reach a global audience of engaged readers interested in Africa, the Caribbean, and the Diaspora.</p>
      <h2>Advertising Options</h2>
      <ul>
        <li>Display advertising</li>
        <li>Sponsored content</li>
        <li>Newsletter sponsorship</li>
        <li>Video pre-roll</li>
        <li>Custom partnerships</li>
      </ul>
      <div className="bg-gray-50 rounded-lg p-6 my-6">
        <p className="font-medium mb-2">Contact our advertising team:</p>
        <p className="text-brand-gold">advertising@diajemnews.com</p>
      </div>
    </StaticPage>
  )
}

// ===== MAIN ROUTER =====
export default function PublicApp() {
  const { path } = useContext(NavContext)
  const pathname = path.split('?')[0]

  let content
  if (pathname === '/' || pathname === '') content = <Homepage />
  else if (pathname === '/search') content = <SearchPage />
  else if (pathname === '/about') content = <AboutPage />
  else if (pathname === '/contact') content = <ContactPage />
  else if (pathname === '/privacy') content = <PrivacyPage />
  else if (pathname === '/terms') content = <TermsPage />
  else if (pathname === '/editorial-policy') content = <EditorialPolicyPage />
  else if (pathname === '/submit-tip') content = <SubmitTipPage />
  else if (pathname === '/advertise') content = <AdvertisePage />
  else if (pathname.startsWith('/category/')) content = <CategoryPage slug={pathname.split('/category/')[1]} />
  else if (pathname.startsWith('/article/')) content = <ArticlePage slug={pathname.split('/article/')[1]} />
  else content = (
    <div className="min-h-[60vh] flex flex-col items-center justify-center container">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-6">The page you are looking for does not exist.</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  )
}
