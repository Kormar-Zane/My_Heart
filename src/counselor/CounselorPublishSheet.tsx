import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Globe2,
  ImagePlus,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useStore } from '../store'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { cn, compressImage } from '../utils'

const presetImages = [
  { key: 'window', label: '窗边' },
  { key: 'desk', label: '书桌' },
  { key: 'flowers', label: '花' },
  { key: 'sea', label: '海' },
]

export function CounselorPublishSheet({
  onClose,
  onPublished,
}: {
  onClose: () => void
  onPublished: () => void
}) {
  const { currentCounselorAccount, createCounselorPost, showToast } = useStore()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  if (!currentCounselorAccount) return null

  const upload = async (files: FileList | null) => {
    if (!files) return
    const selected = Array.from(files).slice(0, 3 - images.length)
    if (!selected.length) return
    setUploading(true)
    setError('')
    try {
      const compressed = await Promise.all(selected.map((file) => compressImage(file, 1100, 0.75)))
      setImages((prev) => [...prev, ...compressed].slice(0, 3))
    } catch {
      setError('图片处理失败，请换一张试试')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const publish = () => {
    if (!content.trim() && images.length === 0) {
      setError('写点什么，或配一张图片吧')
      return
    }
    createCounselorPost(content, images)
    showToast('日常已发布到用户端广场')
    onClose()
    onPublished()
  }

  return createPortal(
    <div className="ca-publish-overlay">
      <div className="ca-publish-panel">
        <header className="ca-publish-header">
          <button onClick={onClose} aria-label="关闭">
            <X size={21} />
          </button>
          <div>
            <span>CONSULTANT NOTE</span>
            <h2>分享一段日常</h2>
          </div>
          <button className="ca-publish-submit" onClick={publish}>
            发布
          </button>
        </header>

        <div className="ca-publish-scroll">
          <div className="ca-publish-author">
            <Avatar variant={currentCounselorAccount.avatar} name={currentCounselorAccount.name} size={44} />
            <div>
              <strong>{currentCounselorAccount.name}</strong>
              <span>
                <ShieldCheck size={11} />
                认证心理咨询师
              </span>
            </div>
            <span className="ca-publish-visibility">
              <Globe2 size={12} />
              公开 · 所有用户可见
            </span>
          </div>

          <textarea
            className="ca-publish-textarea"
            value={content}
            onChange={(event) => {
              setContent(event.target.value.slice(0, 500))
              setError('')
            }}
            rows={6}
            placeholder="写一段想对来访者说的话，或记录今天的一个专业瞬间…"
          />
          <div className="ca-publish-count">{content.length} / 500</div>

          <div className="ca-publish-note">
            <Sparkles size={13} />
            <p>你的分享会以「认证咨询师」身份出现在用户端广场。请遵守职业伦理，不暴露来访者隐私。</p>
          </div>

          <div className="ca-publish-media">
            <div className="ca-publish-media-head">
              <span>
                <ImagePlus size={15} />
                配图
              </span>
              <small>{images.length} / 3</small>
            </div>
            <div className="ca-publish-image-grid">
              {images.map((image, index) => (
                <div className="ca-publish-image" key={`${image.slice(0, 24)}-${index}`}>
                  {image.startsWith('data:') ? <img src={image} alt={`配图 ${index + 1}`} /> : <Artwork variant={image.slice(4)} />}
                  <button onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}>
                    <X size={13} />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button className="ca-publish-add" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <span className="tiny-spinner" /> : <Plus size={22} />}
                  <span>{uploading ? '处理中' : '添加图片'}</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(event) => upload(event.target.files)} />
            <p className="ca-publish-preset-label">或选择一张观心插画</p>
            <div className="ca-publish-presets">
              {presetImages.map((preset) => {
                const value = `art:${preset.key}`
                const selected = images.includes(value)
                return (
                  <button
                    key={preset.key}
                    className={cn(selected && 'is-active')}
                    onClick={() =>
                      setImages((prev) =>
                        prev.includes(value) ? prev.filter((item) => item !== value) : prev.length >= 3 ? prev : [...prev, value],
                      )
                    }
                  >
                    <Artwork variant={preset.key} />
                    <span>{preset.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="ca-form-error">{error}</p>}
        </div>

        <footer className="ca-publish-footer">
          <span>
            <Globe2 size={13} />
            发布到用户端广场
          </span>
          <button onClick={publish}>发布</button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
