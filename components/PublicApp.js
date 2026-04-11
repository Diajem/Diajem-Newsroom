'use client'
import { useState, useEffect, useContext, useMemo } from 'react'
import { NavContext } from '@/lib/nav-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Search, Menu, X, Clock, ArrowRight, Calendar, User, Tag, Share2, Facebook, Twitter, Linkedin, Mail, ChevronRight } from 'lucide-react'
import Image from 'next/image'

const CATEGORIES = ['Africa', 'Diaspora', 'Caribbean', 'Sports', 'AI & Technology', 'Finance', 'Travel', 'Culture', 'Health & Wellbeing', 'Diajem TV', 'Podcast']

// ===== AD COMPONENTS =====
function AdBanner({ zone }) {
  return (
    <div className="w-full bg-gray-100 border border-gray-200 flex items-center justify-center py-4 px-6 rounded-sm">
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Advertisement</p>
        <p className="text-sm text-gray-500">{zone}</p>
      </div>
    </div>
  )
}

function AdSidebar({ zone }) {
  return (
    <div className="w-full bg-gray-50 border border-gray-200 p-4 rounded-sm min-h-[250px] flex items-center justify-center">
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Advertisement</p>
        <p className="text-sm text-gray-500">{zone}</p>
      </div>
    </div>
  )
}

function AdInline({ zone }) {
  return (
    <div className="w-full bg-gray-50 border border-dashed border-gray-300 py-8 px-6 rounded flex items-center justify-center my-6">
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Advertisement</p>
        <p className="text-sm text-gray-500">{zone}</p>
      </div>
    </div>
  )
}

// ===== HEADER =====
function Header() {
  const { navigate } = useContext(NavContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await api('/public/categories')
        setCategories(data || [])
      } catch (e) {
        console.error(e)
      }
    }
    fetchCats()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2 text-xs">
          <span className="text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <button onClick={() => navigate('/dashboard')} className="text-yellow-500 hover:text-yellow-400 transition font-medium">Editorial Dashboard</button>
        </div>
      </div>

      {/* Ad Banner Zone */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <AdBanner zone="Top Banner (728x90)" />
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center">
              <img src="/images/logo-primary.png" alt="Diajem Global Black News" className="h-10 md:h-12 w-auto" />
            </button>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => setSearchOpen(!searchOpen)} className="text-gray-600 hover:text-gray-900">
                <Search className="h-5 w-5" />
              </button>
              <button onClick={() => navigate('/')} className="text-sm font-medium text-gray-700 hover:text-gray-900">Home</button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Search Bar (when open) */}
          {searchOpen && (
            <div className="pb-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search news..." className="flex-1" autoFocus />
                <Button type="submit">Search</Button>
                <Button type="button" variant="ghost" onClick={() => setSearchOpen(false)}>Cancel</Button>
              </form>
            </div>
          )}

          {/* Navigation */}
          <nav className={`${menuOpen ? 'block' : 'hidden'} md:block pb-3`}>
            <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-3 text-sm font-medium">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => { navigate(`/category/${cat.slug}`); setMenuOpen(false) }} className="text-gray-700 hover:text-yellow-600 transition text-left md:text-center uppercase tracking-wide">{cat.name}</button>
              ))}
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}

// ===== FOOTER =====
function Footer() {
  const { navigate } = useContext(NavContext)
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <img src="/images/logo-primary.png" alt="Diajem Global Black News" className="h-10 mb-4 brightness-200" />
            <p className="text-sm text-gray-400 mb-4">Africa-first, Black-world focused global newsroom covering politics, business, culture, sports, and technology across the African continent, Caribbean, and diaspora.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Sections</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/category/africa')} className="hover:text-yellow-500">Africa</button></li>
              <li><button onClick={() => navigate('/category/caribbean')} className="hover:text-yellow-500">Caribbean</button></li>
              <li><button onClick={() => navigate('/category/diaspora')} className="hover:text-yellow-500">Diaspora</button></li>
              <li><button onClick={() => navigate('/category/sports')} className="hover:text-yellow-500">Sports</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-yellow-500">About Us</a></li>
              <li><a href="#" className="hover:text-yellow-500">Contact</a></li>
              <li><a href="#" className="hover:text-yellow-500">Advertise</a></li>
              <li><a href="#" className="hover:text-yellow-500">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8 bg-gray-700" />
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Diajem Global Black News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

// ===== HOMEPAGE =====
function HomePage() {
  const { navigate } = useContext(NavContext)
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, catsData] = await Promise.all([
          api('/public/articles?limit=30'),
          api('/public/categories')
        ])
        setArticles(articlesData || [])
        setCategories(catsData || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getImageUrl = (article) => {
    return article.featured_image_url || '/images/fallback-article.svg'
  }

  const getArticlesByCategory = (catName) => {
    if (!Array.isArray(articles)) return []
    return articles.filter(a => a.category_name === catName).slice(0, 4)
  }

  const heroArticle = useMemo(() => {
    return Array.isArray(articles) && articles.length > 0 ? articles[0] : null
  }, [articles])

  const topStories = useMemo(() => {
    return Array.isArray(articles) ? articles.slice(1, 5) : []
  }, [articles])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Section */}
      {heroArticle && (
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lead Story */}
            <div className="lg:col-span-2">
              <button onClick={() => navigate(`/article/${heroArticle.slug}`)} className="group block">
                <div className="relative h-[400px] lg:h-[500px] bg-gray-200 mb-4 overflow-hidden">
                  <img src={getImageUrl(heroArticle)} alt={heroArticle.headline} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-500 text-black font-bold">{heroArticle.category_name}</Badge>
                  </div>
                </div>
                <h1 className="text-3xl lg:text-5xl font-serif font-bold text-gray-900 mb-4 group-hover:text-yellow-700 transition leading-tight">{heroArticle.headline}</h1>
                <p className="text-lg text-gray-600 mb-4 line-clamp-3">{heroArticle.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {heroArticle.read_time} min read</span>
                  <span>{new Date(heroArticle.published_at || heroArticle.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            </div>

            {/* Top Stories */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b-2 border-yellow-500 pb-2">Top Stories</h2>
              {topStories.map(article => (
                <button key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group block border-b border-gray-200 pb-4 text-left">
                  <Badge variant="outline" className="mb-2 text-xs">{article.category_name}</Badge>
                  <h3 className="font-semibold text-gray-900 group-hover:text-yellow-700 transition mb-2 line-clamp-3">{article.headline}</h3>
                  <span className="text-xs text-gray-500">{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Inline Ad */}
      <AdInline zone="Homepage Inline Banner" />

      {/* Editorial Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Africa */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-4 border-yellow-500 pb-2">Africa</h2>
              <button onClick={() => navigate('/category/africa')} className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1">View All <ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getArticlesByCategory('Africa').map(article => (
                <button key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group block text-left">
                  <div className="relative h-48 bg-gray-200 mb-3 overflow-hidden">
                    <img src={getImageUrl(article)} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-yellow-700 transition mb-2 line-clamp-2">{article.headline}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Diaspora */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-4 border-yellow-500 pb-2">Diaspora</h2>
              <button onClick={() => navigate('/category/diaspora')} className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1">View All <ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getArticlesByCategory('Diaspora').map(article => (
                <button key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group block text-left">
                  <div className="relative h-48 bg-gray-200 mb-3 overflow-hidden">
                    <img src={getImageUrl(article)} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-yellow-700 transition mb-2 line-clamp-2">{article.headline}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Caribbean */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-4 border-yellow-500 pb-2">Caribbean</h2>
              <button onClick={() => navigate('/category/caribbean')} className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1">View All <ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getArticlesByCategory('Caribbean').map(article => (
                <button key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group block text-left">
                  <div className="relative h-48 bg-gray-200 mb-3 overflow-hidden">
                    <img src={getImageUrl(article)} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-yellow-700 transition mb-2 line-clamp-2">{article.headline}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Sports */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-4 border-yellow-500 pb-2">Sports</h2>
              <button onClick={() => navigate('/category/sports')} className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1">View All <ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getArticlesByCategory('Sports').map(article => (
                <button key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group block text-left">
                  <div className="relative h-48 bg-gray-200 mb-3 overflow-hidden">
                    <img src={getImageUrl(article)} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-yellow-700 transition mb-2 line-clamp-2">{article.headline}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                </button>
              ))}
            </div>
          </section>

          {/* More sections... */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b-4 border-yellow-500 pb-2">AI & Technology</h2>
              <button onClick={() => navigate('/category/ai-technology')} className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1">View All <ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              {getArticlesByCategory('AI & Technology').slice(0, 3).map(article => (
                <button key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group flex gap-4 text-left border-b border-gray-200 pb-4">
                  <div className="w-32 h-24 bg-gray-200 flex-shrink-0 overflow-hidden">
                    <img src={getImageUrl(article)} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-yellow-700 transition mb-1 line-clamp-2">{article.headline}</h3>
                    <span className="text-xs text-gray-500">{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Ad Widget */}
          <AdSidebar zone="Sidebar Ad 1" />

          {/* Trending */}
          <div className="bg-gray-50 p-6 rounded">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-yellow-500 pb-2">Trending Now</h3>
            <div className="space-y-4">
              {Array.isArray(articles) && articles.slice(5, 10).map((article, idx) => (
                <button key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group flex gap-3 text-left">
                  <span className="text-2xl font-bold text-yellow-500">{idx + 1}</span>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-yellow-700 transition line-clamp-3">{article.headline}</h4>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ad Widget 2 */}
          <AdSidebar zone="Sidebar Ad 2" />

          {/* Newsletter */}
          <div className="bg-yellow-500 text-black p-6 rounded">
            <h3 className="text-lg font-bold mb-2">Stay Informed</h3>
            <p className="text-sm mb-4">Get the latest Africa, Caribbean and Diaspora news delivered to your inbox.</p>
            <Input placeholder="Your email" className="mb-2 bg-white" />
            <Button className="w-full bg-black text-white hover:bg-gray-800">Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== ARTICLE PAGE =====
function ArticlePage({ slug }) {
  const { navigate } = useContext(NavContext)
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await api(`/public/articles/${slug}`)
        setArticle(data)
        // Fetch related articles from same category
        if (data?.category_id) {
          const related = await api(`/public/articles?category=${data.category_id}&limit=6`)
          setRelatedArticles((related || []).filter(a => a.id !== data.id).slice(0, 4))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <Button onClick={() => navigate('/')}>Back to Homepage</Button>
      </div>
    )
  }

  const getImageUrl = (article) => {
    return article.featured_image_url || '/images/fallback-article.svg'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Article */}
        <article className="lg:col-span-2">
          {/* Category & Meta */}
          <div className="mb-4">
            <Badge className="bg-yellow-500 text-black font-bold mb-2">{article.category_name}</Badge>
            {article.subcategory_name && (
              <Badge variant="outline" className="ml-2">{article.subcategory_name}</Badge>
            )}
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">{article.headline}</h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-6 font-medium leading-relaxed">{article.excerpt}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
            <span className="flex items-center gap-1"><User className="h-4 w-4" /> {article.author_name || 'Diajem News'}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {article.read_time} min read</span>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm font-medium text-gray-700">Share:</span>
            <button className="text-gray-600 hover:text-blue-600"><Facebook className="h-5 w-5" /></button>
            <button className="text-gray-600 hover:text-blue-400"><Twitter className="h-5 w-5" /></button>
            <button className="text-gray-600 hover:text-blue-700"><Linkedin className="h-5 w-5" /></button>
            <button className="text-gray-600 hover:text-gray-900"><Mail className="h-5 w-5" /></button>
          </div>

          {/* Top Article Ad */}
          <AdInline zone="Article Top Ad (Above Content)" />

          {/* Featured Image */}
          <div className="relative h-[400px] lg:h-[500px] bg-gray-200 mb-8">
            <img src={getImageUrl(article)} alt={article.headline} className="w-full h-full object-cover" />
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: article.body_html }} />

          {/* Mid-Article Related Stories */}
          {relatedArticles[0] && (
            <div className="bg-gray-50 border-l-4 border-yellow-500 p-6 my-8">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Related Reading</p>
              <button onClick={() => navigate(`/article/${relatedArticles[0].slug}`)} className="group">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow-700 transition mb-2">{relatedArticles[0].headline}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{relatedArticles[0].excerpt}</p>
              </button>
            </div>
          )}

          {/* Mid-Article Ad */}
          <AdInline zone="Article Mid Ad" />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 py-6 border-y border-gray-200 my-8">
              <Tag className="h-4 w-4 text-gray-400" />
              {article.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          {/* End Article Ad */}
          <AdInline zone="Article End Ad (Before Related)" />

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-yellow-500 pb-2">Related Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map(related => (
                  <button key={related.id} onClick={() => navigate(`/article/${related.slug}`)} className="group block text-left">
                    <div className="relative h-48 bg-gray-200 mb-3 overflow-hidden">
                      <img src={getImageUrl(related)} alt={related.headline} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <Badge variant="outline" className="mb-2 text-xs">{related.category_name}</Badge>
                    <h3 className="font-semibold text-gray-900 group-hover:text-yellow-700 transition mb-2 line-clamp-2">{related.headline}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{related.excerpt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Ad Widget */}
          <AdSidebar zone="Article Sidebar Ad 1" />

          {/* More from Category */}
          <div className="bg-gray-50 p-6 rounded">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-yellow-500 pb-2">More from {article.category_name}</h3>
            <div className="space-y-4">
              {relatedArticles.slice(0, 5).map(related => (
                <button key={related.id} onClick={() => navigate(`/article/${related.slug}`)} className="group block text-left border-b border-gray-200 pb-3">
                  <h4 className="font-semibold text-sm text-gray-900 group-hover:text-yellow-700 transition line-clamp-3 mb-1">{related.headline}</h4>
                  <span className="text-xs text-gray-500">{new Date(related.published_at || related.created_at).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ad Widget 2 */}
          <AdSidebar zone="Article Sidebar Ad 2" />

          {/* Newsletter */}
          <div className="bg-yellow-500 text-black p-6 rounded">
            <h3 className="text-lg font-bold mb-2">Never Miss a Story</h3>
            <p className="text-sm mb-4">Subscribe to our newsletter for the latest updates.</p>
            <Input placeholder="Your email" className="mb-2 bg-white" />
            <Button className="w-full bg-black text-white hover:bg-gray-800">Subscribe</Button>
          </div>

          {/* Ad Widget 3 */}
          <AdSidebar zone="Article Sidebar Ad 3" />
        </aside>
      </div>
    </div>
  )
}

// ===== CATEGORY PAGE =====
function CategoryPage({ slug }) {
  const { navigate } = useContext(NavContext)
  const [articles, setArticles] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await api('/public/categories')
        const cat = cats.find(c => c.slug === slug)
        setCategory(cat)
        
        if (cat) {
          const data = await api(`/public/articles?category=${cat.id}&limit=20`)
          setArticles(data || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchData()
  }, [slug])

  const getImageUrl = (article) => {
    return article.featured_image_url || '/images/fallback-article.svg'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 border-b-4 border-yellow-500 pb-3 inline-block">{category?.name || 'Category'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map(article => (
              <button key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group block text-left">
                <div className="relative h-56 bg-gray-200 mb-4 overflow-hidden">
                  <img src={getImageUrl(article)} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-yellow-700 transition mb-3 line-clamp-3">{article.headline}</h2>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{article.read_time} min read</span>
                </div>
              </button>
            ))}
          </div>

          {articles.length === 0 && (
            <p className="text-center text-gray-500 py-12">No articles found in this category.</p>
          )}
        </div>

        <aside className="space-y-6">
          <AdSidebar zone="Category Sidebar Ad" />
        </aside>
      </div>
    </div>
  )
}

// ===== SEARCH PAGE =====
function SearchPage({ query }) {
  const { navigate } = useContext(NavContext)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await api(`/public/articles?search=${encodeURIComponent(query)}&limit=20`)
        setArticles(data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (query) fetchResults()
  }, [query])

  const getImageUrl = (article) => {
    return article.featured_image_url || '/images/fallback-article.svg'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Searching...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
        <p className="text-gray-600">Found {articles.length} results for "{query}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map(article => (
          <button key={article.id} onClick={() => navigate(`/article/${article.slug}`)} className="group block text-left">
            <div className="relative h-48 bg-gray-200 mb-3 overflow-hidden">
              <img src={getImageUrl(article)} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition" />
            </div>
            <Badge variant="outline" className="mb-2 text-xs">{article.category_name}</Badge>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-yellow-700 transition mb-2 line-clamp-2">{article.headline}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
          </button>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No results found for your search.</p>
          <Button onClick={() => navigate('/')}>Back to Homepage</Button>
        </div>
      )}
    </div>
  )
}

// ===== MAIN APP =====
export default function PublicApp() {
  const [currentPage, setCurrentPage] = useState('home')
  const [pageParams, setPageParams] = useState({})

  const navigate = (path) => {
    if (path === '/') {
      setCurrentPage('home')
      setPageParams({})
    } else if (path.startsWith('/article/')) {
      setCurrentPage('article')
      setPageParams({ slug: path.replace('/article/', '') })
    } else if (path.startsWith('/category/')) {
      setCurrentPage('category')
      setPageParams({ slug: path.replace('/category/', '') })
    } else if (path.startsWith('/search?')) {
      setCurrentPage('search')
      const q = new URLSearchParams(path.split('?')[1]).get('q')
      setPageParams({ query: q })
    } else if (path === '/dashboard') {
      window.location.href = '/dashboard'
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'article':
        return <ArticlePage slug={pageParams.slug} />
      case 'category':
        return <CategoryPage slug={pageParams.slug} />
      case 'search':
        return <SearchPage query={pageParams.query} />
      default:
        return <HomePage />
    }
  }

  return (
    <NavContext.Provider value={{ navigate }}>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">{renderPage()}</main>
        <Footer />
      </div>
    </NavContext.Provider>
  )
}
