import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  AppState,
  Booking,
  ChatMessage,
  Comment,
  Conversation,
  Counselor,
  CounselorAccount,
  CounselorChat,
  CounselorCredential,
  GameType,
  Post,
  Region,
  Room,
  User,
  VipTier,
  Visibility,
} from './types'
import {
  buildFreshUser,
  COUNSELOR_ACCOUNTS,
  COUNSELOR_CHATS,
  createInitialState,
  DEMO_COUNSELOR_ACCOUNT_ID,
  DEMO_USER_ID,
} from './data'
import { isVipActive, uid } from './utils'
import { checkServer, getWebSocketUrl, serverApi } from './api'

const STORAGE_KEY = 'guanxin_app_state_v4'
const LEGACY_STORAGE_KEY = 'guanxin_app_state_v3'

type ToastKind = 'success' | 'error' | 'info'
interface ToastItem {
  id: string
  message: string
  kind: ToastKind
}

interface ActionResult {
  ok: boolean
  message?: string
  liveId?: string
}

interface CreatePostInput {
  content: string
  images: string[]
  videoUrl?: string
  visibility: Visibility
  visibleTo: string[]
}

interface CounselorApplicationInput {
  name: string
  phone: string
  password: string
  gender: '女' | '男'
  region: Region
  years: number
  institution: string
  specialties: string[]
  bio: string
  certificateType: string
  licenseNumber: string
  issuingAuthority: string
  certificateImage: string
}

interface StartLiveInput {
  title: string
  description: string
  tags: string[]
  art: string
}

interface StoreValue {
  state: AppState
  currentUser: User | null
  currentCounselorAccount: CounselorAccount | null
  currentCounselorProfile: Counselor | null
  serverMode: boolean
  serverChecked: boolean
  syncFromServer: () => Promise<void>
  toast: ToastItem | null
  showToast: (message: string, kind?: ToastKind) => void
  dismissToast: () => void
  login: (account: string, password: string) => Promise<ActionResult>
  loginDemo: () => void
  register: (data: { phone: string; password: string; nickname: string }) => Promise<ActionResult>
  logout: () => void
  finishOnboarding: (data: { age: number; gender: User['gender']; region: Region }) => void
  updateProfile: (patch: Partial<Pick<User, 'nickname' | 'age' | 'gender' | 'region' | 'bio' | 'avatar'>>) => void
  followCounselor: (id: string) => void
  purchaseVip: (tier: Exclude<VipTier, 'none'>) => Promise<ActionResult>
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
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Promise<ActionResult>
  cancelBooking: (id: string) => void
  requestMic: () => ActionResult
  addLiveChat: (liveId: string, content: string) => void
  completeGame: (type: GameType, title: string, flowers: number) => void
  createRoom: (data: { title: string; topic: string; tag: string }) => string
  sendRoomMessage: (roomId: string, content: string) => void
  receiveRoomMessage: (roomId: string, content: string) => void
  loginCounselor: (account: string, password: string) => Promise<ActionResult>
  loginDemoCounselor: (id?: string) => void
  registerCounselor: (data: CounselorApplicationInput) => Promise<ActionResult>
  approveCounselorDemo: () => ActionResult
  logoutCounselor: () => void
  createCounselorPost: (content: string, images: string[]) => void
  startCounselorLive: (data: StartLiveInput) => ActionResult
  endCounselorLive: (liveId: string) => void
  sendCounselorLiveMessage: (liveId: string, content: string) => void
  sendCounselorChatMessage: (chatId: string, content: string) => void
  receiveCounselorClientMessage: (chatId: string, content: string) => void
  markCounselorChatRead: (chatId: string) => void
  resetDemo: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as AppState
    if (!parsed || !Array.isArray(parsed.users)) return createInitialState()

    if (parsed.version === 3) {
      return {
        ...parsed,
        version: 4,
        currentCounselorId: null,
        counselorAccounts: COUNSELOR_ACCOUNTS,
        counselorChats: COUNSELOR_CHATS,
      }
    }

    if (
      parsed.version !== 4 ||
      !Array.isArray(parsed.counselorAccounts) ||
      !Array.isArray(parsed.counselorChats)
    ) {
      return createInitialState()
    }

    return parsed
  } catch {
    return createInitialState()
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [toast, setToast] = useState<ToastItem | null>(null)
  const [serverMode, setServerMode] = useState(false)
  const [serverChecked, setServerChecked] = useState(false)

  const applyServerState = useCallback((data: AppState) => {
    setState((prev) => ({
      ...prev,
      ...data,
      rooms: data.rooms.length > 0 ? data.rooms : prev.rooms,
      gameRecords: prev.gameRecords,
      redemptions: prev.redemptions,
    }))
  }, [])

  const syncFromServer = useCallback(async () => {
    const data = await serverApi.bootstrap()
    applyServerState(data)
  }, [applyServerState])

  useEffect(() => {
    let cancelled = false
    checkServer()
      .then(async () => {
        if (cancelled) return null
        setServerMode(true)
        return serverApi.bootstrap()
      })
      .then((data) => {
        if (cancelled || !data) return
        applyServerState(data)
      })
      .catch(() => {
        if (!cancelled) setServerMode(false)
      })
      .finally(() => {
        if (!cancelled) setServerChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [applyServerState])

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

  const currentCounselorAccount = useMemo(
    () => state.counselorAccounts.find((c) => c.id === state.currentCounselorId) ?? null,
    [state.counselorAccounts, state.currentCounselorId],
  )

  const currentCounselorProfile = useMemo(
    () => state.counselors.find((c) => c.id === currentCounselorAccount?.counselorId) ?? null,
    [state.counselors, currentCounselorAccount?.counselorId],
  )

  useEffect(() => {
    if (!serverMode || (!state.currentUserId && !state.currentCounselorId)) return
    let socket: WebSocket | null = null
    try {
      socket = new WebSocket(getWebSocketUrl())
    } catch {
      return
    }
    socket.onmessage = (event) => {
      let payload: Record<string, any>
      try {
        payload = JSON.parse(event.data)
      } catch {
        return
      }
      if (payload.type === 'message:new') {
        setState((prev) => {
          if (prev.currentUserId && payload.userConversation) {
            const conversation = payload.userConversation
            const exists = prev.conversations.some((c) => c.id === conversation.id)
            return {
              ...prev,
              conversations: exists
                ? prev.conversations.map((c) => (c.id === conversation.id ? conversation : c))
                : [conversation, ...prev.conversations],
            }
          }
          if (prev.currentCounselorId && payload.counselorChat) {
            const chat = payload.counselorChat
            const exists = prev.counselorChats.some((c) => c.id === chat.id)
            return {
              ...prev,
              counselorChats: exists
                ? prev.counselorChats.map((c) => (c.id === chat.id ? chat : c))
                : [chat, ...prev.counselorChats],
            }
          }
          return prev
        })
      }
      if (payload.type === 'post:new' && payload.post) {
        setState((prev) => {
          if (prev.posts.some((p) => p.id === payload.post.id)) return prev
          return { ...prev, posts: [payload.post, ...prev.posts] }
        })
      }
      if (payload.type === 'post:delete' && payload.id) {
        setState((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== payload.id) }))
      }
      if (payload.type === 'booking:new' && payload.booking && state.currentCounselorId) {
        setState((prev) => {
          if (prev.bookings.some((b) => b.id === payload.booking.id)) return prev
          return { ...prev, bookings: [payload.booking, ...prev.bookings] }
        })
      }
    }
    return () => {
      socket?.close()
    }
  }, [serverMode, state.currentUserId, state.currentCounselorId])

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
    async (account: string, password: string): Promise<ActionResult> => {
      if (serverMode) {
        try {
          await serverApi.login(account.trim(), password)
          await syncFromServer()
          return { ok: true }
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message : '登录失败' }
        }
      }
      const key = account.trim()
      const user = state.users.find((u) => u.phone === key || u.nickname === key)
      if (!user) return { ok: false, message: '没有找到这个账号，试试手机号或昵称' }
      if (user.password !== password) return { ok: false, message: '密码好像不太对，再试一次' }
      setState((prev) => ({ ...prev, currentUserId: user.id }))
      return { ok: true }
    },
    [serverMode, state.users, syncFromServer],
  )

  const loginDemo = useCallback(() => {
    if (serverMode) {
      showToast('真实服务模式已关闭示例账号，请注册或登录真实账号', 'info')
      return
    }
    setState((prev) => ({ ...prev, currentUserId: DEMO_USER_ID }))
  }, [serverMode, showToast])

  const register = useCallback(
    async ({ phone, password, nickname }: { phone: string; password: string; nickname: string }): Promise<ActionResult> => {
      if (!/^1\d{10}$/.test(phone)) return { ok: false, message: '请输入 11 位手机号' }
      if (password.length < 6) return { ok: false, message: '密码至少需要 6 位' }
      if (!nickname.trim()) return { ok: false, message: '给自己起一个昵称吧' }
      if (serverMode) {
        try {
          await serverApi.register(phone, password, nickname.trim())
          await syncFromServer()
          return { ok: true }
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message : '注册失败' }
        }
      }
      if (state.users.some((u) => u.phone === phone)) return { ok: false, message: '这个手机号已经注册过啦' }
      const user = buildFreshUser({ phone, password, nickname: nickname.trim() })
      setState((prev) => ({ ...prev, users: [...prev.users, user], currentUserId: user.id }))
      return { ok: true }
    },
    [serverMode, state.users, syncFromServer],
  )

  const logout = useCallback(() => {
    if (serverMode) {
      void serverApi.logout().finally(() => {
        void syncFromServer()
      })
    }
    setState((prev) => ({ ...prev, currentUserId: null, currentCounselorId: null }))
  }, [serverMode, syncFromServer])

  const finishOnboarding = useCallback(
    ({ age, gender, region }: { age: number; gender: User['gender']; region: Region }) => {
      patchCurrentUser((u) => ({ ...u, age, gender, region, onboarded: true }))
      if (serverMode) {
        void serverApi.updateMe({ age, gender, region, onboarded: true })
      }
      showToast('欢迎来到观心，这里会慢慢懂你')
    },
    [patchCurrentUser, serverMode, showToast],
  )

  const updateProfile = useCallback(
    (patch: Partial<Pick<User, 'nickname' | 'age' | 'gender' | 'region' | 'bio' | 'avatar'>>) => {
      const previous = currentUser
      patchCurrentUser((u) => ({ ...u, ...patch }))
      if (serverMode) {
        void serverApi.updateMe(patch)
      }
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
    [currentUser, patchCurrentUser, serverMode, showToast],
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
      if (serverMode) {
        void serverApi.follow(id)
      }
      showToast(following ? '已取消关注' : '已关注这位咨询师', following ? 'info' : 'success')
    },
    [currentUser, patchCurrentUser, serverMode, showToast],
  )

  const purchaseVip = useCallback(
    async (tier: Exclude<VipTier, 'none'>): Promise<ActionResult> => {
      if (!currentUser) return { ok: false, message: '请先登录' }
      if (serverMode) {
        try {
          const { user } = await serverApi.purchaseVip(tier)
          setState((prev) => ({
            ...prev,
            users: prev.users.map((u) => (u.id === user.id ? user : u)),
          }))
          showToast(tier === 'year' ? '年卡开通成功，面对面权益已到账' : '会员开通成功，专属装扮已解锁')
          return { ok: true }
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message : '开通失败' }
        }
      }
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
    [currentUser, patchCurrentUser, serverMode, showToast],
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
      if (serverMode) {
        void serverApi
          .createPost({ ...input, id: post.id })
          .then(({ post: saved }) => {
            setState((prev) => ({ ...prev, posts: prev.posts.map((p) => (p.id === post.id ? saved : p)) }))
          })
          .catch((error) => {
            setState((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== post.id) }))
            showToast(error instanceof Error ? error.message : '发布失败', 'error')
          })
      }
    },
    [currentUser, serverMode, showToast],
  )

  const deletePost = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== id) }))
      if (serverMode) {
        void serverApi.deletePost(id).catch((error) => {
          showToast(error instanceof Error ? error.message : '删除失败', 'error')
          void syncFromServer()
        })
      }
      showToast('已删除这条日常', 'info')
    },
    [serverMode, showToast, syncFromServer],
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
      if (serverMode) {
        void serverApi.likePost(id).catch(() => {
          // The next bootstrap will reconcile likes if the request failed.
        })
      }
    },
    [currentUser, serverMode],
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
      if (serverMode) {
        void serverApi
          .commentPost(postId, comment.content)
          .then(({ comment: saved }) => {
            setState((prev) => ({
              ...prev,
              posts: prev.posts.map((p) =>
                p.id === postId
                  ? { ...p, comments: p.comments.map((c) => (c.id === comment.id ? saved : c)) }
                  : p,
              ),
            }))
          })
          .catch((error) => {
            setState((prev) => ({
              ...prev,
              posts: prev.posts.map((p) =>
                p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== comment.id) } : p,
              ),
            }))
            showToast(error instanceof Error ? error.message : '评论失败', 'error')
          })
      }
    },
    [currentUser, serverMode, showToast],
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
        messages: serverMode
          ? []
          : [
              {
                id: uid('m'),
                sender: 'system',
                content: `你已开始与 ${counselor.name} 的对话。可以在这里简单说说你的困扰，或直接预约咨询。`,
                createdAt: new Date().toISOString(),
              },
            ],
      }
      setState((prev) => ({ ...prev, conversations: [conversation, ...prev.conversations] }))
      if (serverMode) {
        void serverApi.createConversation(id, counselor.id).catch(() => {
          showToast('会话创建失败，请检查服务器连接', 'error')
        })
      }
      return id
    },
    [serverMode, showToast, state.conversations],
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
      const conversation = state.conversations.find((c) => c.id === conversationId)
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, message], updatedAt: message.createdAt, unread: 0 }
            : c,
        ),
      }))
      if (serverMode && conversation?.participantType === 'counselor') {
        void serverApi
          .sendMessage(conversationId, message.content, message.id, conversation.participantId)
          .catch((error) => {
            showToast(error instanceof Error ? error.message : '消息发送失败', 'error')
          })
      }
    },
    [serverMode, showToast, state.conversations],
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

  const markConversationRead = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
      }))
      if (serverMode) {
        void serverApi.markConversationRead(id).catch(() => {
          // Read receipts are best-effort; the next bootstrap reconciles them.
        })
      }
    },
    [serverMode],
  )

  const createBooking = useCallback(
    async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<ActionResult> => {
      if (!currentUser) return { ok: false, message: '请先登录' }
      if (serverMode) {
        try {
          const { booking: saved } = await serverApi.createBooking({
            counselorId: booking.counselorId,
            date: booking.date,
            time: booking.time,
            format: booking.format,
            usedVoucher: booking.usedVoucher,
          })
          setState((prev) => ({ ...prev, bookings: [saved, ...prev.bookings] }))
          if (saved.usedVoucher) {
            patchCurrentUser((u) => ({ ...u, faceToFaceVoucher: Math.max(0, u.faceToFaceVoucher - 1) }))
          }
          return { ok: true }
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message : '预约失败' }
        }
      }
      const newBooking: Booking = {
        ...booking,
        id: uid('booking'),
        createdAt: new Date().toISOString(),
        status: 'upcoming',
        clientName: currentUser.nickname,
        clientAvatar: currentUser.avatar,
      }
      setState((prev) => ({ ...prev, bookings: [newBooking, ...prev.bookings] }))
      if (booking.usedVoucher) {
        patchCurrentUser((u) => ({ ...u, faceToFaceVoucher: Math.max(0, u.faceToFaceVoucher - 1) }))
      }
      return { ok: true }
    },
    [currentUser, patchCurrentUser, serverMode],
  )

  const cancelBooking = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
      }))
      if (serverMode) {
        void serverApi.cancelBooking(id).catch((error) => {
          showToast(error instanceof Error ? error.message : '取消失败', 'error')
        })
      }
      showToast('预约已取消', 'info')
    },
    [serverMode, showToast],
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

  const loginCounselor = useCallback(
    async (account: string, password: string): Promise<ActionResult> => {
      if (serverMode) {
        try {
          await serverApi.counselorLogin(account.trim(), password)
          await syncFromServer()
          return { ok: true }
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message : '登录失败' }
        }
      }
      const key = account.trim()
      const found = state.counselorAccounts.find((c) => c.phone === key || c.name === key)
      if (!found) return { ok: false, message: '没有找到这个咨询师账号' }
      if (found.password !== password) return { ok: false, message: '密码不正确，请再试一次' }
      setState((prev) => ({ ...prev, currentCounselorId: found.id }))
      return { ok: true }
    },
    [serverMode, state.counselorAccounts, syncFromServer],
  )

  const loginDemoCounselor = useCallback(
    (id = DEMO_COUNSELOR_ACCOUNT_ID) => {
      if (serverMode) {
        showToast('真实服务模式已关闭示例账号，请提交认证或使用真实咨询师账号', 'info')
        return
      }
      setState((prev) => ({ ...prev, currentCounselorId: id }))
    },
    [serverMode, showToast],
  )

  const registerCounselor = useCallback(
    async (data: CounselorApplicationInput): Promise<ActionResult> => {
      if (!data.name.trim()) return { ok: false, message: '请填写真实姓名' }
      if (!/^1\d{10}$/.test(data.phone)) return { ok: false, message: '请输入 11 位手机号' }
      if (data.password.length < 6) return { ok: false, message: '密码至少需要 6 位' }
      if (!data.certificateType.trim()) return { ok: false, message: '请选择证件类型' }
      if (!data.licenseNumber.trim()) return { ok: false, message: '请填写证件编号' }
      if (!data.issuingAuthority.trim()) return { ok: false, message: '请填写发证机构' }
      if (!data.certificateImage) return { ok: false, message: '请上传咨询师证件照片' }
      if (data.specialties.length === 0) return { ok: false, message: '请至少选择一个擅长方向' }

      if (serverMode) {
        try {
          await serverApi.counselorRegister(data)
          await syncFromServer()
          return { ok: true }
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message : '提交失败' }
        }
      }

      if (state.counselorAccounts.some((c) => c.phone === data.phone)) {
        return { ok: false, message: '这个手机号已经提交过咨询师账号' }
      }
      const accountId = uid('ca')
      const account: CounselorAccount = {
        id: accountId,
        counselorId: uid('c'),
        phone: data.phone,
        password: data.password,
        name: data.name.trim(),
        gender: data.gender,
        avatar: data.gender === '女' ? 'me3' : 'me2',
        title: data.certificateType,
        bio: data.bio.trim() || '愿意用专业和耐心，陪你走过这一段。',
        region: data.region,
        years: data.years,
        institution: data.institution.trim() || '独立执业',
        specialties: data.specialties,
        status: 'pending',
        credential: {
          certificateType: data.certificateType,
          licenseNumber: data.licenseNumber.trim(),
          issuingAuthority: data.issuingAuthority.trim(),
          certificateImage: data.certificateImage,
          submittedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        counselorAccounts: [...prev.counselorAccounts, account],
        currentCounselorId: account.id,
      }))
      return { ok: true }
    },
    [serverMode, state.counselorAccounts, syncFromServer],
  )

  const approveCounselorDemo = useCallback((): ActionResult => {
    if (serverMode) {
      return { ok: false, message: '真实服务模式由平台管理员审核，不能自助通过' }
    }
    if (!currentCounselorAccount) return { ok: false, message: '请先登录咨询师账号' }
    if (currentCounselorAccount.status === 'approved') return { ok: true }
    const account = currentCounselorAccount
    const institution =
      state.institutions.find((i) => i.name === account.institution) ??
      state.institutions.find((i) => i.city === account.region.city) ??
      state.institutions[0]
    const publicProfile: Counselor = {
      id: account.counselorId,
      name: account.name,
      avatar: account.avatar,
      gender: account.gender,
      age: 32,
      title: account.title,
      years: account.years,
      city: account.region.city,
      district: account.region.district,
      institutionId: institution?.id ?? 'inst_zhiyu',
      specialties: account.specialties,
      tags: ['新入驻', account.credential.certificateType],
      price: 299,
      rating: 5.0,
      sessions: 0,
      followers: 0,
      intro: account.bio,
      quote: '愿每一次倾听，都让你更靠近自己。',
      style: '温柔倾听',
      online: true,
      formats: ['video', 'voice', 'inperson'],
      review: { author: '观心平台', content: '资质材料已通过平台审核。', rating: 5 },
    }
    setState((prev) => ({
      ...prev,
      counselorAccounts: prev.counselorAccounts.map((c) =>
        c.id === account.id ? { ...c, status: 'approved' } : c,
      ),
      counselors: prev.counselors.some((c) => c.id === publicProfile.id)
        ? prev.counselors
        : [...prev.counselors, publicProfile],
      institutions: institution
        ? prev.institutions.map((i) =>
            i.id === institution.id && !i.counselorIds.includes(publicProfile.id)
              ? { ...i, counselorIds: [...i.counselorIds, publicProfile.id] }
              : i,
          )
        : prev.institutions,
    }))
    showToast('认证审核已通过，咨询师工作台已解锁')
    return { ok: true }
  }, [currentCounselorAccount, serverMode, showToast, state.institutions])

  const logoutCounselor = useCallback(() => {
    if (serverMode) {
      void serverApi.counselorLogout().finally(() => {
        void syncFromServer()
      })
    }
    setState((prev) => ({ ...prev, currentCounselorId: null, currentUserId: null }))
  }, [serverMode, syncFromServer])

  const createCounselorPost = useCallback(
    (content: string, images: string[]) => {
      if (!currentCounselorAccount || !content.trim()) return
      const profile = state.counselors.find((c) => c.id === currentCounselorAccount.counselorId)
      const post: Post = {
        id: uid('post'),
        authorId: currentCounselorAccount.counselorId,
        authorType: 'counselor',
        authorName: currentCounselorAccount.name,
        authorAvatar: currentCounselorAccount.avatar,
        authorTag: '认证心理咨询师',
        content: content.trim(),
        images,
        visibility: 'public',
        visibleTo: [],
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: [],
      }
      setState((prev) => ({ ...prev, posts: [post, ...prev.posts] }))
      if (profile) {
        setState((prev) => ({
          ...prev,
          counselors: prev.counselors.map((c) => (c.id === profile.id ? { ...c, online: true } : c)),
        }))
      }
      if (serverMode) {
        void serverApi
          .createPost({
            id: post.id,
            content: post.content,
            images: post.images,
            visibility: 'public',
            visibleTo: [],
          })
          .then(({ post: saved }) => {
            setState((prev) => ({ ...prev, posts: prev.posts.map((p) => (p.id === post.id ? saved : p)) }))
          })
          .catch((error) => {
            setState((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== post.id) }))
            showToast(error instanceof Error ? error.message : '发布失败', 'error')
          })
      }
    },
    [currentCounselorAccount, serverMode, showToast, state.counselors],
  )

  const startCounselorLive = useCallback(
    (data: StartLiveInput): ActionResult => {
      if (!currentCounselorAccount) return { ok: false, message: '请先登录咨询师账号' }
      if (currentCounselorAccount.status !== 'approved') {
        return { ok: false, message: '资质审核通过后才能开播' }
      }
      const account = currentCounselorAccount
      const existing = state.lives.find(
        (l) => l.hostId === account.counselorId && l.status === 'live',
      )
      if (existing) {
        return { ok: true, liveId: existing.id, message: '你已有一场直播正在进行' }
      }
      const profile = state.counselors.find((c) => c.id === account.counselorId)
      const id = uid('live')
      const live: (typeof state.lives)[number] = {
        id,
        title: data.title.trim() || '和你聊聊最近的心里事',
        hostId: account.counselorId,
        hostName: account.name,
        hostAvatar: account.avatar,
        hostTitle: profile?.title ?? account.title,
        status: 'live',
        viewers: 3,
        startsAt: new Date().toISOString(),
        tags: data.tags.length ? data.tags : ['心理陪伴', '免费'],
        description: data.description.trim() || '一场轻松的直播，聊聊最近的心情与困惑。',
        art: data.art || 'live_sage',
        chat: [
          {
            id: uid('lc'),
            sender: 'system',
            content: '直播已开始。请遵守咨询伦理，不公开讨论可识别来访者身份的信息。',
            createdAt: new Date().toISOString(),
          },
          {
            id: uid('lc'),
            sender: 'other',
            name: '南栀',
            avatar: 'nanzhi',
            content: '老师晚上好，来啦，今天想听听怎么和焦虑相处。',
            createdAt: new Date().toISOString(),
          },
          {
            id: uid('lc'),
            sender: 'other',
            name: '阿梨',
            avatar: 'ali',
            content: '刚好下班，进来坐一会儿。',
            createdAt: new Date().toISOString(),
          },
        ],
      }
      setState((prev) => ({
        ...prev,
        lives: [live, ...prev.lives],
        counselors: prev.counselors.map((c) =>
          c.id === account.counselorId ? { ...c, online: true } : c,
        ),
      }))
      return { ok: true, liveId: id }
    },
    [currentCounselorAccount, state.counselors, state.lives],
  )

  const endCounselorLive = useCallback(
    (liveId: string) => {
      if (!currentCounselorAccount) return
      setState((prev) => ({
        ...prev,
        lives: prev.lives.filter(
          (l) => !(l.id === liveId && l.hostId === currentCounselorAccount.counselorId),
        ),
      }))
    },
    [currentCounselorAccount],
  )

  const sendCounselorLiveMessage = useCallback(
    (liveId: string, content: string) => {
      if (!currentCounselorAccount || !content.trim()) return
      const message: ChatMessage = {
        id: uid('lc'),
        sender: 'other',
        name: currentCounselorAccount.name,
        avatar: currentCounselorAccount.avatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        lives: prev.lives.map((live) =>
          live.id === liveId ? { ...live, chat: [...live.chat, message] } : live,
        ),
      }))
    },
    [currentCounselorAccount],
  )

  const sendCounselorChatMessage = useCallback(
    (chatId: string, content: string) => {
      if (!currentCounselorAccount || !content.trim()) return
      const message = {
        id: uid('cm'),
        sender: 'counselor' as const,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        counselorChats: prev.counselorChats.map((chat) =>
          chat.id === chatId && chat.counselorId === currentCounselorAccount.counselorId
            ? {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: message.createdAt,
                unread: 0,
              }
            : chat,
        ),
      }))
      if (serverMode) {
        void serverApi.sendMessage(chatId, message.content, message.id).catch((error) => {
          showToast(error instanceof Error ? error.message : '消息发送失败', 'error')
        })
      }
    },
    [currentCounselorAccount, serverMode, showToast],
  )

  const receiveCounselorClientMessage = useCallback(
    (chatId: string, content: string) => {
      if (!currentCounselorAccount || !content.trim()) return
      setState((prev) => ({
        ...prev,
        counselorChats: prev.counselorChats.map((chat) =>
          chat.id === chatId && chat.counselorId === currentCounselorAccount.counselorId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    id: uid('cm'),
                    sender: 'client',
                    content: content.trim(),
                    createdAt: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
                unread: chat.unread + 1,
              }
            : chat,
        ),
      }))
    },
    [currentCounselorAccount],
  )

  const markCounselorChatRead = useCallback(
    (chatId: string) => {
      setState((prev) => ({
        ...prev,
        counselorChats: prev.counselorChats.map((chat) =>
          chat.id === chatId ? { ...chat, unread: 0 } : chat,
        ),
      }))
      if (serverMode) {
        void serverApi.markConversationRead(chatId).catch(() => {
          // best-effort read receipt
        })
      }
    },
    [serverMode],
  )

  const resetDemo = useCallback(() => {
    if (serverMode) {
      showToast('真实服务数据不会在这里清除；请联系管理员或操作数据库', 'info')
      return
    }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    setState(createInitialState())
    showToast('演示数据已重置', 'info')
  }, [serverMode, showToast])

  const value: StoreValue = {
    state,
    currentUser,
    currentCounselorAccount,
    currentCounselorProfile,
    serverMode,
    serverChecked,
    syncFromServer,
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
    loginCounselor,
    loginDemoCounselor,
    registerCounselor,
    approveCounselorDemo,
    logoutCounselor,
    createCounselorPost,
    startCounselorLive,
    endCounselorLive,
    sendCounselorLiveMessage,
    sendCounselorChatMessage,
    receiveCounselorClientMessage,
    markCounselorChatRead,
    resetDemo,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
