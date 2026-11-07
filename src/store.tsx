import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  AppState,
  Booking,
  ChatMessage,
  Comment,
  Conversation,
  Counselor,
  GameType,
  Post,
  Region,
  Room,
  User,
  VipTier,
  Visibility,
} from './types'
import { buildFreshUser, createInitialState, DEMO_USER_ID } from './data'
import { isVipActive, uid } from './utils'

const STORAGE_KEY = 'guanxin_app_state_v3'

type ToastKind = 'success' | 'error' | 'info'
interface ToastItem {
  id: string
  message: string
  kind: ToastKind
}

interface ActionResult {
  ok: boolean
  message?: string
}

interface CreatePostInput {
  content: string
  images: string[]
  videoUrl?: string
  visibility: Visibility
  visibleTo: string[]
}

interface StoreValue {
  state: AppState
  currentUser: User | null
  toast: ToastItem | null
  showToast: (message: string, kind?: ToastKind) => void
  dismissToast: () => void
  login: (account: string, password: string) => ActionResult
  loginDemo: () => void
  register: (data: { phone: string; password: string; nickname: string }) => ActionResult
  logout: () => void
  finishOnboarding: (data: { age: number; gender: User['gender']; region: Region }) => void
  updateProfile: (patch: Partial<Pick<User, 'nickname' | 'age' | 'gender' | 'region' | 'bio' | 'avatar'>>) => void
  followCounselor: (id: string) => void
  purchaseVip: (tier: Exclude<VipTier, 'none'>) => ActionResult
  redeemItem: (itemId: string, price: number, name: string, type: 'virtual' | 'physical', vipOnly?: boolean) => ActionResult
  equipFrame: (frameId: string) => void
  equipBadge: (badgeId: string | null) => void
  createPost: (input: CreatePostInput) => void
  deletePost: (id: string) => void
  toggleLike: (id: string) => void
  addComment: (postId: string, content: string) => void
  ensureCounselorConversation: (counselor: Counselor) => string
  ensureUserConversation: (userId: string) => string
  sendMessage: (conversationId: string, content: string) => void
  receiveMessage: (conversationId: string, content: string) => void
  markConversationRead: (id: string) => void
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => ActionResult
  cancelBooking: (id: string) => void
  requestMic: () => ActionResult
  addLiveChat: (liveId: string, content: string) => void
  completeGame: (type: GameType, title: string, flowers: number) => void
  createRoom: (data: { title: string; topic: string; tag: string }) => string
  sendRoomMessage: (roomId: string, content: string) => void
  receiveRoomMessage: (roomId: string, content: string) => void
  resetDemo: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as AppState
    if (!parsed || parsed.version !== 3 || !Array.isArray(parsed.users)) return createInitialState()
    return parsed
  } catch {
    return createInitialState()
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [toast, setToast] = useState<ToastItem | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Large uploaded images may exceed the browser quota; the app remains usable in memory.
      console.warn('观心：本地存储空间不足，本次变更可能无法在刷新后保留。')
    }
  }, [state])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  )

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    setToast({ id: uid('toast'), message, kind })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const patchCurrentUser = useCallback(
    (updater: (user: User) => User) => {
      setState((prev) => {
        if (!prev.currentUserId) return prev
        return {
          ...prev,
          users: prev.users.map((u) => (u.id === prev.currentUserId ? updater(u) : u)),
        }
      })
    },
    [],
  )

  const login = useCallback(
    (account: string, password: string): ActionResult => {
      const key = account.trim()
      const user = state.users.find((u) => u.phone === key || u.nickname === key)
      if (!user) return { ok: false, message: '没有找到这个账号，试试手机号或昵称' }
      if (user.password !== password) return { ok: false, message: '密码好像不太对，再试一次' }
      setState((prev) => ({ ...prev, currentUserId: user.id }))
      return { ok: true }
    },
    [state.users],
  )

  const loginDemo = useCallback(() => {
    setState((prev) => ({ ...prev, currentUserId: DEMO_USER_ID }))
  }, [])

  const register = useCallback(
    ({ phone, password, nickname }: { phone: string; password: string; nickname: string }): ActionResult => {
      if (!/^1\d{10}$/.test(phone)) return { ok: false, message: '请输入 11 位手机号' }
      if (password.length < 6) return { ok: false, message: '密码至少需要 6 位' }
      if (!nickname.trim()) return { ok: false, message: '给自己起一个昵称吧' }
      if (state.users.some((u) => u.phone === phone)) return { ok: false, message: '这个手机号已经注册过啦' }
      const user = buildFreshUser({ phone, password, nickname: nickname.trim() })
      setState((prev) => ({ ...prev, users: [...prev.users, user], currentUserId: user.id }))
      return { ok: true }
    },
    [state.users],
  )

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, currentUserId: null }))
  }, [])

  const finishOnboarding = useCallback(
    ({ age, gender, region }: { age: number; gender: User['gender']; region: Region }) => {
      patchCurrentUser((u) => ({ ...u, age, gender, region, onboarded: true }))
      showToast('欢迎来到观心，这里会慢慢懂你')
    },
    [patchCurrentUser, showToast],
  )

  const updateProfile = useCallback(
    (patch: Partial<Pick<User, 'nickname' | 'age' | 'gender' | 'region' | 'bio' | 'avatar'>>) => {
      const previous = currentUser
      patchCurrentUser((u) => ({ ...u, ...patch }))
      if (previous && (patch.nickname !== undefined || patch.avatar !== undefined)) {
        const nextName = patch.nickname ?? previous.nickname
        const nextAvatar = patch.avatar ?? previous.avatar
        setState((prev) => ({
          ...prev,
          posts: prev.posts.map((post) => ({
            ...post,
            ...(post.authorId === previous.id ? { authorName: nextName, authorAvatar: nextAvatar } : {}),
            comments: post.comments.map((comment) =>
              comment.authorName === previous.nickname
                ? { ...comment, authorName: nextName, authorAvatar: nextAvatar }
                : comment,
            ),
          })),
        }))
      }
      showToast('资料已更新')
    },
    [currentUser, patchCurrentUser, showToast],
  )

  const followCounselor = useCallback(
    (id: string) => {
      if (!currentUser) return
      const following = currentUser.followingCounselorIds.includes(id)
      patchCurrentUser((u) => ({
        ...u,
        followingCounselorIds: following
          ? u.followingCounselorIds.filter((x) => x !== id)
          : [...u.followingCounselorIds, id],
      }))
      showToast(following ? '已取消关注' : '已关注这位咨询师', following ? 'info' : 'success')
    },
    [currentUser, patchCurrentUser, showToast],
  )

  const purchaseVip = useCallback(
    (tier: Exclude<VipTier, 'none'>): ActionResult => {
      if (!currentUser) return { ok: false, message: '请先登录' }
      const days = tier === 'week' ? 7 : tier === 'month' ? 30 : 365
      const active = isVipActive(currentUser)
      const base = active && currentUser?.vipExpiresAt ? new Date(currentUser.vipExpiresAt).getTime() : Date.now()
      const expires = new Date(Math.max(base, Date.now()) + days * 86400_000).toISOString()
      patchCurrentUser((u) => ({
        ...u,
        vipTier: tier,
        vipExpiresAt: expires,
        micChances: tier === 'week' ? u.micChances + 2 : u.micChances,
        faceToFaceVoucher: tier === 'year' ? u.faceToFaceVoucher + 1 : u.faceToFaceVoucher,
        ownedItems: u.ownedItems.includes('frame_moon') ? u.ownedItems : [...u.ownedItems, 'frame_moon'],
      }))
      showToast(tier === 'year' ? '年卡开通成功，面对面权益已到账' : '会员开通成功，专属装扮已解锁')
      return { ok: true }
    },
    [currentUser, patchCurrentUser, showToast],
  )

  const redeemItem = useCallback(
    (
      itemId: string,
      price: number,
      name: string,
      type: 'virtual' | 'physical',
      vipOnly = false,
    ): ActionResult => {
      if (!currentUser) return { ok: false, message: '请先登录' }
      if (vipOnly && !isVipActive(currentUser)) return { ok: false, message: '这是 VIP 专属礼物，先开通会员吧' }
      if (currentUser.flowers < price) return { ok: false, message: `还差 ${price - currentUser.flowers} 朵小红花` }
      if (type === 'virtual' && currentUser.ownedItems.includes(itemId)) return { ok: false, message: '这个礼物已经在你的装扮里啦' }
      patchCurrentUser((u) => ({
        ...u,
        flowers: u.flowers - price,
        ownedItems: type === 'virtual' ? [...u.ownedItems, itemId] : u.ownedItems,
      }))
      setState((prev) => ({
        ...prev,
        redemptions: [
          {
            id: uid('redeem'),
            itemId,
            itemName: name,
            price,
            type,
            createdAt: new Date().toISOString(),
            status: type === 'physical' ? '待发货' : '已发放',
          },
          ...prev.redemptions,
        ],
      }))
      showToast(type === 'physical' ? '兑换成功，观心小助手会联系你确认地址' : '兑换成功，去装扮中心试试吧')
      return { ok: true }
    },
    [currentUser, patchCurrentUser, showToast],
  )

  const equipFrame = useCallback(
    (frameId: string) => {
      if (!currentUser) return
      const vipFrame = frameId === 'frame_moon'
      if (vipFrame && !isVipActive(currentUser)) {
        showToast('「月白」是 VIP 专属头像框', 'info')
        return
      }
      if (!currentUser.ownedItems.includes(frameId) && !vipFrame) {
        showToast('还没有拥有这个头像框', 'info')
        return
      }
      patchCurrentUser((u) => ({ ...u, equippedFrame: frameId }))
      showToast('已换上新的头像框')
    },
    [currentUser, patchCurrentUser, showToast],
  )

  const equipBadge = useCallback(
    (badgeId: string | null) => {
      if (!currentUser) return
      if (badgeId && !currentUser.ownedItems.includes(badgeId)) {
        showToast('还没有拥有这枚徽章', 'info')
        return
      }
      patchCurrentUser((u) => ({ ...u, equippedBadge: badgeId }))
      showToast(badgeId ? '徽章已佩戴' : '已摘下徽章')
    },
    [currentUser, patchCurrentUser, showToast],
  )

  const createPost = useCallback(
    (input: CreatePostInput) => {
      if (!currentUser) return
      const post: Post = {
        id: uid('post'),
        authorId: currentUser.id,
        authorType: 'user',
        authorName: currentUser.nickname,
        authorAvatar: currentUser.avatar,
        content: input.content.trim(),
        images: input.images,
        videoUrl: input.videoUrl,
        visibility: input.visibility,
        visibleTo: input.visibleTo,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: [],
      }
      setState((prev) => ({ ...prev, posts: [post, ...prev.posts] }))
    },
    [currentUser],
  )

  const deletePost = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== id) }))
      showToast('已删除这条日常', 'info')
    },
    [showToast],
  )

  const toggleLike = useCallback(
    (id: string) => {
      if (!currentUser) return
      setState((prev) => ({
        ...prev,
        posts: prev.posts.map((post) => {
          if (post.id !== id) return post
          const liked = post.likedBy.includes(currentUser.id)
          return {
            ...post,
            likedBy: liked ? post.likedBy.filter((x) => x !== currentUser.id) : [...post.likedBy, currentUser.id],
            likes: Math.max(0, post.likes + (liked ? -1 : 1)),
          }
        }),
      }))
    },
    [currentUser],
  )

  const addComment = useCallback(
    (postId: string, content: string) => {
      if (!currentUser || !content.trim()) return
      const comment: Comment = {
        id: uid('cm'),
        authorName: currentUser.nickname,
        authorAvatar: currentUser.avatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)),
      }))
    },
    [currentUser],
  )

  const ensureCounselorConversation = useCallback(
    (counselor: Counselor) => {
      const existing = state.conversations.find(
        (c) => c.participantType === 'counselor' && c.participantId === counselor.id,
      )
      if (existing) return existing.id
      const id = uid('conv')
      const conversation: Conversation = {
        id,
        participantType: 'counselor',
        participantId: counselor.id,
        name: counselor.name,
        avatar: counselor.avatar,
        subtitle: counselor.title,
        unread: 0,
        online: counselor.online,
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: uid('m'),
            sender: 'system',
            content: `你已开始与 ${counselor.name} 的对话。可以在这里简单说说你的困扰，或直接预约咨询。`,
            createdAt: new Date().toISOString(),
          },
        ],
      }
      setState((prev) => ({ ...prev, conversations: [conversation, ...prev.conversations] }))
      return id
    },
    [state.conversations],
  )

  const ensureUserConversation = useCallback(
    (userId: string) => {
      const existing = state.conversations.find((c) => c.participantType !== 'counselor' && c.participantId === userId)
      if (existing) return existing.id
      const user = state.users.find((u) => u.id === userId)
      if (!user) return ''
      const id = uid('conv')
      const isFriend = currentUser?.friendIds.includes(userId) ?? false
      const conversation: Conversation = {
        id,
        participantType: 'friend',
        participantId: user.id,
        name: user.nickname,
        avatar: user.avatar,
        subtitle: `${user.region.city} · ${isFriend ? '朋友' : '观心伙伴'}`,
        unread: 0,
        online: true,
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: uid('m'),
            sender: 'system',
            content: isFriend
              ? `你们已经是朋友了。今天想聊点什么？`
              : `你开始和 ${user.nickname} 聊天。请友善交流，保护好彼此的隐私。`,
            createdAt: new Date().toISOString(),
          },
        ],
      }
      setState((prev) => ({ ...prev, conversations: [conversation, ...prev.conversations] }))
      return id
    },
    [currentUser, state.conversations, state.users],
  )

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      if (!content.trim()) return
      const message: ChatMessage = {
        id: uid('m'),
        sender: 'me',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, message], updatedAt: message.createdAt, unread: 0 }
            : c,
        ),
      }))
    },
    [],
  )

  const receiveMessage = useCallback((conversationId: string, content: string) => {
    const message: ChatMessage = {
      id: uid('m'),
      sender: 'other',
      content,
      createdAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], updatedAt: message.createdAt, unread: c.unread + 1 }
          : c,
      ),
    }))
  }, [])

  const markConversationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    }))
  }, [])

  const createBooking = useCallback(
    (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): ActionResult => {
      if (!currentUser) return { ok: false, message: '请先登录' }
      const newBooking: Booking = {
        ...booking,
        id: uid('booking'),
        createdAt: new Date().toISOString(),
        status: 'upcoming',
      }
      setState((prev) => ({ ...prev, bookings: [newBooking, ...prev.bookings] }))
      if (booking.usedVoucher) {
        patchCurrentUser((u) => ({ ...u, faceToFaceVoucher: Math.max(0, u.faceToFaceVoucher - 1) }))
      }
      return { ok: true }
    },
    [currentUser, patchCurrentUser],
  )

  const cancelBooking = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
      }))
      showToast('预约已取消', 'info')
    },
    [showToast],
  )

  const requestMic = useCallback((): ActionResult => {
    if (!currentUser) return { ok: false, message: '请先登录' }
    if (!isVipActive(currentUser)) return { ok: false, message: '连麦是 VIP 专属权益，开通后就能上麦' }
    if (currentUser.vipTier === 'week') {
      if (currentUser.micChances <= 0) return { ok: false, message: '本周连麦次数已用完，升级月卡可不限次' }
      patchCurrentUser((u) => ({ ...u, micChances: Math.max(0, u.micChances - 1) }))
      return { ok: true, message: `连麦申请已发送，本周还剩 ${currentUser.micChances - 1} 次` }
    }
    return { ok: true, message: '连麦申请已发送，老师会很快邀请你' }
  }, [currentUser, patchCurrentUser])

  const addLiveChat = useCallback(
    (liveId: string, content: string) => {
      if (!currentUser || !content.trim()) return
      const message: ChatMessage = {
        id: uid('lc'),
        sender: 'me',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        name: currentUser.nickname,
        avatar: currentUser.avatar,
      }
      setState((prev) => ({
        ...prev,
        lives: prev.lives.map((live) => (live.id === liveId ? { ...live, chat: [...live.chat, message] } : live)),
      }))
    },
    [currentUser],
  )

  const completeGame = useCallback(
    (type: GameType, title: string, flowers: number) => {
      if (!currentUser) return
      patchCurrentUser((u) => ({ ...u, flowers: u.flowers + flowers }))
      setState((prev) => ({
        ...prev,
        gameRecords: [
          { id: uid('game'), type, title, flowers, createdAt: new Date().toISOString() },
          ...prev.gameRecords,
        ],
      }))
    },
    [currentUser, patchCurrentUser],
  )

  const createRoom = useCallback(
    (data: { title: string; topic: string; tag: string }) => {
      if (!currentUser) return ''
      const id = uid('room')
      const room: Room = {
        id,
        title: data.title,
        topic: data.topic,
        hostName: currentUser.nickname,
        hostAvatar: currentUser.avatar,
        members: 1,
        capacity: 20,
        tag: data.tag,
        art: 'dusk',
        isMine: true,
        messages: [
          {
            id: uid('rm'),
            senderId: 'system',
            senderName: '房间提示',
            senderAvatar: 'official',
            content: '房间已创建。邀请朋友，或先从一句「今天过得怎么样」开始吧。',
            createdAt: new Date().toISOString(),
          },
        ],
      }
      setState((prev) => ({ ...prev, rooms: [room, ...prev.rooms] }))
      patchCurrentUser((u) => ({ ...u, flowers: u.flowers + 1 }))
      return id
    },
    [currentUser, patchCurrentUser],
  )

  const sendRoomMessage = useCallback(
    (roomId: string, content: string) => {
      if (!currentUser || !content.trim()) return
      const message = {
        id: uid('rm'),
        senderId: currentUser.id,
        senderName: currentUser.nickname,
        senderAvatar: currentUser.avatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        isMine: true,
      }
      setState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((r) => (r.id === roomId ? { ...r, messages: [...r.messages, message] } : r)),
      }))
    },
    [currentUser],
  )

  const receiveRoomMessage = useCallback((roomId: string, content: string) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => {
        if (r.id !== roomId) return r
        return {
          ...r,
          messages: [
            ...r.messages,
            {
              id: uid('rm'),
              senderId: 'host',
              senderName: r.hostName,
              senderAvatar: r.hostAvatar,
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      }),
    }))
  }, [])

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(createInitialState())
    showToast('演示数据已重置', 'info')
  }, [showToast])

  const value: StoreValue = {
    state,
    currentUser,
    toast,
    showToast,
    dismissToast,
    login,
    loginDemo,
    register,
    logout,
    finishOnboarding,
    updateProfile,
    followCounselor,
    purchaseVip,
    redeemItem,
    equipFrame,
    equipBadge,
    createPost,
    deletePost,
    toggleLike,
    addComment,
    ensureCounselorConversation,
    ensureUserConversation,
    sendMessage,
    receiveMessage,
    markConversationRead,
    createBooking,
    cancelBooking,
    requestMic,
    addLiveChat,
    completeGame,
    createRoom,
    sendRoomMessage,
    receiveRoomMessage,
    resetDemo,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
