import type { AppState, Booking, Counselor, Post, Region, User } from './types'

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.status = status
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers,
    })
  } catch {
    throw new ApiError('无法连接服务器，请确认后端已启动', 0)
  }
  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    data = null
  }
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : `请求失败（${response.status}）`
    throw new ApiError(message, response.status)
  }
  return data as T
}

export function getWebSocketUrl() {
  if (API_BASE) {
    const url = new URL(API_BASE, window.location.href)
    return `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/ws`
  }
  return `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`
}

export const serverApi = {
  async bootstrap() {
    return apiFetch<AppState>('/api/bootstrap')
  },
  async login(phone: string, password: string) {
    return apiFetch<{ ok: boolean; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    })
  },
  async register(phone: string, password: string, nickname: string) {
    return apiFetch<{ ok: boolean; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, password, nickname }),
    })
  },
  async logout() {
    return apiFetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST', body: '{}' })
  },
  async updateMe(patch: Partial<Pick<User, 'nickname' | 'age' | 'gender' | 'region' | 'bio' | 'avatar' | 'onboarded'>>) {
    return apiFetch<{ ok: boolean; user: User }>('/api/me', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  },
  async aiMatch(answers: Record<string, string>, city: string) {
    return apiFetch<{
      ok: boolean
      summary: string
      recommendations: Array<{ counselorId: string; score: number; reasons: string[] }>
      model: string
    }>('/api/ai/match', {
      method: 'POST',
      body: JSON.stringify({ answers, city }),
    })
  },
  async purchaseVip(tier: 'week' | 'month' | 'year') {
    return apiFetch<{ ok: boolean; user: User }>('/api/me/vip', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    })
  },
  async follow(counselorId: string) {
    return apiFetch<{ ok: boolean; following: boolean }>(`/api/me/follow/${encodeURIComponent(counselorId)}`, {
      method: 'POST',
      body: '{}',
    })
  },
  async createPost(input: {
    id: string
    content: string
    images: string[]
    videoUrl?: string
    visibility: string
    visibleTo: string[]
  }) {
    return apiFetch<{ ok: boolean; post: Post }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
  async deletePost(id: string) {
    return apiFetch<{ ok: boolean }>(`/api/posts/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  async likePost(id: string) {
    return apiFetch<{ ok: boolean; likes: number; liked: boolean }>(
      `/api/posts/${encodeURIComponent(id)}/like`,
      { method: 'POST', body: '{}' },
    )
  },
  async commentPost(id: string, content: string) {
    return apiFetch<{ ok: boolean; comment: Post['comments'][number] }>(
      `/api/posts/${encodeURIComponent(id)}/comments`,
      { method: 'POST', body: JSON.stringify({ content }) },
    )
  },
  async createConversation(id: string, counselorId: string) {
    return apiFetch<{ ok: boolean; id: string }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ id, counselorId }),
    })
  },
  async sendMessage(conversationId: string, content: string, messageId: string, counselorId?: string) {
    return apiFetch<{ ok: boolean; message: { id: string; createdAt: string } }>(
      `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ content, messageId, counselorId }),
      },
    )
  },
  async markConversationRead(conversationId: string) {
    return apiFetch<{ ok: boolean }>(
      `/api/conversations/${encodeURIComponent(conversationId)}/read`,
      { method: 'POST', body: '{}' },
    )
  },
  async createBooking(input: {
    counselorId: string
    date: string
    time: string
    format: string
    usedVoucher: boolean
  }) {
    return apiFetch<{ ok: boolean; booking: Booking }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
  async cancelBooking(id: string) {
    return apiFetch<{ ok: boolean }>(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      body: '{}',
    })
  },
  async counselorLogin(phone: string, password: string) {
    return apiFetch<{ ok: boolean }>('/api/counselor/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    })
  },
  async counselorRegister(input: {
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
  }) {
    const form = new FormData()
    form.append('name', input.name)
    form.append('phone', input.phone)
    form.append('password', input.password)
    form.append('gender', input.gender)
    form.append('province', input.region.province)
    form.append('city', input.region.city)
    form.append('district', input.region.district)
    form.append('years', String(input.years))
    form.append('institution', input.institution)
    form.append('specialties', JSON.stringify(input.specialties))
    form.append('bio', input.bio)
    form.append('certificateType', input.certificateType)
    form.append('licenseNumber', input.licenseNumber)
    form.append('issuingAuthority', input.issuingAuthority)
    const blob = await (await fetch(input.certificateImage)).blob()
    const extension = blob.type.split('/')[1] || 'jpg'
    form.append('certificate', blob, `certificate.${extension}`)
    return apiFetch<{ ok: boolean }>('/api/counselor/register', {
      method: 'POST',
      body: form,
    })
  },
  async counselorLogout() {
    return apiFetch<{ ok: boolean }>('/api/counselor/logout', { method: 'POST', body: '{}' })
  },
}

export async function checkServer() {
  return apiFetch<{ ok: boolean }>('/api/health')
}

export type { Counselor }
