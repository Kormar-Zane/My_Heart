import { DatabaseSync } from 'node:sqlite'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, 'data')
mkdirSync(dataDir, { recursive: true })

export const DB_PATH = process.env.DATABASE_PATH || join(dataDir, 'guanxin.db')
export const UPLOAD_DIR = join(__dirname, 'uploads')
mkdirSync(join(UPLOAD_DIR, 'credentials'), { recursive: true })
mkdirSync(join(UPLOAD_DIR, 'avatars'), { recursive: true })

export const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA foreign_keys = ON;')

export const nowIso = () => new Date().toISOString()
export const uid = (prefix = 'id') => `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`
export const hashPassword = (password) => bcrypt.hashSync(password, 10)
export const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash)
export const newSessionSecret = () => randomBytes(32).toString('hex')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 24,
  gender TEXT NOT NULL DEFAULT '不愿透露',
  province TEXT NOT NULL DEFAULT '浙江省',
  city TEXT NOT NULL DEFAULT '杭州',
  district TEXT NOT NULL DEFAULT '西湖区',
  bio TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT 'me',
  following_user_ids TEXT NOT NULL DEFAULT '[]',
  friend_ids TEXT NOT NULL DEFAULT '[]',
  vip_tier TEXT NOT NULL DEFAULT 'none',
  vip_expires_at TEXT,
  mic_chances INTEGER NOT NULL DEFAULT 0,
  face_to_face_voucher INTEGER NOT NULL DEFAULT 0,
  flowers INTEGER NOT NULL DEFAULT 18,
  owned_items TEXT NOT NULL DEFAULT '["frame_none"]',
  equipped_frame TEXT NOT NULL DEFAULT 'frame_none',
  equipped_badge TEXT,
  onboarded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS institutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  art TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  rating REAL NOT NULL DEFAULT 0,
  counselor_ids TEXT NOT NULL DEFAULT '[]',
  intro TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS counselors (
  id TEXT PRIMARY KEY,
  account_id TEXT UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  title TEXT NOT NULL,
  years INTEGER NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  institution_id TEXT NOT NULL,
  specialties TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  price INTEGER NOT NULL,
  rating REAL NOT NULL DEFAULT 5,
  sessions INTEGER NOT NULL DEFAULT 0,
  followers INTEGER NOT NULL DEFAULT 0,
  intro TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL DEFAULT '',
  style TEXT NOT NULL DEFAULT '温柔倾听',
  online INTEGER NOT NULL DEFAULT 1,
  formats TEXT NOT NULL DEFAULT '["video","voice"]',
  review_author TEXT NOT NULL DEFAULT '',
  review_content TEXT NOT NULL DEFAULT '',
  review_rating REAL NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS follows (
  user_id TEXT NOT NULL,
  counselor_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, counselor_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (counselor_id) REFERENCES counselors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS counselor_accounts (
  id TEXT PRIMARY KEY,
  counselor_id TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  avatar TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  years INTEGER NOT NULL DEFAULT 0,
  institution TEXT NOT NULL,
  specialties TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  account_id TEXT UNIQUE NOT NULL,
  certificate_type TEXT NOT NULL,
  license_number TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_mime TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TEXT,
  review_note TEXT,
  FOREIGN KEY (account_id) REFERENCES counselor_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_type TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  author_tag TEXT,
  content TEXT NOT NULL DEFAULT '',
  images TEXT NOT NULL DEFAULT '[]',
  video_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  visible_to TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  liked_by TEXT NOT NULL DEFAULT '[]',
  likes INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  counselor_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (user_id, counselor_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (counselor_id) REFERENCES counselors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  read_at TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  counselor_id TEXT NOT NULL,
  counselor_name TEXT NOT NULL,
  counselor_avatar TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  format TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TEXT NOT NULL,
  used_voucher INTEGER NOT NULL DEFAULT 0,
  client_name TEXT NOT NULL,
  client_avatar TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (counselor_id) REFERENCES counselors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lives (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  host_avatar TEXT NOT NULL,
  host_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  viewers INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  art TEXT NOT NULL DEFAULT 'live_sage',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS live_messages (
  id TEXT PRIMARY KEY,
  live_id TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  sender_name TEXT,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (live_id) REFERENCES lives(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_counselor ON bookings(counselor_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_live_messages ON live_messages(live_id, created_at);
`)

function parseJson(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM counselors').get().n
  if (count > 0) return false
  const seed = JSON.parse(readFileSync(join(__dirname, 'seed-data.json'), 'utf8'))
  const insertUser = db.prepare(`
    INSERT INTO users (id, phone, password_hash, nickname, age, gender, province, city, district, bio, avatar,
      following_user_ids, friend_ids, vip_tier, vip_expires_at, mic_chances, face_to_face_voucher, flowers,
      owned_items, equipped_frame, equipped_badge, onboarded, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertInstitution = db.prepare(`
    INSERT INTO institutions (id, name, art, city, district, address, tags, rating, counselor_ids, intro, hours, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertCounselor = db.prepare(`
    INSERT INTO counselors (id, account_id, name, avatar, gender, age, title, years, city, district, institution_id,
      specialties, tags, price, rating, sessions, followers, intro, quote, style, online, formats,
      review_author, review_content, review_rating, created_at)
    VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertPost = db.prepare(`
    INSERT INTO posts (id, author_id, author_type, author_name, author_avatar, author_tag, content, images,
      video_url, visibility, visible_to, created_at, liked_by, likes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertComment = db.prepare(`
    INSERT INTO comments (id, post_id, author_id, author_name, author_avatar, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const insertLive = db.prepare(`
    INSERT INTO lives (id, title, host_id, host_name, host_avatar, host_title, status, viewers, starts_at, tags, description, art, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertLiveMessage = db.prepare(`
    INSERT INTO live_messages (id, live_id, sender_role, sender_name, sender_avatar, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  db.exec('BEGIN')
  try {
    for (const user of seed.users) {
      insertUser.run(
        user.id,
        user.phone,
        hashPassword(`seed-${user.id}-${randomBytes(8).toString('hex')}`),
        user.nickname,
        user.age,
        user.gender,
        user.region?.province ?? '浙江省',
        user.region?.city ?? '杭州',
        user.region?.district ?? '西湖区',
        user.bio ?? '',
        user.avatar ?? 'me',
        JSON.stringify(user.followingUserIds ?? []),
        JSON.stringify(user.friendIds ?? []),
        user.vipTier ?? 'none',
        user.vipExpiresAt ?? null,
        user.micChances ?? 0,
        user.faceToFaceVoucher ?? 0,
        user.flowers ?? 18,
        JSON.stringify(user.ownedItems ?? ['frame_none']),
        user.equippedFrame ?? 'frame_none',
        user.equippedBadge ?? null,
        user.onboarded ? 1 : 0,
        user.createdAt ?? nowIso(),
      )
    }
    for (const inst of seed.institutions) {
      insertInstitution.run(
        inst.id,
        inst.name,
        inst.art,
        inst.city,
        inst.district,
        inst.address,
        JSON.stringify(inst.tags),
        inst.rating,
        JSON.stringify(inst.counselorIds),
        inst.intro,
        inst.hours,
        inst.phone,
      )
    }
    for (const c of seed.counselors) {
      insertCounselor.run(
        c.id,
        c.name,
        c.avatar,
        c.gender,
        c.age,
        c.title,
        c.years,
        c.city,
        c.district,
        c.institutionId,
        JSON.stringify(c.specialties),
        JSON.stringify(c.tags),
        c.price,
        c.rating,
        c.sessions,
        c.followers ?? Math.round(c.sessions * 0.7),
        c.intro,
        c.quote,
        c.style,
        c.online ? 1 : 0,
        JSON.stringify(c.formats),
        c.review?.author ?? '',
        c.review?.content ?? '',
        c.review?.rating ?? 5,
        nowIso(),
      )
    }
    for (const p of seed.posts) {
      insertPost.run(
        p.id,
        p.authorId,
        p.authorType,
        p.authorName,
        p.authorAvatar,
        p.authorTag ?? null,
        p.content,
        JSON.stringify(p.images ?? []),
        p.videoUrl ?? null,
        p.visibility ?? 'public',
        JSON.stringify(p.visibleTo ?? []),
        p.createdAt,
        JSON.stringify(p.likedBy ?? []),
        p.likes ?? 0,
      )
      for (const c of p.comments ?? []) {
        insertComment.run(c.id, p.id, 'seed', c.authorName, c.authorAvatar, c.content, c.createdAt)
      }
    }
    for (const live of seed.lives) {
      insertLive.run(
        live.id,
        live.title,
        live.hostId,
        live.hostName,
        live.hostAvatar,
        live.hostTitle,
        live.status,
        live.viewers ?? 0,
        live.startsAt,
        JSON.stringify(live.tags ?? []),
        live.description ?? '',
        live.art ?? 'live_sage',
        live.startsAt,
      )
      for (const message of live.chat ?? []) {
        insertLiveMessage.run(
          message.id ?? uid('lc'),
          live.id,
          message.sender === 'system' ? 'system' : message.sender === 'me' ? 'host' : 'viewer',
          message.name ?? null,
          message.avatar ?? null,
          message.content,
          message.createdAt ?? nowIso(),
        )
      }
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
  return true
}

seedDatabase()

export { parseJson }
