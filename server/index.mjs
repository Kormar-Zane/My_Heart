import express from 'express'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import {
  db,
  nowIso,
  uid,
  hashPassword,
  verifyPassword,
  UPLOAD_DIR,
  parseJson,
} from './db.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const server = createServer(app)
const PORT = Number(process.env.PORT || 8787)
const JWT_SECRET = process.env.JWT_SECRET || 'guanxin-local-development-secret-change-me'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'guanxin-admin'
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true'
const SESSION_COOKIE = 'guanxin_session'
const ADMIN_COOKIE = 'guanxin_admin'
const IS_DEFAULT_SECRET = !process.env.JWT_SECRET
const IS_DEFAULT_ADMIN = !process.env.ADMIN_PASSWORD

app.disable('x-powered-by')
app.use(express.json({ limit: '18mb' }))
app.use(cookieParser())

mkdirSync(join(UPLOAD_DIR, 'credentials'), { recursive: true })
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, join(UPLOAD_DIR, 'credentials')),
    filename: (_req, file, cb) => {
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(file.originalname).toLowerCase())
        ? extname(file.originalname).toLowerCase()
        : '.jpg'
      cb(null, `${Date.now()}-${randomBytes(8).toString('hex')}${safeExt}`)
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('证件只支持图片文件'))
      return
    }
    cb(null, true)
  },
})

function signSession(role, id) {
  return jwt.sign({ role, sub: id }, JWT_SECRET, { expiresIn: '30d' })
}

function setSessionCookie(res, role, id) {
  res.cookie(SESSION_COOKIE, signSession(role, id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: COOKIE_SECURE,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
}

function readToken(req) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) return header.slice(7)
  return req.cookies?.[SESSION_COOKIE] ?? null
}

function readAdminToken(req) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ') && header.length > 40) return header.slice(7)
  return req.cookies?.[ADMIN_COOKIE] ?? null
}

function parseAuth(req) {
  const token = readToken(req)
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role === 'user' || payload.role === 'counselor') return payload
    return null
  } catch {
    return null
  }
}

function requireAuth(...roles) {
  return (req, res, next) => {
    const auth = parseAuth(req)
    if (!auth) return res.status(401).json({ error: '请先登录' })
    if (roles.length && !roles.includes(auth.role)) {
      return res.status(403).json({ error: '没有权限执行此操作' })
    }
    req.auth = auth
    next()
  }
}

function requireAdmin(req, res, next) {
  const token = readAdminToken(req)
  if (!token) return res.status(401).json({ error: '请先登录管理后台' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'admin') throw new Error('not admin')
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ error: '管理员登录已过期' })
  }
}

function userRow(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) ?? null
}

function counselorRow(id) {
  return db.prepare('SELECT * FROM counselors WHERE id = ?').get(id) ?? null
}

function accountRow(id) {
  return db.prepare('SELECT * FROM counselor_accounts WHERE id = ?').get(id) ?? null
}

function credentialRow(accountId) {
  return db.prepare('SELECT * FROM credentials WHERE account_id = ?').get(accountId) ?? null
}

function followingCounselorIds(userId) {
  return db
    .prepare('SELECT counselor_id FROM follows WHERE user_id = ?')
    .all(userId)
    .map((row) => row.counselor_id)
}

function publicUser(row, allowPhone = false) {
  if (!row) return null
  return {
    id: row.id,
    phone: allowPhone ? row.phone : '',
    password: '',
    nickname: row.nickname,
    age: row.age,
    gender: row.gender,
    region: { province: row.province, city: row.city, district: row.district },
    bio: row.bio,
    avatar: row.avatar,
    followingUserIds: parseJson(row.following_user_ids, []),
    friendIds: parseJson(row.friend_ids, []),
    followingCounselorIds: followingCounselorIds(row.id),
    vipTier: row.vip_tier,
    vipExpiresAt: row.vip_expires_at,
    micChances: row.mic_chances,
    faceToFaceVoucher: row.face_to_face_voucher,
    flowers: row.flowers,
    ownedItems: parseJson(row.owned_items, ['frame_none']),
    equippedFrame: row.equipped_frame,
    equippedBadge: row.equipped_badge,
    onboarded: Boolean(row.onboarded),
    createdAt: row.created_at,
  }
}

function publicCounselor(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    gender: row.gender,
    age: row.age,
    title: row.title,
    years: row.years,
    city: row.city,
    district: row.district,
    institutionId: row.institution_id,
    specialties: parseJson(row.specialties, []),
    tags: parseJson(row.tags, []),
    price: row.price,
    rating: row.rating,
    sessions: row.sessions,
    followers: row.followers,
    intro: row.intro,
    quote: row.quote,
    style: row.style,
    online: Boolean(row.online),
    formats: parseJson(row.formats, []),
    review: { author: row.review_author, content: row.review_content, rating: row.review_rating },
  }
}

function publicInstitution(row) {
  return {
    id: row.id,
    name: row.name,
    art: row.art,
    city: row.city,
    district: row.district,
    address: row.address,
    tags: parseJson(row.tags, []),
    rating: row.rating,
    counselorIds: parseJson(row.counselor_ids, []),
    intro: row.intro,
    hours: row.hours,
    phone: row.phone,
  }
}

function publicAccount(row) {
  if (!row) return null
  return {
    id: row.id,
    counselorId: row.counselor_id,
    phone: row.phone,
    password: '',
    name: row.name,
    gender: row.gender,
    avatar: row.avatar,
    title: row.title,
    bio: row.bio,
    region: { province: row.province, city: row.city, district: row.district },
    years: row.years,
    institution: row.institution,
    specialties: parseJson(row.specialties, []),
    status: row.status,
    createdAt: row.created_at,
  }
}

function publicCredential(row) {
  if (!row) return null
  return {
    certificateType: row.certificate_type,
    licenseNumber: row.license_number,
    issuingAuthority: row.issuing_authority,
    certificateImage: `/api/counselor/credential-file?account=${encodeURIComponent(row.account_id)}&v=${encodeURIComponent(row.submitted_at)}`,
    submittedAt: row.submitted_at,
  }
}

function canViewPost(post, auth) {
  if (!auth) return post.visibility === 'public'
  if (post.visibility === 'public') return true
  if (auth.role === 'user') {
    if (post.author_id === auth.sub) return true
    const user = userRow(auth.sub)
    if (!user) return false
    if (post.visibility === 'friends') return parseJson(user.friend_ids, []).includes(post.author_id)
    if (post.visibility === 'partial') return parseJson(post.visible_to, []).includes(auth.sub)
    return false
  }
  if (auth.role === 'counselor') {
    const account = accountRow(auth.sub)
    return Boolean(account && post.author_id === account.counselor_id)
  }
  return false
}

function publicPost(row, currentUserId) {
  const comments = db
    .prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC')
    .all(row.id)
    .map((c) => ({
      id: c.id,
      authorName: c.author_name,
      authorAvatar: c.author_avatar,
      content: c.content,
      createdAt: c.created_at,
    }))
  const likedBy = parseJson(row.liked_by, [])
  return {
    id: row.id,
    authorId: row.author_id,
    authorType: row.author_type,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    authorTag: row.author_tag ?? undefined,
    content: row.content,
    images: parseJson(row.images, []),
    videoUrl: row.video_url ?? undefined,
    visibility: row.visibility,
    visibleTo: parseJson(row.visible_to, []),
    createdAt: row.created_at,
    likes: row.likes,
    likedBy,
    comments,
    liked: currentUserId ? likedBy.includes(currentUserId) : false,
  }
}

function postRowsFor(currentUserId) {
  const rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all()
  if (!currentUserId) return rows.filter((post) => post.visibility === 'public')
  const user = userRow(currentUserId)
  if (!user) return rows.filter((post) => post.visibility === 'public')
  const friendIds = parseJson(user.friend_ids, [])
  return rows.filter((post) => {
    if (post.visibility === 'public') return true
    if (post.author_id === currentUserId) return true
    if (post.visibility === 'friends') return friendIds.includes(post.author_id)
    if (post.visibility === 'partial') return parseJson(post.visible_to, []).includes(currentUserId)
    return false
  })
}

function publicBooking(row) {
  return {
    id: row.id,
    counselorId: row.counselor_id,
    counselorName: row.counselor_name,
    counselorAvatar: row.counselor_avatar,
    date: row.date,
    time: row.time,
    format: row.format,
    price: row.price,
    originalPrice: row.original_price,
    status: row.status,
    createdAt: row.created_at,
    usedVoucher: Boolean(row.used_voucher),
    clientName: row.client_name,
    clientAvatar: row.client_avatar,
  }
}

function publicLive(row) {
  const messages = db
    .prepare('SELECT * FROM live_messages WHERE live_id = ? ORDER BY created_at ASC')
    .all(row.id)
    .map((m) => ({
      id: m.id,
      sender: m.sender_role === 'system' ? 'system' : 'other',
      content: m.content,
      createdAt: m.created_at,
      name: m.sender_name ?? undefined,
      avatar: m.sender_avatar ?? undefined,
    }))
  return {
    id: row.id,
    title: row.title,
    hostId: row.host_id,
    hostName: row.host_name,
    hostAvatar: row.host_avatar,
    hostTitle: row.host_title,
    status: row.status,
    viewers: row.viewers,
    startsAt: row.starts_at,
    tags: parseJson(row.tags, []),
    description: row.description,
    art: row.art,
    chat: messages,
  }
}

function userConversation(row, currentUserId) {
  const counselor = counselorRow(row.counselor_id)
  const messages = db
    .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
    .all(row.id)
    .map((m) => ({
      id: m.id,
      sender: m.sender_role === 'user' ? 'me' : 'other',
      content: m.content,
      createdAt: m.created_at,
    }))
  const unread = db
    .prepare(
      "SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ? AND sender_role = 'counselor' AND read_at IS NULL",
    )
    .get(row.id).n
  return {
    id: row.id,
    participantType: 'counselor',
    participantId: row.counselor_id,
    name: counselor?.name ?? '心理咨询师',
    avatar: counselor?.avatar ?? 'lin',
    subtitle: counselor?.title ?? '认证心理咨询师',
    unread,
    online: Boolean(counselor?.online),
    updatedAt: row.updated_at,
    messages,
  }
}

function counselorChat(row, currentAccount) {
  const user = userRow(row.user_id)
  const messages = db
    .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
    .all(row.id)
    .map((m) => ({
      id: m.id,
      sender: m.sender_role === 'counselor' ? 'counselor' : 'client',
      content: m.content,
      createdAt: m.created_at,
    }))
  const unread = db
    .prepare(
      "SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ? AND sender_role = 'user' AND read_at IS NULL",
    )
    .get(row.id).n
  return {
    id: row.id,
    counselorId: row.counselor_id,
    clientId: row.user_id,
    clientName: user?.nickname ?? '来访者',
    clientAvatar: user?.avatar ?? 'me',
    clientTag: '真实来访者',
    online: true,
    unread,
    updatedAt: row.updated_at,
    messages,
  }
}

function activeVip(user) {
  if (!user || user.vip_tier === 'none' || !user.vip_expires_at) return false
  return new Date(user.vip_expires_at).getTime() > Date.now()
}

function vipDiscount(user) {
  if (!activeVip(user)) return 1
  if (user.vip_tier === 'week') return 0.95
  if (user.vip_tier === 'month') return 0.9
  if (user.vip_tier === 'year') return 0.85
  return 1
}

function buildBootstrap(req) {
  const auth = parseAuth(req)
  const counselorAccounts = []
  let currentUserId = null
  let currentCounselorId = null
  let conversations = []
  let counselorChats = []
  let bookings = []
  let users = []

  if (auth?.role === 'user') {
    const row = userRow(auth.sub)
    if (row) {
      currentUserId = row.id
      users = db
        .prepare('SELECT * FROM users ORDER BY created_at ASC')
        .all()
        .map((u) => publicUser(u, u.id === row.id))
      conversations = db
        .prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC')
        .all(row.id)
        .map((conversation) => userConversation(conversation, row.id))
      bookings = db
        .prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC')
        .all(row.id)
        .map(publicBooking)
    }
  }

  if (auth?.role === 'counselor') {
    const account = accountRow(auth.sub)
    if (account) {
      currentCounselorId = account.id
      counselorAccounts.push({
        ...publicAccount(account),
        credential: publicCredential(credentialRow(account.id)),
      })
      counselorChats = db
        .prepare('SELECT * FROM conversations WHERE counselor_id = ? ORDER BY updated_at DESC')
        .all(account.counselor_id)
        .map((conversation) => counselorChat(conversation, account))
      bookings = db
        .prepare('SELECT * FROM bookings WHERE counselor_id = ? ORDER BY created_at DESC')
        .all(account.counselor_id)
        .map(publicBooking)
    }
  }

  return {
    version: 4,
    currentUserId,
    currentCounselorId,
    users,
    counselors: db.prepare('SELECT * FROM counselors ORDER BY rating DESC').all().map(publicCounselor),
    counselorAccounts,
    counselorChats,
    institutions: db.prepare('SELECT * FROM institutions').all().map(publicInstitution),
    posts: postRowsFor(currentUserId).map((post) => publicPost(post, currentUserId)),
    conversations,
    rooms: [],
    lives: db.prepare('SELECT * FROM lives ORDER BY starts_at DESC').all().map(publicLive),
    bookings,
    gameRecords: [],
    redemptions: [],
  }
}

function uidFromClient(value, prefix) {
  if (typeof value === 'string' && /^[a-zA-Z0-9_-]{8,80}$/.test(value)) return value
  return uid(prefix)
}

// ---------- health / bootstrap ----------

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'guanxin-server', time: nowIso() })
})

app.get('/api/bootstrap', (req, res) => {
  res.json(buildBootstrap(req))
})

// ---------- user auth ----------

app.post('/api/auth/register', async (req, res) => {
  const { phone, password, nickname } = req.body ?? {}
  if (!/^1\d{10}$/.test(String(phone ?? ''))) {
    return res.status(400).json({ error: '请输入 11 位手机号' })
  }
  if (String(password ?? '').length < 6) {
    return res.status(400).json({ error: '密码至少需要 6 位' })
  }
  if (!String(nickname ?? '').trim()) {
    return res.status(400).json({ error: '请填写昵称' })
  }
  if (db.prepare('SELECT id FROM users WHERE phone = ?').get(phone)) {
    return res.status(409).json({ error: '这个手机号已经注册过' })
  }
  const id = uid('u')
  const createdAt = nowIso()
  db.prepare(`
    INSERT INTO users (id, phone, password_hash, nickname, age, gender, province, city, district, bio, avatar,
      following_user_ids, friend_ids, vip_tier, mic_chances, face_to_face_voucher, flowers, owned_items,
      equipped_frame, onboarded, created_at)
    VALUES (?, ?, ?, ?, 24, '不愿透露', '浙江省', '杭州', '西湖区', '刚刚来到观心，慢慢认识自己。', 'me',
      '[]', '[]', 'none', 0, 0, 18, '["frame_none"]', 'frame_none', 0, ?)
  `).run(id, phone, hashPassword(password), String(nickname).trim(), createdAt)
  setSessionCookie(res, 'user', id)
  res.json({ ok: true, user: publicUser(userRow(id), true) })
})

app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body ?? {}
  const row = db.prepare('SELECT * FROM users WHERE phone = ?').get(String(phone ?? '').trim())
  if (!row || !verifyPassword(String(password ?? ''), row.password_hash)) {
    return res.status(401).json({ error: '手机号或密码不正确' })
  }
  setSessionCookie(res, 'user', row.id)
  res.json({ ok: true, user: publicUser(row, true) })
})

app.post('/api/auth/logout', (req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

app.patch('/api/me', requireAuth('user'), (req, res) => {
  const row = userRow(req.auth.sub)
  if (!row) return res.status(404).json({ error: '账号不存在' })
  const body = req.body ?? {}
  const allowed = ['nickname', 'age', 'gender', 'bio', 'avatar']
  const updates = []
  const values = []
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates.push(`${key} = ?`)
      values.push(body[key])
    }
  }
  if (body.region && typeof body.region === 'object') {
    updates.push('province = ?', 'city = ?', 'district = ?')
    values.push(body.region.province, body.region.city, body.region.district)
  }
  if (body.onboarded !== undefined) {
    updates.push('onboarded = ?')
    values.push(body.onboarded ? 1 : 0)
  }
  if (updates.length) {
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values, row.id)
  }
  res.json({ ok: true, user: publicUser(userRow(row.id), true) })
})

app.post('/api/ai/match', requireAuth('user'), async (req, res) => {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'AI 服务尚未配置：请在服务端 .env 设置 AI_API_KEY' })
  }
  const answers = req.body?.answers
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: '缺少匹配答案' })
  }
  const counselors = db
    .prepare('SELECT * FROM counselors ORDER BY rating DESC')
    .all()
    .map((c) => ({
      id: c.id,
      name: c.name,
      title: c.title,
      years: c.years,
      city: c.city,
      district: c.district,
      specialties: parseJson(c.specialties, []),
      tags: parseJson(c.tags, []),
      style: c.style,
      price: c.price,
      rating: c.rating,
      intro: c.intro,
      formats: parseJson(c.formats, []),
    }))
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '')
  const model = process.env.AI_MODEL || 'deepseek-chat'
  const systemPrompt = [
    '你是「观心」心理陪伴应用的专业咨询师匹配助手。',
    '你只能从候选咨询师中选择，不得编造不存在的咨询师 id。',
    '不要做医学诊断，不要承诺疗效，不要推荐药物。',
    '根据用户的困扰、持续时间、陪伴偏好、预算和咨询方式，选择最合适的 3 位咨询师。',
    '专业方向优先：必须先看 specialties 与用户困扰是否直接相关；不要因为同城、价格低或风格温和，就选择明显不对口的专科方向（例如把儿童游戏治疗师推荐给成人焦虑）。',
    '若直接相关的人选不足 3 位，才逐步放宽到可迁移的相近方向，并在理由中说明。',
    '只返回一个 JSON 对象，不要使用 Markdown 代码围栏。',
    'JSON 格式：{"summary":"不超过80字的整体建议","recommendations":[{"id":"咨询师id","score":92,"reasons":["具体理由1","具体理由2"]}]}',
    'score 为 70 到 98 的整数；reasons 每条不超过 32 字，必须结合用户回答与咨询师资料。',
  ].join('\n')
  const userPrompt = [
    `用户回答：${JSON.stringify(answers)}`,
    `用户所在城市：${req.body?.city || '未知'}`,
    `候选咨询师：${JSON.stringify(counselors)}`,
    '请严格返回 3 位咨询师，并优先考虑擅长方向、沟通风格、预算和地区是否匹配。',
  ].join('\n\n')

  let response
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(45_000),
    })
  } catch (error) {
    console.error('[ai] request failed', error?.message || error)
    return res.status(502).json({ error: 'AI 服务连接失败，请稍后再试' })
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('[ai] provider status', response.status, detail.slice(0, 300))
    return res.status(502).json({ error: `AI 服务返回错误（${response.status}）` })
  }
  let payload
  try {
    payload = await response.json()
  } catch {
    return res.status(502).json({ error: 'AI 服务返回内容无法解析' })
  }
  const raw = payload?.choices?.[0]?.message?.content
  if (!raw) return res.status(502).json({ error: 'AI 服务没有返回内容' })
  let result
  try {
    result = JSON.parse(String(raw).replace(/^```json\s*/i, '').replace(/```$/i, '').trim())
  } catch {
    return res.status(502).json({ error: 'AI 返回的匹配结果格式不正确' })
  }
  const validIds = new Set(counselors.map((c) => c.id))
  const recommendations = Array.isArray(result?.recommendations)
    ? result.recommendations
        .filter((item) => item && validIds.has(item.id))
        .slice(0, 3)
        .map((item) => ({
          counselorId: item.id,
          score: Math.max(70, Math.min(98, Number(item.score) || 80)),
          reasons: Array.isArray(item.reasons)
            ? item.reasons.filter((r) => typeof r === 'string').slice(0, 3)
            : [],
        }))
    : []
  if (recommendations.length === 0) {
    return res.status(502).json({ error: 'AI 未能给出有效的咨询师推荐' })
  }
  res.json({
    ok: true,
    summary: typeof result.summary === 'string' ? result.summary.slice(0, 160) : '',
    recommendations,
    model,
  })
})

app.post('/api/me/vip', requireAuth('user'), (req, res) => {
  const tier = String(req.body?.tier ?? '')
  if (!['week', 'month', 'year'].includes(tier)) {
    return res.status(400).json({ error: '会员类型不正确' })
  }
  const user = userRow(req.auth.sub)
  if (!user) return res.status(404).json({ error: '账号不存在' })
  const days = tier === 'week' ? 7 : tier === 'month' ? 30 : 365
  const now = Date.now()
  const base =
    user.vip_expires_at && new Date(user.vip_expires_at).getTime() > now
      ? new Date(user.vip_expires_at).getTime()
      : now
  const expires = new Date(base + days * 86400_000).toISOString()
  const micChances = tier === 'week' ? user.mic_chances + 2 : user.mic_chances
  const voucher = tier === 'year' ? user.face_to_face_voucher + 1 : user.face_to_face_voucher
  const owned = parseJson(user.owned_items, ['frame_none'])
  if (!owned.includes('frame_moon')) owned.push('frame_moon')
  db.prepare(`
    UPDATE users SET vip_tier = ?, vip_expires_at = ?, mic_chances = ?, face_to_face_voucher = ?,
      owned_items = ? WHERE id = ?
  `).run(tier, expires, micChances, voucher, JSON.stringify(owned), user.id)
  res.json({ ok: true, user: publicUser(userRow(user.id), true) })
})

app.post('/api/me/follow/:counselorId', requireAuth('user'), (req, res) => {
  const counselorId = req.params.counselorId
  if (!counselorRow(counselorId)) return res.status(404).json({ error: '咨询师不存在' })
  const existing = db
    .prepare('SELECT 1 FROM follows WHERE user_id = ? AND counselor_id = ?')
    .get(req.auth.sub, counselorId)
  if (existing) {
    db.prepare('DELETE FROM follows WHERE user_id = ? AND counselor_id = ?').run(req.auth.sub, counselorId)
    db.prepare('UPDATE counselors SET followers = MAX(0, followers - 1) WHERE id = ?').run(counselorId)
    res.json({ ok: true, following: false })
  } else {
    db.prepare('INSERT INTO follows (user_id, counselor_id, created_at) VALUES (?, ?, ?)').run(
      req.auth.sub,
      counselorId,
      nowIso(),
    )
    db.prepare('UPDATE counselors SET followers = followers + 1 WHERE id = ?').run(counselorId)
    res.json({ ok: true, following: true })
  }
})

// ---------- posts ----------

function authorFor(req) {
  if (req.auth.role === 'user') {
    const row = userRow(req.auth.sub)
    return row ? { id: row.id, type: 'user', name: row.nickname, avatar: row.avatar, tag: null } : null
  }
  const account = accountRow(req.auth.sub)
  if (!account || account.status !== 'approved') return null
  return { id: account.counselor_id, type: 'counselor', name: account.name, avatar: account.avatar, tag: '认证心理咨询师' }
}

app.post('/api/posts', requireAuth('user', 'counselor'), (req, res) => {
  const author = authorFor(req)
  if (!author) return res.status(403).json({ error: '当前账号暂时不能发布内容' })
  const { content = '', images = [], videoUrl, visibility = 'public', visibleTo = [] } = req.body ?? {}
  if (!String(content).trim() && (!Array.isArray(images) || images.length === 0) && !videoUrl) {
    return res.status(400).json({ error: '写点什么或配一张图片吧' })
  }
  const id = uidFromClient(req.body?.id, 'post')
  db.prepare(`
    INSERT INTO posts (id, author_id, author_type, author_name, author_avatar, author_tag, content, images,
      video_url, visibility, visible_to, created_at, liked_by, likes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 0)
  `).run(
    id,
    author.id,
    author.type,
    author.name,
    author.avatar,
    author.tag,
    String(content).slice(0, 2000),
    JSON.stringify(Array.isArray(images) ? images.slice(0, 3) : []),
    videoUrl ?? null,
    ['public', 'friends', 'partial', 'private'].includes(visibility) ? visibility : 'public',
    JSON.stringify(Array.isArray(visibleTo) ? visibleTo : []),
    nowIso(),
  )
  const post = publicPost(db.prepare('SELECT * FROM posts WHERE id = ?').get(id), req.auth.sub)
  if (post.visibility === 'public') broadcastAll('post:new', { post })
  res.json({ ok: true, post })
})

app.delete('/api/posts/:id', requireAuth('user', 'counselor'), (req, res) => {
  const author = authorFor(req)
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: '内容不存在' })
  if (!author || post.author_id !== author.id) return res.status(403).json({ error: '只能删除自己的内容' })
  db.prepare('DELETE FROM posts WHERE id = ?').run(post.id)
  broadcastAll('post:delete', { id: post.id })
  res.json({ ok: true })
})

app.post('/api/posts/:id/like', requireAuth('user', 'counselor'), (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: '内容不存在' })
  if (!canViewPost(post, req.auth)) return res.status(403).json({ error: '没有权限查看这条内容' })
  const likedBy = parseJson(post.liked_by, [])
  const index = likedBy.indexOf(req.auth.sub)
  if (index >= 0) likedBy.splice(index, 1)
  else likedBy.push(req.auth.sub)
  db.prepare('UPDATE posts SET liked_by = ?, likes = ? WHERE id = ?').run(
    JSON.stringify(likedBy),
    likedBy.length,
    post.id,
  )
  res.json({ ok: true, likes: likedBy.length, liked: index < 0 })
})

app.post('/api/posts/:id/comments', requireAuth('user', 'counselor'), (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: '内容不存在' })
  if (!canViewPost(post, req.auth)) return res.status(403).json({ error: '没有权限查看这条内容' })
  const author = authorFor(req)
  if (!author) return res.status(403).json({ error: '当前账号暂时不能评论' })
  const content = String(req.body?.content ?? '').trim()
  if (!content) return res.status(400).json({ error: '评论不能为空' })
  const comment = {
    id: uid('cmt'),
    authorName: author.name,
    authorAvatar: author.avatar,
    content: content.slice(0, 500),
    createdAt: nowIso(),
  }
  db.prepare(`
    INSERT INTO comments (id, post_id, author_id, author_name, author_avatar, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(comment.id, post.id, author.id, author.name, author.avatar, comment.content, comment.createdAt)
  res.json({ ok: true, comment })
})

// ---------- bookings ----------

app.post('/api/bookings', requireAuth('user'), (req, res) => {
  const user = userRow(req.auth.sub)
  if (!user) return res.status(404).json({ error: '账号不存在' })
  const { counselorId, date, time, format, usedVoucher } = req.body ?? {}
  const counselor = counselorRow(String(counselorId ?? ''))
  if (!counselor) return res.status(404).json({ error: '咨询师不存在' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date ?? '')) || !/^\d{2}:\d{2}$/.test(String(time ?? ''))) {
    return res.status(400).json({ error: '预约时间不正确' })
  }
  if (!['video', 'voice', 'inperson'].includes(format)) {
    return res.status(400).json({ error: '咨询方式不正确' })
  }
  const originalPrice = counselor.price
  let price = Math.round(originalPrice * vipDiscount(user))
  let useVoucher = Boolean(usedVoucher) && user.face_to_face_voucher > 0 && format === 'inperson'
  if (useVoucher) price = 0
  const booking = {
    id: uid('booking'),
    userId: user.id,
    counselorId: counselor.id,
    counselorName: counselor.name,
    counselorAvatar: counselor.avatar,
    date,
    time,
    format,
    price,
    originalPrice,
    status: 'upcoming',
    createdAt: nowIso(),
    usedVoucher: useVoucher,
    clientName: user.nickname,
    clientAvatar: user.avatar,
  }
  db.exec('BEGIN')
  try {
    db.prepare(`
      INSERT INTO bookings (id, user_id, counselor_id, counselor_name, counselor_avatar, date, time, format,
        price, original_price, status, created_at, used_voucher, client_name, client_avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?, ?, ?)
    `).run(
      booking.id,
      booking.userId,
      booking.counselorId,
      booking.counselorName,
      booking.counselorAvatar,
      booking.date,
      booking.time,
      booking.format,
      booking.price,
      booking.originalPrice,
      booking.createdAt,
      booking.usedVoucher ? 1 : 0,
      booking.clientName,
      booking.clientAvatar,
    )
    if (useVoucher) {
      db.prepare('UPDATE users SET face_to_face_voucher = MAX(0, face_to_face_voucher - 1) WHERE id = ?').run(user.id)
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
  broadcastTo('counselor', counselor.account_id ?? '', 'booking:new', { booking: publicBooking({ ...booking, used_voucher: booking.usedVoucher ? 1 : 0 }) })
  res.json({ ok: true, booking })
})

app.post('/api/bookings/:id/cancel', requireAuth('user', 'counselor'), (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id)
  if (!booking) return res.status(404).json({ error: '预约不存在' })
  if (req.auth.role === 'user' && booking.user_id !== req.auth.sub) {
    return res.status(403).json({ error: '只能操作自己的预约' })
  }
  if (req.auth.role === 'counselor') {
    const account = accountRow(req.auth.sub)
    if (!account || booking.counselor_id !== account.counselor_id) {
      return res.status(403).json({ error: '只能操作自己的预约' })
    }
  }
  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(booking.id)
  res.json({ ok: true })
})

// ---------- conversations / messages ----------

function conversationAccess(conversation, auth) {
  if (auth.role === 'user') return conversation.user_id === auth.sub
  if (auth.role === 'counselor') {
    const account = accountRow(auth.sub)
    return Boolean(account && conversation.counselor_id === account.counselor_id)
  }
  return false
}

app.post('/api/conversations', requireAuth('user'), (req, res) => {
  const counselorId = String(req.body?.counselorId ?? '')
  if (!counselorRow(counselorId)) return res.status(404).json({ error: '咨询师不存在' })
  const existing = db
    .prepare('SELECT * FROM conversations WHERE user_id = ? AND counselor_id = ?')
    .get(req.auth.sub, counselorId)
  if (existing) return res.json({ ok: true, id: existing.id })
  const id = uidFromClient(req.body?.id, 'conv')
  const timestamp = nowIso()
  db.prepare('INSERT INTO conversations (id, user_id, counselor_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(
    id,
    req.auth.sub,
    counselorId,
    timestamp,
    timestamp,
  )
  res.json({ ok: true, id })
})

app.post('/api/conversations/:id/messages', requireAuth('user', 'counselor'), (req, res) => {
  let conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id)
  if (!conversation && req.auth.role === 'user' && req.body?.counselorId) {
    const counselor = counselorRow(String(req.body.counselorId))
    if (!counselor) return res.status(404).json({ error: '咨询师不存在' })
    conversation = db
      .prepare('SELECT * FROM conversations WHERE user_id = ? AND counselor_id = ?')
      .get(req.auth.sub, counselor.id)
    if (!conversation) {
      const timestamp = nowIso()
      db.prepare('INSERT INTO conversations (id, user_id, counselor_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(
        req.params.id,
        req.auth.sub,
        counselor.id,
        timestamp,
        timestamp,
      )
      conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id)
    }
  }
  if (!conversation) return res.status(404).json({ error: '会话不存在' })
  if (!conversationAccess(conversation, req.auth)) return res.status(403).json({ error: '没有权限' })
  const content = String(req.body?.content ?? '').trim()
  if (!content) return res.status(400).json({ error: '消息不能为空' })
  const message = {
    id: uidFromClient(req.body?.messageId, 'msg'),
    conversationId: conversation.id,
    senderRole: req.auth.role,
    senderId: req.auth.sub,
    content: content.slice(0, 2000),
    createdAt: nowIso(),
  }
  db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_role, sender_id, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(message.id, message.conversationId, message.senderRole, message.senderId, message.content, message.createdAt)
  db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(message.createdAt, conversation.id)
  const payload = {
    conversationId: conversation.id,
    message,
    userConversation: userConversation(conversation, conversation.user_id),
    counselorChat: counselorChat(conversation, null),
  }
  const counselorAccount = db
    .prepare('SELECT id FROM counselor_accounts WHERE counselor_id = ?')
    .get(conversation.counselor_id)
  broadcastTo('user', conversation.user_id, 'message:new', payload)
  broadcastTo('counselor', counselorAccount?.id ?? '', 'message:new', payload)
  res.json({ ok: true, message })
})

app.post('/api/conversations/:id/read', requireAuth('user', 'counselor'), (req, res) => {
  const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id)
  if (!conversation) return res.status(404).json({ error: '会话不存在' })
  if (!conversationAccess(conversation, req.auth)) return res.status(403).json({ error: '没有权限' })
  const otherRole = req.auth.role === 'user' ? 'counselor' : 'user'
  db.prepare(`
    UPDATE messages SET read_at = ? WHERE conversation_id = ? AND sender_role = ? AND read_at IS NULL
  `).run(nowIso(), conversation.id, otherRole)
  res.json({ ok: true })
})

// ---------- counselor auth / certification ----------

app.post('/api/counselor/register', upload.single('certificate'), (req, res) => {
  const body = req.body ?? {}
  const name = String(body.name ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  const password = String(body.password ?? '')
  if (!name) return res.status(400).json({ error: '请填写真实姓名' })
  if (!/^1\d{10}$/.test(phone)) return res.status(400).json({ error: '请输入 11 位手机号' })
  if (password.length < 6) return res.status(400).json({ error: '密码至少需要 6 位' })
  if (!body.certificateType) return res.status(400).json({ error: '请选择证件类型' })
  if (!String(body.licenseNumber ?? '').trim()) return res.status(400).json({ error: '请填写证件编号' })
  if (!String(body.issuingAuthority ?? '').trim()) return res.status(400).json({ error: '请填写发证机构' })
  if (!String(body.institution ?? '').trim()) return res.status(400).json({ error: '请填写所在机构' })
  if (!req.file) return res.status(400).json({ error: '请上传咨询师证件照片' })
  if (db.prepare('SELECT id FROM counselor_accounts WHERE phone = ?').get(phone)) {
    return res.status(409).json({ error: '这个手机号已经提交过咨询师账号' })
  }
  const specialties = parseJson(body.specialties, [])
  if (!Array.isArray(specialties) || specialties.length === 0) {
    return res.status(400).json({ error: '请至少选择一个擅长方向' })
  }
  const accountId = uid('ca')
  const counselorId = uid('c')
  const avatar = body.gender === '男' ? 'me2' : 'me3'
  const createdAt = nowIso()
  const filePath = `credentials/${req.file.filename}`
  db.exec('BEGIN')
  try {
    db.prepare(`
      INSERT INTO counselor_accounts (id, counselor_id, phone, password_hash, name, gender, avatar, title, bio,
        province, city, district, years, institution, specialties, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      accountId,
      counselorId,
      phone,
      hashPassword(password),
      name,
      body.gender === '男' ? '男' : '女',
      avatar,
      body.certificateType,
      String(body.bio ?? '').trim(),
      body.province || '浙江省',
      body.city || '杭州',
      body.district || '西湖区',
      Number(body.years || 0),
      String(body.institution).trim(),
      JSON.stringify(specialties.slice(0, 6)),
      createdAt,
    )
    db.prepare(`
      INSERT INTO credentials (id, account_id, certificate_type, license_number, issuing_authority,
        file_path, file_mime, submitted_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(
      uid('cred'),
      accountId,
      String(body.certificateType),
      String(body.licenseNumber).trim(),
      String(body.issuingAuthority).trim(),
      filePath,
      req.file.mimetype,
      createdAt,
    )
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
  setSessionCookie(res, 'counselor', accountId)
  const account = accountRow(accountId)
  res.json({
    ok: true,
    account: { ...publicAccount(account), credential: publicCredential(credentialRow(accountId)) },
  })
})

app.post('/api/counselor/login', (req, res) => {
  const { phone, password } = req.body ?? {}
  const account = db.prepare('SELECT * FROM counselor_accounts WHERE phone = ?').get(String(phone ?? '').trim())
  if (!account || !verifyPassword(String(password ?? ''), account.password_hash)) {
    return res.status(401).json({ error: '咨询师账号或密码不正确' })
  }
  if (account.status === 'rejected') {
    return res.status(403).json({ error: '认证资料未通过，请重新提交' })
  }
  setSessionCookie(res, 'counselor', account.id)
  res.json({
    ok: true,
    account: { ...publicAccount(account), credential: publicCredential(credentialRow(account.id)) },
  })
})

app.post('/api/counselor/logout', (_req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

app.get('/api/counselor/credential-file', (req, res) => {
  const auth = parseAuth(req)
  if (!auth) return res.status(401).json({ error: '请先登录' })
  const account = accountRow(auth.sub)
  if (!account) return res.status(404).json({ error: '账号不存在' })
  const credential = credentialRow(account.id)
  if (!credential) return res.status(404).json({ error: '证件不存在' })
  const file = resolve(UPLOAD_DIR, credential.file_path)
  if (!existsSync(file)) return res.status(404).json({ error: '证件文件不存在' })
  res.type(credential.file_mime)
  res.sendFile(file)
})

// ---------- admin ----------

app.post('/api/admin/login', (req, res) => {
  const password = String(req.body?.password ?? '')
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: '管理员密码不正确' })
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' })
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: COOKIE_SECURE,
    maxAge: 12 * 60 * 60 * 1000,
    path: '/',
  })
  res.json({ ok: true })
})

app.post('/api/admin/logout', (_req, res) => {
  res.clearCookie(ADMIN_COOKIE, { path: '/' })
  res.json({ ok: true })
})

function adminApplication(account) {
  const credential = credentialRow(account.id)
  return {
    id: account.id,
    name: account.name,
    phone: account.phone,
    gender: account.gender,
    title: account.title,
    bio: account.bio,
    region: { province: account.province, city: account.city, district: account.district },
    years: account.years,
    institution: account.institution,
    specialties: parseJson(account.specialties, []),
    status: account.status,
    createdAt: account.created_at,
    credential: credential
      ? {
          certificateType: credential.certificate_type,
          licenseNumber: credential.license_number,
          issuingAuthority: credential.issuing_authority,
          submittedAt: credential.submitted_at,
          status: credential.status,
          note: credential.review_note,
          fileUrl: `/api/admin/applications/${account.id}/file`,
        }
      : null,
  }
}

app.get('/api/admin/applications', requireAdmin, (_req, res) => {
  const accounts = db
    .prepare(
      "SELECT * FROM counselor_accounts WHERE status != 'approved' ORDER BY created_at DESC",
    )
    .all()
  const approved = db
    .prepare(`
      SELECT ca.*, c.name AS public_name
      FROM counselor_accounts ca
      LEFT JOIN counselors c ON c.id = ca.counselor_id
      WHERE ca.status = 'approved'
      ORDER BY ca.created_at DESC
      LIMIT 20
    `)
    .all()
  res.json({
    applications: accounts.map(adminApplication),
    approved: approved.map((a) => ({
      id: a.id,
      name: a.public_name ?? a.name,
      phone: a.phone,
      status: a.status,
      createdAt: a.created_at,
    })),
  })
})

app.get('/api/admin/applications/:id/file', requireAdmin, (req, res) => {
  const credential = db
    .prepare('SELECT * FROM credentials WHERE account_id = ?')
    .get(req.params.id)
  if (!credential) return res.status(404).json({ error: '证件不存在' })
  const file = resolve(UPLOAD_DIR, credential.file_path)
  if (!existsSync(file)) return res.status(404).json({ error: '证件文件不存在' })
  res.type(credential.file_mime)
  res.sendFile(file)
})

app.post('/api/admin/applications/:id/approve', requireAdmin, (req, res) => {
  const account = accountRow(req.params.id)
  if (!account) return res.status(404).json({ error: '申请不存在' })
  if (account.status === 'approved') return res.json({ ok: true })
  const credential = credentialRow(account.id)
  if (!credential) return res.status(400).json({ error: '缺少证件材料' })
  const institution =
    db.prepare('SELECT * FROM institutions WHERE name = ?').get(account.institution) ??
    db.prepare('SELECT * FROM institutions WHERE city = ?').get(account.city) ??
    db.prepare('SELECT * FROM institutions LIMIT 1').get()
  const counselorId = account.counselor_id ?? uid('c')
  const existing = counselorRow(counselorId)
  db.exec('BEGIN')
  try {
    if (!existing) {
      db.prepare(`
        INSERT INTO counselors (id, account_id, name, avatar, gender, age, title, years, city, district,
          institution_id, specialties, tags, price, rating, sessions, followers, intro, quote, style,
          online, formats, review_author, review_content, review_rating, created_at)
        VALUES (?, ?, ?, ?, ?, 32, ?, ?, ?, ?, ?, ?, ?, 299, 5, 0, 0, ?, ?, '温柔倾听', 1,
          '["video","voice","inperson"]', '观心平台', '资质材料已通过平台审核。', 5, ?)
      `).run(
        counselorId,
        account.id,
        account.name,
        account.avatar,
        account.gender,
        account.title,
        account.years,
        account.city,
        account.district,
        institution?.id ?? 'inst_zhiyu',
        account.specialties,
        JSON.stringify(['新入驻', account.title]),
        account.bio || '愿意用专业和耐心，陪你走过这一段。',
        '愿每一次倾听，都让你更靠近自己。',
        nowIso(),
      )
    }
    db.prepare("UPDATE counselor_accounts SET status = 'approved' WHERE id = ?").run(account.id)
    db.prepare(`
      UPDATE credentials SET status = 'approved', reviewed_at = ?, review_note = '资质材料已通过平台审核'
      WHERE account_id = ?
    `).run(nowIso(), account.id)
    if (institution) {
      const ids = parseJson(institution.counselor_ids, [])
      if (!ids.includes(counselorId)) ids.push(counselorId)
      db.prepare('UPDATE institutions SET counselor_ids = ? WHERE id = ?').run(
        JSON.stringify(ids),
        institution.id,
      )
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
  res.json({ ok: true, counselorId })
})

app.post('/api/admin/applications/:id/reject', requireAdmin, (req, res) => {
  const account = accountRow(req.params.id)
  if (!account) return res.status(404).json({ error: '申请不存在' })
  const note = String(req.body?.note ?? '资料未通过审核，请补充或更新后重新提交').slice(0, 300)
  db.exec('BEGIN')
  try {
    db.prepare("UPDATE counselor_accounts SET status = 'rejected' WHERE id = ?").run(account.id)
    db.prepare(`
      UPDATE credentials SET status = 'rejected', reviewed_at = ?, review_note = ? WHERE account_id = ?
    `).run(nowIso(), note, account.id)
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
  res.json({ ok: true })
})

// ---------- admin page ----------

app.get('/admin', (_req, res) => {
  res.sendFile(join(__dirname, 'admin.html'))
})

// ---------- websocket ----------

const socketGroups = new Map()
const wss = new WebSocketServer({ noServer: true })

function groupKey(role, id) {
  return `${role}:${id}`
}

function addSocket(role, id, ws) {
  const key = groupKey(role, id)
  if (!socketGroups.has(key)) socketGroups.set(key, new Set())
  socketGroups.get(key).add(ws)
}

function removeSocket(role, id, ws) {
  const key = groupKey(role, id)
  const set = socketGroups.get(key)
  if (!set) return
  set.delete(ws)
  if (set.size === 0) socketGroups.delete(key)
}

function broadcastTo(role, id, type, payload) {
  if (!id) return
  const set = socketGroups.get(groupKey(role, id))
  if (!set) return
  const data = JSON.stringify({ type, ...payload })
  for (const ws of set) {
    if (ws.readyState === 1) ws.send(data)
  }
}

function broadcastAll(type, payload) {
  const data = JSON.stringify({ type, ...payload })
  for (const set of socketGroups.values()) {
    for (const ws of set) {
      if (ws.readyState === 1) ws.send(data)
    }
  }
}

server.on('upgrade', (req, socket, head) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    if (url.pathname !== '/ws') {
      socket.destroy()
      return
    }
    const cookies = Object.fromEntries(
      String(req.headers.cookie ?? '')
        .split(';')
        .map((part) => part.trim().split('='))
        .filter((pair) => pair.length === 2),
    )
    const token = cookies[SESSION_COOKIE]
    if (!token) {
      socket.destroy()
      return
    }
    const payload = jwt.verify(token, JWT_SECRET)
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.auth = payload
      addSocket(payload.role, payload.sub, ws)
      ws.send(JSON.stringify({ type: 'connected', role: payload.role }))
      ws.on('message', (raw) => {
        try {
          const message = JSON.parse(String(raw))
          if (message.type === 'ping') ws.send(JSON.stringify({ type: 'pong', at: nowIso() }))
        } catch {
          // ignore malformed client messages
        }
      })
      ws.on('close', () => removeSocket(payload.role, payload.sub, ws))
      ws.on('error', () => removeSocket(payload.role, payload.sub, ws))
    })
  } catch {
    socket.destroy()
  }
})

// ---------- static frontend ----------

const distDir = resolve(__dirname, '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    if (req.path.startsWith('/assets')) return next()
    const index = join(distDir, 'index.html')
    if (!existsSync(index)) return next()
    res.sendFile(index)
  })
}

app.use('/api', (_req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

app.use((error, _req, res, _next) => {
  console.error('[api error]', error)
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? '证件图片不能超过 8MB' : error.message })
  }
  res.status(500).json({ error: error.message || '服务器内部错误' })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n观心真实后端已启动`)
  console.log(`  API:    http://localhost:${PORT}/api`)
  console.log(`  Admin:  http://localhost:${PORT}/admin`)
  console.log(`  DB:     ${process.env.DATABASE_PATH || join(__dirname, 'data/guanxin.db')}`)
  if (IS_DEFAULT_SECRET) {
    console.log('  ⚠ JWT_SECRET 使用开发默认值，请在 .env 中修改')
  }
  if (IS_DEFAULT_ADMIN) {
    console.log(`  ⚠ ADMIN_PASSWORD 使用默认值：${ADMIN_PASSWORD}，请在 .env 中修改`)
  }
  console.log('')
})
