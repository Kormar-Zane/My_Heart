import { useEffect, useRef, useState } from 'react'
import {
  ChevronRight,
  Globe2,
  Hash,
  ImagePlus,
  Lock,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  UserRoundCheck,
  UsersRound,
  Video,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import type { Visibility } from '../types'
import { cn, compressImage } from '../utils'
import { visibilityMeta } from '../components/PostCard'

const artPresets = [
  { key: 'garden', label: '窗边一角' },
  { key: 'flowers', label: '一束花' },
  { key: 'mountain', label: '去山里' },
  { key: 'night', label: '夜色' },
  { key: 'sea', label: '看海' },
  { key: 'desk', label: '书桌' },
]

const privacyOptions: Array<{
  value: Visibility
  label: string
  desc: string
  icon: typeof Globe2
}> = [
  { value: 'public', label: '公开', desc: '广场上的所有人都能看到', icon: Globe2 },
  { value: 'friends', label: '朋友可见', desc: '只有互相成为朋友的人能看到', icon: UsersRound },
  { value: 'partial', label: '部分人可见', desc: '只分享给选中的朋友', icon: UserRoundCheck },
  { value: 'private', label: '仅自己可见', desc: '只留给自己的一页日记', icon: Lock },
]

export function PublishSheet({ onClose }: { onClose: () => void }) {
  const { state, currentUser, createPost, showToast } = useStore()
  const nav = useNav()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>('image')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [visibleTo, setVisibleTo] = useState<string[]>([])
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showPeople, setShowPeople] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const friends = state.users.filter((u) => u.id !== currentUser?.id && currentUser?.friendIds.includes(u.id))
  const otherUsers = state.users.filter(
    (u) => u.id !== currentUser?.id && !currentUser?.friendIds.includes(u.id) && u.id !== 'u_demo',
  )

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const selected = Array.from(files).slice(0, 3 - images.length)
    if (selected.length === 0) {
      showToast('最多添加 3 张图片', 'info')
      return
    }
    setUploading(true)
    setError('')
    try {
      const compressed = await Promise.all(selected.map((file) => compressImage(file)))
      setImages((prev) => [...prev, ...compressed].slice(0, 3))
    } catch {
      setError('图片处理失败，换一张试试')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const togglePerson = (id: string) => {
    setVisibleTo((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const publish = () => {
    if (!content.trim() && images.length === 0 && !videoUrl.trim()) {
      setError('写点什么，或加一张图片吧')
      return
    }
    if (videoUrl && !/^https?:\/\//.test(videoUrl.trim())) {
      setError('请输入以 http:// 或 https:// 开头的视频链接')
      return
    }
    if (visibility === 'partial' && visibleTo.length === 0) {
      setError('请至少选择一位可见的朋友')
      return
    }
    createPost({
      content,
      images: videoUrl ? [] : images,
      videoUrl: videoUrl.trim() || undefined,
      visibility,
      visibleTo: visibility === 'partial' ? visibleTo : [],
    })
    showToast('日常已发布')
    onClose()
    nav.switchTab('square')
  }

  const activePrivacy = privacyOptions.find((p) => p.value === visibility)!
  const PrivacyIcon = activePrivacy.icon
  const canPublish = Boolean(content.trim() || images.length || videoUrl.trim())

  return createPortal(
    <div className="publish-overlay">
      <div className="publish-panel">
        <header className="publish-header">
          <button className="publish-close" onClick={onClose} aria-label="关闭">
            <X size={21} />
          </button>
          <div>
            <h2>发布日常</h2>
            <span>让这一刻，被好好记住</span>
          </div>
          <button className={cn('publish-submit', !canPublish && 'is-disabled')} onClick={publish}>
            发布
          </button>
        </header>

        <div className="publish-scroll">
          <div className="publish-author">
            <Avatar variant={currentUser?.avatar} size={44} frame={currentUser?.equippedFrame} />
            <div>
              <strong>{currentUser?.nickname}</strong>
              <button className="publish-privacy-trigger" onClick={() => setShowPrivacy(true)}>
                <PrivacyIcon size={12} />
                {activePrivacy.label}
                <ChevronRight size={12} />
              </button>
            </div>
            <span className="publish-mood">🌿 此刻在这里</span>
          </div>

          <textarea
            ref={textareaRef}
            className="publish-textarea"
            value={content}
            onChange={(e) => {
              setContent(e.target.value.slice(0, 500))
              setError('')
            }}
            placeholder="今天发生了什么？此刻的心情是什么样的？"
            rows={5}
          />
          <div className="publish-count">{content.length} / 500</div>

          <div className="publish-topics">
            <Hash size={14} />
            {['今日份治愈', '一件小事', '想问问大家'].map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setContent((prev) => `${prev}${prev ? ' ' : ''}#${topic} `)
                  textareaRef.current?.focus()
                }}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="publish-media">
            <div className="publish-media-tabs">
              <button className={mediaTab === 'image' ? 'is-active' : ''} onClick={() => setMediaTab('image')}>
                <ImagePlus size={15} />
                图片
              </button>
              <button className={mediaTab === 'video' ? 'is-active' : ''} onClick={() => setMediaTab('video')}>
                <Video size={15} />
                视频
              </button>
              <span>{mediaTab === 'image' ? `${images.length} / 3` : videoUrl ? '已添加' : '链接'}</span>
            </div>

            {mediaTab === 'image' ? (
              <>
                <div className="publish-image-grid">
                  {images.map((image, index) => (
                    <div className="publish-image-item" key={`${image.slice(0, 30)}-${index}`}>
                      {image.startsWith('data:') ? <img src={image} alt={`待发布图片 ${index + 1}`} /> : <Artwork variant={image.slice(4)} />}
                      <button
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                        aria-label="移除图片"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <button className="publish-add-image" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <span className="tiny-spinner" /> : <Plus size={23} />}
                      <span>{uploading ? '处理中' : '添加照片'}</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="publish-preset-head">
                  <span>没有照片？选一张心情插画</span>
                  <Sparkles size={13} />
                </div>
                <div className="publish-presets">
                  {artPresets.map((preset) => {
                    const image = `art:${preset.key}`
                    const selected = images.includes(image)
                    return (
                      <button
                        key={preset.key}
                        className={cn('publish-preset', selected && 'is-selected')}
                        onClick={() =>
                          setImages((prev) =>
                            prev.includes(image)
                              ? prev.filter((x) => x !== image)
                              : prev.length >= 3
                                ? prev
                                : [...prev, image],
                          )
                        }
                      >
                        <Artwork variant={preset.key} />
                        <span>{preset.label}</span>
                        {selected && <span className="publish-preset-check">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="publish-video-panel">
                <label className="field">
                  <span className="field-label">视频链接</span>
                  <div className="field-control">
                    <Video size={16} />
                    <input
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value)
                        setError('')
                      }}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </label>
                {videoUrl && /^https?:\/\//.test(videoUrl) && (
                  <div className="publish-video-preview">
                    <video src={videoUrl} controls playsInline preload="metadata" />
                  </div>
                )}
                <p className="publish-video-note">演示环境暂不支持直接上传大体积视频，可粘贴一个公开可访问的视频链接。</p>
              </div>
            )}
          </div>

          <button className="publish-location">
            <MapPin size={15} />
            {currentUser?.region.city} · {currentUser?.region.district}
            <span>所在地</span>
          </button>

          <div className="publish-note">
            <Sparkles size={13} />
            请友善表达。你的日常会按可见范围展示，随时可以修改或删除。
          </div>

          {error && <p className="form-error publish-error">{error}</p>}
        </div>

        <footer className="publish-footer">
          <button className="publish-footer-privacy" onClick={() => setShowPrivacy(true)}>
            <PrivacyIcon size={14} />
            {activePrivacy.label}
            {visibility === 'partial' && <span>· 已选 {visibleTo.length} 人</span>}
          </button>
          <button className={cn('publish-submit', !canPublish && 'is-disabled')} onClick={publish}>
            发布
          </button>
        </footer>
      </div>

      {showPrivacy &&
        createPortal(
          <div className="overlay-root">
            <div className="sheet-backdrop" onClick={() => setShowPrivacy(false)} />
            <section className="privacy-sheet">
              <div className="sheet-grab" />
              <div className="privacy-sheet-head">
                <h2>谁可以看到</h2>
                <button onClick={() => setShowPrivacy(false)} aria-label="关闭">
                  <X size={19} />
                </button>
              </div>
              <div className="privacy-options">
                {privacyOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      className={cn('privacy-option', visibility === option.value && 'is-active')}
                      onClick={() => {
                        setVisibility(option.value)
                        setShowPrivacy(false)
                        if (option.value === 'partial' && visibleTo.length === 0) setShowPeople(true)
                      }}
                    >
                      <span className="privacy-option-icon">
                        <Icon size={18} />
                      </span>
                      <div>
                        <strong>{option.label}</strong>
                        <p>{option.desc}</p>
                      </div>
                      <span className="privacy-radio">{visibility === option.value && <span />}</span>
                    </button>
                  )
                })}
              </div>
              {visibility === 'partial' && (
                <button className="privacy-pick-people" onClick={() => { setShowPrivacy(false); setShowPeople(true) }}>
                  <UsersRound size={16} />
                  选择可见的朋友
                  <span>{visibleTo.length} 人</span>
                  <ChevronRight size={15} />
                </button>
              )}
            </section>
          </div>,
          document.body,
        )}

      {showPeople &&
        createPortal(
          <div className="overlay-root">
            <div className="sheet-backdrop" onClick={() => setShowPeople(false)} />
            <section className="privacy-sheet people-sheet">
              <div className="sheet-grab" />
              <div className="privacy-sheet-head">
                <div>
                  <h2>选择可见的朋友</h2>
                  <p>只有选中的人能在广场看到这条日常</p>
                </div>
                <button onClick={() => setShowPeople(false)} aria-label="关闭">
                  <X size={19} />
                </button>
              </div>
              <div className="people-list">
                {friends.length > 0 && <p className="people-group-label">我的朋友</p>}
                {friends.map((person) => (
                  <button
                    key={person.id}
                    className={cn('people-item', visibleTo.includes(person.id) && 'is-selected')}
                    onClick={() => togglePerson(person.id)}
                  >
                    <Avatar variant={person.avatar} name={person.nickname} size={40} />
                    <div>
                      <strong>{person.nickname}</strong>
                      <p>{person.region.city} · {person.bio}</p>
                    </div>
                    <span className="people-check">{visibleTo.includes(person.id) && '✓'}</span>
                  </button>
                ))}
                {otherUsers.length > 0 && <p className="people-group-label">广场伙伴</p>}
                {otherUsers.map((person) => (
                  <button
                    key={person.id}
                    className={cn('people-item', visibleTo.includes(person.id) && 'is-selected')}
                    onClick={() => togglePerson(person.id)}
                  >
                    <Avatar variant={person.avatar} name={person.nickname} size={40} />
                    <div>
                      <strong>{person.nickname}</strong>
                      <p>{person.region.city} · {person.bio}</p>
                    </div>
                    <span className="people-check">{visibleTo.includes(person.id) && '✓'}</span>
                  </button>
                ))}
              </div>
              <button
                className="people-confirm"
                onClick={() => {
                  if (visibleTo.length === 0) {
                    showToast('至少选择一位朋友', 'info')
                    return
                  }
                  setShowPeople(false)
                }}
              >
                完成 · 已选 {visibleTo.length} 人
              </button>
            </section>
          </div>,
          document.body,
        )}
    </div>,
    document.body,
  )
}
