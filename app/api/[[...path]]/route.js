import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { writeFile, readFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import nodePath from 'path'

let client, db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

function json(data, status = 200) { return cors(NextResponse.json(data, { status })) }
function err(message, status = 400) { return cors(NextResponse.json({ error: message }, { status })) }

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

async function hashPw(password) {
  const bcrypt = (await import('bcryptjs')).default
  return bcrypt.hash(password, 10)
}

async function comparePw(password, hash) {
  const bcrypt = (await import('bcryptjs')).default
  return bcrypt.compare(password, hash)
}

async function authenticate(request, db) {
  const h = request.headers.get('authorization')
  if (!h?.startsWith('Bearer ')) return null
  const user = await db.collection('users').findOne({ auth_token: h.split(' ')[1] })
  if (!user) return null
  const { password_hash, auth_token, _id, ...safe } = user
  return safe
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 100)
}

// AI Provider fallback system: try OpenAI first, then DeepSeek if OpenAI fails
async function callAI(messages, options = {}) {
  const { temperature = 0.7, max_tokens = 4000 } = options
  const OpenAI = (await import('openai')).default
  
  // Primary provider: OpenAI via Emergent
  try {
    const openai = new OpenAI({
      apiKey: process.env.EMERGENT_LLM_KEY,
      baseURL: process.env.EMERGENT_LLM_BASE_URL,
    })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature,
      max_tokens,
    })
    return { success: true, content: completion.choices[0].message.content, provider: 'OpenAI' }
  } catch (primaryError) {
    console.error('OpenAI provider failed:', primaryError.message)
    
    // Secondary provider: DeepSeek fallback
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const deepseek = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com',
        })
        const completion = await deepseek.chat.completions.create({
          model: 'deepseek-chat',
          messages,
          temperature,
          max_tokens,
        })
        return { success: true, content: completion.choices[0].message.content, provider: 'DeepSeek' }
      } catch (fallbackError) {
        console.error('DeepSeek fallback failed:', fallbackError.message)
        return { success: false, error: `All AI providers failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}` }
      }
    } else {
      return { success: false, error: `OpenAI failed: ${primaryError.message}. No fallback provider configured (DEEPSEEK_API_KEY not set).` }
    }
  }
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()
    const url = new URL(request.url)
    const sp = Object.fromEntries(url.searchParams)

    // ===== ROOT =====
    if ((route === '/' || route === '/root') && method === 'GET') {
      return json({ message: 'Diajem Global Black News API', status: 'ok' })
    }

    // ===== AUTH =====
    if (route === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json()
      if (!email || !password) return err('Email and password required')
      const user = await db.collection('users').findOne({ email })
      if (!user) return err('Invalid credentials', 401)
      const valid = await comparePw(password, user.password_hash)
      if (!valid) return err('Invalid credentials', 401)
      const token = uuidv4()
      await db.collection('users').updateOne({ id: user.id }, { $set: { auth_token: token } })
      const { password_hash, auth_token, _id, ...safe } = user
      return json({ token, user: safe })
    }

    if (route === '/auth/me' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      return json({ user })
    }

    // ===== CATEGORIES =====
    if (route === '/categories' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const cats = await db.collection('categories').find({}).sort({ order: 1 }).toArray()
      return json(cats.map(({ _id, ...c }) => c))
    }

    if (route === '/categories' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      const cat = {
        id: uuidv4(), name: body.name, slug: slugify(body.name),
        description: body.description || '', order: body.order || 0, created_at: new Date()
      }
      await db.collection('categories').insertOne(cat)
      const { _id, ...clean } = cat
      return json(clean, 201)
    }

    const catMatch = route.match(/^\/categories\/([^\/]+)$/)
    if (catMatch && method === 'PUT') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      const updates = { ...body }
      if (body.name) updates.slug = slugify(body.name)
      await db.collection('categories').updateOne({ id: catMatch[1] }, { $set: updates })
      const cat = await db.collection('categories').findOne({ id: catMatch[1] })
      if (!cat) return err('Category not found', 404)
      const { _id, ...clean } = cat
      return json(clean)
    }

    if (catMatch && method === 'DELETE') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      await db.collection('categories').deleteOne({ id: catMatch[1] })
      return json({ success: true })
    }

    // ===== SUBCATEGORIES =====
    if (route === '/subcategories' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const filter = {}
      if (sp.category_id) filter.category_id = sp.category_id
      const subs = await db.collection('subcategories').find(filter).sort({ order: 1 }).toArray()
      return json(subs.map(({ _id, ...s }) => s))
    }

    if (route === '/subcategories' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      if (!body.name || !body.category_id) return err('name and category_id required')
      const sub = {
        id: uuidv4(), name: body.name, slug: slugify(body.name),
        category_id: body.category_id, order: body.order || 0, created_at: new Date()
      }
      await db.collection('subcategories').insertOne(sub)
      const { _id, ...clean } = sub
      return json(clean, 201)
    }

    const subMatch = route.match(/^\/subcategories\/([^\/]+)$/)
    if (subMatch && method === 'PUT') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      const updates = { ...body }
      if (body.name) updates.slug = slugify(body.name)
      await db.collection('subcategories').updateOne({ id: subMatch[1] }, { $set: updates })
      const sub = await db.collection('subcategories').findOne({ id: subMatch[1] })
      if (!sub) return err('Subcategory not found', 404)
      const { _id, ...clean } = sub
      return json(clean)
    }

    if (subMatch && method === 'DELETE') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      await db.collection('subcategories').deleteOne({ id: subMatch[1] })
      return json({ success: true })
    }

    // ===== STORIES =====
    if (route === '/stories' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const filter = {}
      if (sp.status) filter.status = sp.status
      if (sp.category_id) filter.category_id = sp.category_id
      if (sp.subcategory_id) filter.subcategory_id = sp.subcategory_id
      if (sp.content_type) filter.content_type = sp.content_type
      if (sp.search) filter.$or = [
        { source_title: { $regex: sp.search, $options: 'i' } },
        { source_text: { $regex: sp.search, $options: 'i' } }
      ]
      const page = parseInt(sp.page) || 1
      const limit = parseInt(sp.limit) || 50
      const total = await db.collection('stories').countDocuments(filter)
      const stories = await db.collection('stories').find(filter)
        .sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).toArray()
      return json({ stories: stories.map(({ _id, ...s }) => s), total, page, limit })
    }

    if (route === '/stories' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      if (!body.source_title) return err('source_title is required')
      const story = {
        id: uuidv4(),
        source_url: body.source_url || '',
        source_title: body.source_title,
        source_text: body.source_text || '',
        source_outlet: body.source_outlet || '',
        source_notes: body.source_notes || '',
        category_id: body.category_id || '',
        category_name: body.category_name || '',
        subcategory_id: body.subcategory_id || '',
        subcategory_name: body.subcategory_name || '',
        region: body.region || '',
        country: body.country || '',
        content_type: body.content_type || 'Breaking News',
        urgency: body.urgency || 'normal',
        status: 'new',
        slug: slugify(body.source_title),
        featured_image_url: body.featured_image_url || '',
        tags: body.tags || [],
        created_at: new Date(),
        updated_at: new Date(),
        published_at: null
      }
      await db.collection('stories').insertOne(story)
      await db.collection('activity_logs').insertOne({
        id: uuidv4(), user_id: user.id, action: 'create_story',
        entity_type: 'story', entity_id: story.id,
        details: `Created story: ${story.source_title}`, created_at: new Date()
      })
      const { _id, ...clean } = story
      return json(clean, 201)
    }

    const storyMatch = route.match(/^\/stories\/([^\/]+)$/)
    if (storyMatch && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const story = await db.collection('stories').findOne({ id: storyMatch[1] })
      if (!story) return err('Story not found', 404)
      const { _id, ...clean } = story
      const article = await db.collection('articles').findOne({ story_id: story.id })
      const script = await db.collection('scripts').findOne({ story_id: story.id })
      return json({
        ...clean,
        article: article ? (({ _id, ...a }) => a)(article) : null,
        script: script ? (({ _id, ...s }) => s)(script) : null
      })
    }

    if (storyMatch && method === 'PUT') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      body.updated_at = new Date()
      if (body.source_title) body.slug = slugify(body.source_title)
      await db.collection('stories').updateOne({ id: storyMatch[1] }, { $set: body })
      const story = await db.collection('stories').findOne({ id: storyMatch[1] })
      if (!story) return err('Story not found', 404)
      const { _id, ...clean } = story
      return json(clean)
    }

    if (storyMatch && method === 'DELETE') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      await db.collection('stories').deleteOne({ id: storyMatch[1] })
      await db.collection('articles').deleteMany({ story_id: storyMatch[1] })
      await db.collection('scripts').deleteMany({ story_id: storyMatch[1] })
      return json({ success: true })
    }

    // ===== ARTICLES =====
    if (route === '/articles' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const filter = {}
      if (sp.is_published === 'true') filter.is_published = true
      if (sp.is_published === 'false') filter.is_published = false
      if (sp.category_id) filter.category_id = sp.category_id
      if (sp.subcategory_id) filter.subcategory_id = sp.subcategory_id
      if (sp.search) filter.$or = [
        { headline: { $regex: sp.search, $options: 'i' } },
        { excerpt: { $regex: sp.search, $options: 'i' } }
      ]
      const page = parseInt(sp.page) || 1
      const limit = parseInt(sp.limit) || 50
      const total = await db.collection('articles').countDocuments(filter)
      const articles = await db.collection('articles').find(filter)
        .sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).toArray()
      return json({ articles: articles.map(({ _id, ...a }) => a), total, page, limit })
    }

    if (route === '/articles' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      const article = {
        id: uuidv4(), story_id: body.story_id || '', headline: body.headline || '',
        excerpt: body.excerpt || '', body_html: body.body_html || '',
        body_markdown: body.body_markdown || '', seo_title: body.seo_title || '',
        meta_description: body.meta_description || '', tags: body.tags || [],
        canonical_url: body.canonical_url || '',
        author_name: body.author_name || user.name || 'Diajem News',
        read_time: body.read_time || 0, category_id: body.category_id || '',
        category_name: body.category_name || '', subcategory_id: body.subcategory_id || '',
        subcategory_name: body.subcategory_name || '', featured_image_url: body.featured_image_url || '',
        is_published: false, public_url: '', slug: slugify(body.headline || 'untitled'),
        created_at: new Date(), updated_at: new Date(), published_at: null
      }
      await db.collection('articles').insertOne(article)
      const { _id, ...clean } = article
      return json(clean, 201)
    }

    const articleMatch = route.match(/^\/articles\/([^\/]+)$/)
    if (articleMatch && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const article = await db.collection('articles').findOne({ id: articleMatch[1] })
      if (!article) return err('Article not found', 404)
      const { _id, ...clean } = article
      return json(clean)
    }

    if (articleMatch && method === 'PUT') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      body.updated_at = new Date()
      if (body.headline) body.slug = slugify(body.headline)
      if (body.is_published === true) {
        const existing = await db.collection('articles').findOne({ id: articleMatch[1] })
        if (existing && !existing.is_published) {
          body.published_at = new Date()
          body.public_url = `/article/${body.slug || existing.slug}`
          if (existing.story_id) {
            await db.collection('stories').updateOne(
              { id: existing.story_id },
              { $set: { status: 'published', published_at: new Date(), updated_at: new Date() } }
            )
          }
          await db.collection('activity_logs').insertOne({
            id: uuidv4(), user_id: user.id, action: 'publish_article',
            entity_type: 'article', entity_id: articleMatch[1],
            details: `Published: ${body.headline || existing.headline}`, created_at: new Date()
          })
        }
      }
      if (body.is_published === false) {
        body.published_at = null
        body.public_url = ''
        const existing = await db.collection('articles').findOne({ id: articleMatch[1] })
        if (existing?.story_id) {
          await db.collection('stories').updateOne(
            { id: existing.story_id },
            { $set: { status: 'ready_to_publish', updated_at: new Date() } }
          )
        }
      }
      await db.collection('articles').updateOne({ id: articleMatch[1] }, { $set: body })
      const updated = await db.collection('articles').findOne({ id: articleMatch[1] })
      if (!updated) return err('Article not found', 404)
      const { _id, ...clean } = updated
      return json(clean)
    }

    if (articleMatch && method === 'DELETE') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      await db.collection('articles').deleteOne({ id: articleMatch[1] })
      return json({ success: true })
    }

    // ===== SCRIPTS =====
    if (route === '/scripts' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const filter = {}
      if (sp.status) filter.status = sp.status
      if (sp.story_id) filter.story_id = sp.story_id
      const scripts = await db.collection('scripts').find(filter).sort({ created_at: -1 }).toArray()
      return json(scripts.map(({ _id, ...s }) => s))
    }

    if (route === '/scripts' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      const script = {
        id: uuidv4(), story_id: body.story_id || '', article_id: body.article_id || '',
        script_title: body.script_title || '', short_hook: body.short_hook || '',
        full_script: body.full_script || '', anchor_intro: body.anchor_intro || '',
        lower_thirds: body.lower_thirds || '', on_screen_text: body.on_screen_text || '',
        thumbnail_text: body.thumbnail_text || '', youtube_description: body.youtube_description || '',
        youtube_tags: body.youtube_tags || '', podcast_intro: body.podcast_intro || '',
        podcast_version: body.podcast_version || '', status: 'draft',
        created_at: new Date(), updated_at: new Date()
      }
      await db.collection('scripts').insertOne(script)
      const { _id, ...clean } = script
      return json(clean, 201)
    }

    const scriptMatch = route.match(/^\/scripts\/([^\/]+)$/)
    if (scriptMatch && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const script = await db.collection('scripts').findOne({ id: scriptMatch[1] })
      if (!script) return err('Script not found', 404)
      const { _id, ...clean } = script
      return json(clean)
    }

    if (scriptMatch && method === 'PUT') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      body.updated_at = new Date()
      await db.collection('scripts').updateOne({ id: scriptMatch[1] }, { $set: body })
      const updated = await db.collection('scripts').findOne({ id: scriptMatch[1] })
      if (!updated) return err('Script not found', 404)
      const { _id, ...clean } = updated
      return json(clean)
    }

    if (scriptMatch && method === 'DELETE') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      await db.collection('scripts').deleteOne({ id: scriptMatch[1] })
      return json({ success: true })
    }

    // ===== VIDEO TASKS =====
    if (route === '/video-tasks' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const filter = {}
      if (sp.status) filter.status = sp.status
      const tasks = await db.collection('video_tasks').find(filter).sort({ created_at: -1 }).toArray()
      return json(tasks.map(({ _id, ...t }) => t))
    }

    if (route === '/video-tasks' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      const task = {
        id: uuidv4(), story_id: body.story_id || '', script_id: body.script_id || '',
        title: body.title || '', status: body.status || 'script_needed',
        assigned_to: body.assigned_to || '', notes: body.notes || '',
        created_at: new Date(), updated_at: new Date()
      }
      await db.collection('video_tasks').insertOne(task)
      const { _id, ...clean } = task
      return json(clean, 201)
    }

    const videoMatch = route.match(/^\/video-tasks\/([^\/]+)$/)
    if (videoMatch && method === 'PUT') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      body.updated_at = new Date()
      await db.collection('video_tasks').updateOne({ id: videoMatch[1] }, { $set: body })
      const updated = await db.collection('video_tasks').findOne({ id: videoMatch[1] })
      if (!updated) return err('Task not found', 404)
      const { _id, ...clean } = updated
      return json(clean)
    }

    if (videoMatch && method === 'DELETE') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      await db.collection('video_tasks').deleteOne({ id: videoMatch[1] })
      return json({ success: true })
    }

    // ===== YOUTUBE VIDEOS =====
    if (route === '/youtube/sync' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      
      try {
        const channels = [
          { handle: '@diajemsports', channelId: 'UCYourSportsChannelId', subcategory: 'Sports' },
          { handle: '@diajemnews', channelId: 'UCYourNewsChannelId', subcategory: 'News' }
        ]
        
        let syncedCount = 0
        
        for (const channel of channels) {
          // Fetch RSS feed
          const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`
          const response = await fetch(rssUrl)
          const xmlText = await response.text()
          
          // Parse XML (simple regex parsing for MVP)
          const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || []
          
          for (const entry of entries) {
            const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1]
            const title = entry.match(/<title>(.*?)<\/title>/)?.[1]
            const published = entry.match(/<published>(.*?)<\/published>/)?.[1]
            const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
            const link = `https://www.youtube.com/watch?v=${videoId}`
            
            if (videoId) {
              // Check if already exists
              const existing = await db.collection('youtube_videos').findOne({ video_id: videoId })
              
              if (!existing) {
                await db.collection('youtube_videos').insertOne({
                  id: uuidv4(),
                  video_id: videoId,
                  title: title || '',
                  thumbnail_url: thumbnail,
                  video_url: link,
                  channel_handle: channel.handle,
                  subcategory: channel.subcategory,
                  published_at: new Date(published),
                  created_at: new Date()
                })
                syncedCount++
              }
            }
          }
        }
        
        return json({ message: `Synced ${syncedCount} new videos`, count: syncedCount })
      } catch (e) {
        console.error('YouTube sync error:', e)
        return err('Failed to sync YouTube videos: ' + e.message, 500)
      }
    }

    if (route === '/youtube/videos' && method === 'GET') {
      const filter = {}
      if (sp.subcategory) filter.subcategory = sp.subcategory
      const videos = await db.collection('youtube_videos').find(filter).sort({ published_at: -1 }).limit(20).toArray()
      return json(videos.map(({ _id, ...v }) => v))
    }

    // ===== ADVERTISEMENTS =====
    if (route === '/ads' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const ads = await db.collection('ads').find({}).sort({ created_at: -1 }).toArray()
      return json(ads.map(({ _id, ...a }) => a))
    }

    if (route === '/ads' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      const ad = {
        id: uuidv4(),
        name: body.name || '',
        image_url: body.image_url || '',
        link_url: body.link_url || '',
        zone: body.zone || 'top_banner',
        is_active: body.is_active !== false,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.collection('ads').insertOne(ad)
      const { _id, ...clean } = ad
      return json(clean, 201)
    }

    const adMatch = route.match(/^\/ads\/([^\/]+)$/)
    if (adMatch && method === 'PUT') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      body.updated_at = new Date()
      await db.collection('ads').updateOne({ id: adMatch[1] }, { $set: body })
      const updated = await db.collection('ads').findOne({ id: adMatch[1] })
      if (!updated) return err('Ad not found', 404)
      const { _id, ...clean } = updated
      return json(clean)
    }

    if (adMatch && method === 'DELETE') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      await db.collection('ads').deleteOne({ id: adMatch[1] })
      return json({ success: true })
    }

    if (route === '/public/ads' && method === 'GET') {
      const filter = { is_active: true }
      if (sp.zone) filter.zone = sp.zone
      const ads = await db.collection('ads').find(filter).toArray()
      return json(ads.map(({ _id, ...a }) => a))
    }

    // ===== AI: REWRITE ARTICLE =====
    if (route === '/ai/rewrite' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const { story_id } = await request.json()
      if (!story_id) return err('story_id required')
      const story = await db.collection('stories').findOne({ id: story_id })
      if (!story) return err('Story not found', 404)

      const messages = [
        {
          role: 'system',
          content: 'You are a senior news journalist for Diajem Global Black News, an international news platform focusing on Africa, Caribbean, Diaspora, Sports, AI & Technology, Finance, Travel, Culture, and Health & Wellbeing. Rewrite the following source material into a professional, original news article. You must respond ONLY with a valid JSON object (no markdown code fences, no extra text) with these exact fields: headline (string), excerpt (2-3 sentence summary string), body_html (complete article in HTML with <p>, <h2>, <h3> tags, well-structured with multiple paragraphs), seo_title (string), meta_description (string max 160 chars), read_time (number in minutes).'
        },
        {
          role: 'user',
          content: `Source Title: ${story.source_title}\nSource Outlet: ${story.source_outlet || 'Unknown'}\nSource Content:\n${story.source_text}\nCategory: ${story.category_name || 'General'}\nRegion: ${story.region || 'Global'}\nCountry: ${story.country || 'N/A'}`
        }
      ]

      const aiResponse = await callAI(messages, { temperature: 0.7, max_tokens: 4000 })
      if (!aiResponse.success) {
        return err(aiResponse.error, 500)
      }

      let result
      try {
        let content = aiResponse.content
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        result = JSON.parse(content)
      } catch (e) {
        return err('Failed to parse AI response: ' + e.message, 500)
      }

      const article = {
        id: uuidv4(), story_id: story.id,
        headline: result.headline || story.source_title,
        excerpt: result.excerpt || '', body_html: result.body_html || '',
        body_markdown: '', seo_title: result.seo_title || result.headline,
        meta_description: result.meta_description || result.excerpt?.substring(0, 160) || '',
        tags: story.tags || [], canonical_url: '',
        author_name: user.name || 'Diajem News', read_time: result.read_time || 5,
        category_id: story.category_id, category_name: story.category_name || '',
        subcategory_id: story.subcategory_id || '', subcategory_name: story.subcategory_name || '',
        featured_image_url: story.featured_image_url || '',
        is_published: false, public_url: '',
        slug: slugify(result.headline || story.source_title),
        created_at: new Date(), updated_at: new Date(), published_at: null
      }

      await db.collection('articles').insertOne(article)
      await db.collection('stories').updateOne(
        { id: story_id }, { $set: { status: 'rewritten', updated_at: new Date() } }
      )
      await db.collection('activity_logs').insertOne({
        id: uuidv4(), user_id: user.id, action: 'ai_rewrite',
        entity_type: 'article', entity_id: article.id,
        details: `AI rewrote story into article: ${article.headline}`, created_at: new Date()
      })

      const { _id, ...clean } = article
      return json(clean, 201)
    }

    // ===== AI: GENERATE SCRIPT =====
    if (route === '/ai/script' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const { article_id } = await request.json()
      if (!article_id) return err('article_id required')
      const article = await db.collection('articles').findOne({ id: article_id })
      if (!article) return err('Article not found', 404)

      const messages = [
        {
          role: 'system',
          content: 'You are a video script writer for Diajem Global Black News. Create a complete video production script package. Respond ONLY with a valid JSON object (no markdown code fences, no extra text) with these exact fields: script_title (string), short_hook (15 words max string), full_script (complete anchor script with [PAUSE] [EMPHASIS] marks string), anchor_intro (10-15 second intro string), lower_thirds (names/titles for overlays string), on_screen_text (key bullet points string), thumbnail_text (5-7 words string), youtube_description (string), youtube_tags (comma-separated string), podcast_intro (podcast opening string), podcast_version (full podcast adaptation string).'
        },
        {
          role: 'user',
          content: `Article: ${article.headline}\nExcerpt: ${article.excerpt}\nContent:\n${article.body_html}\nCategory: ${article.category_name || 'General'}`
        }
      ]

      const aiResponse = await callAI(messages, { temperature: 0.7, max_tokens: 4000 })
      if (!aiResponse.success) {
        return err(aiResponse.error, 500)
      }

      let result
      try {
        let content = aiResponse.content
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        result = JSON.parse(content)
      } catch (e) {
        return err('Failed to parse AI response: ' + e.message, 500)
      }

      const script = {
        id: uuidv4(), story_id: article.story_id, article_id: article.id,
        script_title: result.script_title || article.headline,
        short_hook: result.short_hook || '', full_script: result.full_script || '',
        anchor_intro: result.anchor_intro || '', lower_thirds: result.lower_thirds || '',
        on_screen_text: result.on_screen_text || '', thumbnail_text: result.thumbnail_text || '',
        youtube_description: result.youtube_description || '',
        youtube_tags: result.youtube_tags || '', podcast_intro: result.podcast_intro || '',
        podcast_version: result.podcast_version || '', status: 'draft',
        created_at: new Date(), updated_at: new Date()
      }

      await db.collection('scripts').insertOne(script)
      if (article.story_id) {
        await db.collection('stories').updateOne(
          { id: article.story_id }, { $set: { status: 'scripted', updated_at: new Date() } }
        )
      }
      await db.collection('activity_logs').insertOne({
        id: uuidv4(), user_id: user.id, action: 'ai_script',
        entity_type: 'script', entity_id: script.id,
        details: `AI generated script: ${script.script_title}`, created_at: new Date()
      })

      const { _id, ...clean } = script
      return json(clean, 201)
    }

    // ===== PUBLIC ROUTES =====
    if (route === '/public/articles' && method === 'GET') {
      const filter = { is_published: true }
      if (sp.category_id) filter.category_id = sp.category_id
      if (sp.category) filter.category_name = { $regex: `^${sp.category}$`, $options: 'i' }
      const page = parseInt(sp.page) || 1
      const limit = parseInt(sp.limit) || 20
      const total = await db.collection('articles').countDocuments(filter)
      const articles = await db.collection('articles').find(filter)
        .sort({ published_at: -1, created_at: -1 })
        .skip((page - 1) * limit).limit(limit).toArray()
      return json({
        articles: articles.map(({ _id, body_markdown, ...a }) => a),
        total, page, limit
      })
    }

    const pubArticleMatch = route.match(/^\/public\/articles\/([^\/]+)$/)
    if (pubArticleMatch && method === 'GET') {
      const article = await db.collection('articles').findOne({
        slug: pubArticleMatch[1], is_published: true
      })
      if (!article) return err('Article not found', 404)
      const { _id, ...clean } = article
      const related = await db.collection('articles').find({
        is_published: true, category_id: article.category_id, id: { $ne: article.id }
      }).limit(4).sort({ published_at: -1 }).toArray()
      return json({
        article: clean,
        related: related.map(({ _id, body_html, body_markdown, ...a }) => a)
      })
    }

    if (route === '/public/categories' && method === 'GET') {
      const cats = await db.collection('categories').find({}).sort({ order: 1 }).toArray()
      return json(cats.map(({ _id, ...c }) => c))
    }

    if (route === '/public/subcategories' && method === 'GET') {
      const filter = {}
      if (sp.category_id) filter.category_id = sp.category_id
      const subs = await db.collection('subcategories').find(filter).sort({ order: 1 }).toArray()
      return json(subs.map(({ _id, ...s }) => s))
    }

    if (route === '/public/search' && method === 'GET') {
      const q = sp.q || ''
      if (!q) return json({ articles: [], total: 0 })
      const filter = {
        is_published: true,
        $or: [
          { headline: { $regex: q, $options: 'i' } },
          { excerpt: { $regex: q, $options: 'i' } },
          { body_html: { $regex: q, $options: 'i' } }
        ]
      }
      const articles = await db.collection('articles').find(filter)
        .sort({ published_at: -1 }).limit(20).toArray()
      return json({
        articles: articles.map(({ _id, body_html, body_markdown, ...a }) => a),
        total: articles.length
      })
    }

    // ===== STATS =====
    if (route === '/stats' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const [totalStories, totalArticles, publishedArticles, totalScripts, totalVideoTasks] = await Promise.all([
        db.collection('stories').countDocuments(),
        db.collection('articles').countDocuments(),
        db.collection('articles').countDocuments({ is_published: true }),
        db.collection('scripts').countDocuments(),
        db.collection('video_tasks').countDocuments()
      ])
      const statusCounts = await db.collection('stories').aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray()
      const recentLogs = await db.collection('activity_logs').find({})
        .sort({ created_at: -1 }).limit(10).toArray()
      return json({
        totalStories, totalArticles, publishedArticles,
        draftArticles: totalArticles - publishedArticles,
        totalScripts, totalVideoTasks,
        statusBreakdown: Object.fromEntries(statusCounts.map(s => [s._id || 'unknown', s.count])),
        recentActivity: recentLogs.map(({ _id, ...l }) => l)
      })
    }

    // ===== SEED =====
    if (route === '/seed' && method === 'POST') {
      const categories = [
        { name: 'Africa', order: 1 }, { name: 'Diaspora', order: 2 },
        { name: 'Caribbean', order: 3 }, { name: 'Sports', order: 4 },
        { name: 'AI & Technology', order: 5 }, { name: 'Finance', order: 6 },
        { name: 'Travel', order: 7 }, { name: 'Culture', order: 8 },
        { name: 'Health & Wellbeing', order: 9 }, { name: 'Diajem TV', order: 10 },
        { name: 'Podcast', order: 11 }
      ]
      const existing = await db.collection('categories').countDocuments()
      if (existing === 0) {
        for (const cat of categories) {
          await db.collection('categories').insertOne({
            id: uuidv4(), name: cat.name, slug: slugify(cat.name),
            description: '', order: cat.order, created_at: new Date()
          })
        }
      }

      // Seed subcategories
      const existingSubs = await db.collection('subcategories').countDocuments()
      if (existingSubs === 0) {
        const allCats = await db.collection('categories').find({}).toArray()
        const catMap = {}
        allCats.forEach(c => { catMap[c.name] = c.id })

        const subcategories = {
          'Africa': ['Nigeria', 'Kenya', 'Ethiopia', 'Ghana', 'South Africa', 'African Union', 'Security & Conflict', 'Politics', 'Business', 'Development'],
          'Caribbean': ['Jamaica', 'Trinidad & Tobago', 'Barbados', 'Haiti', 'Dominican Republic', 'Cuba', 'Tourism', 'Energy', 'Culture', 'Regional Affairs'],
          'Diaspora': ['UK', 'USA', 'Canada', 'Europe', 'Black Business', 'Black Communities', 'Immigration', 'Education', 'Race & Identity', 'Culture'],
          'Sports': ['Football', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'Europa League', 'Conference League', 'AFCON', 'World Cup', 'African Football', 'Transfers', 'Match Reports'],
          'AI & Technology': ['AI Tools', 'Startups', 'Big Tech', 'Innovation', 'Policy', 'Robotics'],
          'Finance': ['Markets', 'Personal Finance', 'African Business', 'Caribbean Economy', 'Diaspora Wealth', 'Startups', 'Investing'],
          'Travel': ['Destinations', 'Hotels', 'Airlines', 'Visa & Migration', 'African Travel', 'Caribbean Travel'],
          'Culture': ['Music', 'Film', 'Fashion', 'Food', 'Literature', 'Heritage'],
          'Health & Wellbeing': ['Public Health', 'Mental Health', 'Nutrition', 'Fitness', 'Healthcare Systems'],
          'Diajem TV': ['Sports', 'News', 'Interviews', 'Reports', 'Documentaries', 'News Bulletins'],
          'Podcast': ['Interviews', 'Analysis', 'Special Series']
        }

        for (const [catName, subs] of Object.entries(subcategories)) {
          const categoryId = catMap[catName]
          if (!categoryId) continue
          for (let i = 0; i < subs.length; i++) {
            await db.collection('subcategories').insertOne({
              id: uuidv4(), name: subs[i], slug: slugify(subs[i]),
              category_id: categoryId, order: i + 1, created_at: new Date()
            })
          }
        }
      }

      const adminExists = await db.collection('users').findOne({ email: 'admin@diajemnews.com' })
      if (!adminExists) {
        await db.collection('users').insertOne({
          id: uuidv4(), email: 'admin@diajemnews.com',
          password_hash: await hashPw('DiajemAdmin2025!'),
          name: 'Admin', role: 'admin', created_at: new Date()
        })
      }
      try {
        await db.collection('stories').createIndex({ status: 1 })
        await db.collection('stories').createIndex({ category_id: 1 })
        await db.collection('stories').createIndex({ subcategory_id: 1 })
        await db.collection('stories').createIndex({ created_at: -1 })
        await db.collection('articles').createIndex({ is_published: 1 })
        await db.collection('articles').createIndex({ slug: 1 })
        await db.collection('articles').createIndex({ category_id: 1 })
        await db.collection('articles').createIndex({ subcategory_id: 1 })
        await db.collection('articles').createIndex({ story_id: 1 })
        await db.collection('scripts').createIndex({ story_id: 1 })
        await db.collection('scripts').createIndex({ article_id: 1 })
        await db.collection('subcategories').createIndex({ category_id: 1 })
      } catch (e) { /* indexes may already exist */ }
      return json({ message: 'Database seeded successfully' })
    }

    // ===== SETTINGS =====
    if (route === '/settings' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const settings = await db.collection('site_settings').find({}).toArray()
      return json(Object.fromEntries(settings.map(s => [s.key, s.value])))
    }

    if (route === '/settings' && method === 'PUT') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      for (const [key, value] of Object.entries(body)) {
        await db.collection('site_settings').updateOne(
          { key }, { $set: { key, value, updated_at: new Date() } }, { upsert: true }
        )
      }
      return json({ success: true })
    }

    // ===== SHEET EXPORTS =====
    if (route === '/sheet-exports' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const exports = await db.collection('sheet_exports').find({}).sort({ exported_at: -1 }).toArray()
      return json(exports.map(({ _id, ...e }) => e))
    }

    if (route === '/sheet-exports' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const body = await request.json()
      const sheetId = await db.collection('site_settings').findOne({ key: 'google_sheet_id' })
      const tabName = await db.collection('site_settings').findOne({ key: 'google_sheet_tab' })
      const exportRecord = {
        id: uuidv4(), story_id: body.story_id || '',
        sheet_id: sheetId?.value || '', tab_name: tabName?.value || 'Sheet1',
        status: 'mocked', exported_at: new Date(),
        error_message: 'Google Sheets API credentials not configured. Export data saved locally.'
      }
      await db.collection('sheet_exports').insertOne(exportRecord)
      const { _id, ...clean } = exportRecord
      return json(clean, 201)
    }

    // ===== ACTIVITY LOGS =====
    if (route === '/activity-logs' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const logs = await db.collection('activity_logs').find({})
        .sort({ created_at: -1 }).limit(50).toArray()
      return json(logs.map(({ _id, ...l }) => l))
    }

    // ===== MEDIA UPLOAD =====
    const UPLOAD_DIR = nodePath.join(process.cwd(), 'uploads')

    if (route === '/media/upload' && method === 'POST') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)

      try {
        if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true })
        const formData = await request.formData()
        const file = formData.get('file')
        if (!file) return err('No file uploaded')

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const ext = file.name.split('.').pop().toLowerCase()
        const filename = `${uuidv4()}.${ext}`
        const filepath = nodePath.join(UPLOAD_DIR, filename)
        await writeFile(filepath, buffer)

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
        const media = {
          id: uuidv4(),
          filename: filename,
          original_name: file.name,
          mime_type: file.type || 'application/octet-stream',
          size: buffer.length,
          url: `${baseUrl}/api/media/file/${filename}`,
          created_at: new Date(),
          uploaded_by: user.name || user.email
        }
        await db.collection('media').insertOne(media)
        const { _id, ...clean } = media
        return json(clean, 201)
      } catch (e) {
        console.error('Upload error:', e)
        return err('Upload failed: ' + e.message, 500)
      }
    }

    if (route === '/media' && method === 'GET') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const items = await db.collection('media').find({}).sort({ created_at: -1 }).toArray()
      return json(items.map(({ _id, ...m }) => m))
    }

    const mediaFileMatch = route.match(/^\/media\/file\/([^\/]+)$/)
    if (mediaFileMatch && method === 'GET') {
      const filename = mediaFileMatch[1]
      const filepath = nodePath.join(UPLOAD_DIR, filename)
      if (!existsSync(filepath)) return err('File not found', 404)
      try {
        const buffer = await readFile(filepath)
        const ext = filename.split('.').pop().toLowerCase()
        const mimeMap = {
          jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
          webp: 'image/webp', svg: 'image/svg+xml', mp4: 'video/mp4', mp3: 'audio/mpeg',
          pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        const contentType = mimeMap[ext] || 'application/octet-stream'
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000',
          }
        })
      } catch (e) {
        return err('File read error', 500)
      }
    }

    const mediaDeleteMatch = route.match(/^\/media\/([^\/]+)$/)
    if (mediaDeleteMatch && method === 'DELETE') {
      const user = await authenticate(request, db)
      if (!user) return err('Unauthorized', 401)
      const media = await db.collection('media').findOne({ id: mediaDeleteMatch[1] })
      if (!media) return err('Media not found', 404)
      try {
        const filepath = nodePath.join(UPLOAD_DIR, media.filename)
        if (existsSync(filepath)) await unlink(filepath)
      } catch (e) { /* file might not exist */ }
      await db.collection('media').deleteOne({ id: mediaDeleteMatch[1] })
      return json({ success: true })
    }

    return err(`Route ${route} not found`, 404)
  } catch (error) {
    console.error('API Error:', error)
    return err('Internal server error: ' + error.message, 500)
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
