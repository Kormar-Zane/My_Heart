export type Gender = '女' | '男' | '非二元' | '不愿透露'
export type VipTier = 'none' | 'week' | 'month' | 'year'
export type Visibility = 'public' | 'friends' | 'partial' | 'private'
export type SessionFormat = 'video' | 'voice' | 'inperson'
export type GameType = 'draw' | 'turtle' | 'idiom' | 'song' | 'karaoke'

export interface Region {
  province: string
  city: string
  district: string
}

export interface User {
  id: string
  phone: string
  password: string
  nickname: string
  age: number
  gender: Gender
  region: Region
  bio: string
  avatar: string
  followingUserIds: string[]
  friendIds: string[]
  followingCounselorIds: string[]
  vipTier: VipTier
  vipExpiresAt: string | null
  micChances: number
  faceToFaceVoucher: number
  flowers: number
  ownedItems: string[]
  equippedFrame: string
  equippedBadge: string | null
  onboarded: boolean
  createdAt: string
}

export interface Counselor {
  id: string
  name: string
  avatar: string
  gender: '女' | '男'
  age: number
  title: string
  years: number
  city: string
  district: string
  institutionId: string
  specialties: string[]
  tags: string[]
  price: number
  rating: number
  sessions: number
  intro: string
  quote: string
  style: string
  online: boolean
  formats: SessionFormat[]
  review: { author: string; content: string; rating: number }
}

export interface Institution {
  id: string
  name: string
  art: string
  city: string
  district: string
  address: string
  tags: string[]
  rating: number
  counselorIds: string[]
  intro: string
  hours: string
  phone: string
}

export interface Comment {
  id: string
  authorName: string
  authorAvatar: string
  content: string
  createdAt: string
}

export interface Post {
  id: string
  authorId: string
  authorType: 'user' | 'counselor' | 'official'
  authorName: string
  authorAvatar: string
  authorTag?: string
  content: string
  images: string[]
  videoUrl?: string
  visibility: Visibility
  visibleTo: string[]
  createdAt: string
  likes: number
  likedBy: string[]
  comments: Comment[]
}

export interface ChatMessage {
  id: string
  sender: 'me' | 'other' | 'system'
  content: string
  createdAt: string
  name?: string
  avatar?: string
}

export interface Conversation {
  id: string
  participantType: 'counselor' | 'friend' | 'system'
  participantId: string
  name: string
  avatar: string
  subtitle: string
  unread: number
  online: boolean
  updatedAt: string
  messages: ChatMessage[]
}

export interface RoomMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  createdAt: string
  isMine?: boolean
}

export interface Room {
  id: string
  title: string
  topic: string
  hostName: string
  hostAvatar: string
  members: number
  capacity: number
  tag: string
  art: string
  messages: RoomMessage[]
  isMine?: boolean
}

export interface LiveSession {
  id: string
  title: string
  hostId: string
  hostName: string
  hostAvatar: string
  hostTitle: string
  status: 'live' | 'upcoming'
  viewers: number
  startsAt: string
  tags: string[]
  description: string
  art: string
  chat: ChatMessage[]
}

export interface Booking {
  id: string
  counselorId: string
  counselorName: string
  counselorAvatar: string
  date: string
  time: string
  format: SessionFormat
  price: number
  originalPrice: number
  status: 'upcoming' | 'completed' | 'cancelled'
  createdAt: string
  usedVoucher: boolean
}

export interface GameRecord {
  id: string
  type: GameType
  title: string
  flowers: number
  createdAt: string
}

export interface Redemption {
  id: string
  itemId: string
  itemName: string
  price: number
  type: 'virtual' | 'physical'
  createdAt: string
  status: '已发放' | '待发货' | '待填写地址'
}

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: 'virtual' | 'physical'
  category: 'frame' | 'badge' | 'bubble' | 'merch'
  icon: string
  art: string
  vipOnly?: boolean
}

export interface AppState {
  version: number
  currentUserId: string | null
  users: User[]
  counselors: Counselor[]
  institutions: Institution[]
  posts: Post[]
  conversations: Conversation[]
  rooms: Room[]
  lives: LiveSession[]
  bookings: Booking[]
  gameRecords: GameRecord[]
  redemptions: Redemption[]
}

export interface VipPlan {
  tier: Exclude<VipTier, 'none'>
  name: string
  price: number
  days: number
  tag: string
  mic: string
  discount: number
  perks: string[]
}
