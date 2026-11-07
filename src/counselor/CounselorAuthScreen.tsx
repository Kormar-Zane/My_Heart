import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  FileCheck2,
  LockKeyhole,
  MessageCircle,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react'
import { useStore } from '../store'
import { BrandMark } from '../components/BrandMark'
import { Avatar } from '../components/Avatar'
import { Button, RegionSheet } from '../components/UI'
import type { Region } from '../types'
import { cn, compressImage, regionFullLabel } from '../utils'

const certificateTypes = ['国家二级心理咨询师', '注册心理师', '精神科医师', '其他心理专业资质']
const specialtyOptions = ['情绪压力', '亲密关系', '焦虑抑郁', '睡眠困扰', '家庭沟通', '职业发展', '自我成长', '艺术疗愈']

type Mode = 'login' | 'apply'

export function CounselorAuthScreen({ onExit }: { onExit: () => void }) {
  const { loginCounselor, loginDemoCounselor } = useStore()
  const [mode, setMode] = useState<Mode>('login')

  return (
    <div className="ca-auth-screen">
      <div className="ca-auth-glow" />
      <div className="ca-auth-scroll">
        <header className="ca-auth-header">
          <div className="ca-auth-brand">
            <BrandMark size={38} />
            <div>
              <strong>观心</strong>
              <span>咨询师专用端 · COUNSELOR</span>
            </div>
          </div>
          <button className="ca-auth-exit" onClick={onExit}>
            <ArrowLeft size={13} />
            用户端
          </button>
        </header>

        <section className="ca-auth-hero">
          <span className="ca-auth-eyebrow">
            <span />
            PROFESSIONAL SPACE
          </span>
          <h1>
            让专业被看见，
            <br />
            <em>让陪伴更从容。</em>
          </h1>
          <p>认证咨询师的专属工作空间。开直播、回复来访者、分享日常，把更多精力留给真正的陪伴。</p>
          <div className="ca-auth-features">
            <span>
              <ShieldCheck size={13} /> 资质认证
            </span>
            <span>
              <Radio size={13} /> 免费直播
            </span>
            <span>
              <MessageCircle size={13} /> 来访者沟通
            </span>
          </div>
        </section>

        <section className="ca-auth-panel">
          <div className="ca-auth-tabs">
            <button className={cn(mode === 'login' && 'is-active')} onClick={() => setMode('login')}>
              咨询师登录
            </button>
            <button className={cn(mode === 'apply' && 'is-active')} onClick={() => setMode('apply')}>
              认证入驻
            </button>
          </div>

          {mode === 'login' ? (
            <CounselorLogin onDemo={() => loginDemoCounselor()} onApply={() => setMode('apply')} login={loginCounselor} />
          ) : (
            <CounselorApply />
          )}
        </section>

        <footer className="ca-auth-footer">
          <ShieldCheck size={13} />
          咨询师端仅向通过资质认证的专业人士开放。测试阶段认证流程与证件信息仅保存在本机。
        </footer>
      </div>
    </div>
  )
}

function CounselorLogin({
  login,
  onDemo,
  onApply,
}: {
  login: (account: string, password: string) => { ok: boolean; message?: string }
  onDemo: () => void
  onApply: () => void
}) {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = () => {
    if (!account.trim() || !password) {
      setError('请输入咨询师账号和密码')
      return
    }
    const result = login(account, password)
    if (!result.ok) setError(result.message ?? '登录失败')
  }

  return (
    <div className="ca-login">
      <div className="ca-panel-heading">
        <span className="ca-panel-icon">
          <BadgeCheck size={20} />
        </span>
        <div>
          <h2>欢迎回到工作台</h2>
          <p>今天也请照顾好自己，再去照顾别人。</p>
        </div>
      </div>

      <form
        className="ca-auth-form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <label className="ca-field">
          <span>手机号 / 姓名</span>
          <div className="ca-field-control">
            <Phone size={17} />
            <input
              value={account}
              onChange={(event) => {
                setAccount(event.target.value)
                setError('')
              }}
              placeholder="输入咨询师手机号"
              autoComplete="username"
            />
          </div>
        </label>
        <label className="ca-field">
          <span>密码</span>
          <div className="ca-field-control">
            <LockKeyhole size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError('')
              }}
              placeholder="输入登录密码"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="显示或隐藏密码">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>
        {error && <p className="ca-form-error">{error}</p>}
        <Button type="submit" full size="lg">
          进入咨询师工作台
          <ArrowRight size={16} />
        </Button>
      </form>

      <div className="ca-login-divider">
        <span>或</span>
      </div>

      <button className="ca-demo-login" onClick={onDemo}>
        <Sparkles size={15} />
        一键体验 · 林知夏咨询师
      </button>
      <p className="ca-demo-hint">体验账号 13900000001 / 密码 123456</p>

      <button className="ca-apply-link" onClick={onApply}>
        还没有咨询师账号？
        <strong>提交资质认证入驻</strong>
        <ArrowRight size={14} />
      </button>

      <div className="ca-login-safety">
        <ShieldCheck size={14} />
        <span>平台不会向咨询师索要来访者隐私；请在专业伦理范围内使用工作台。</span>
      </div>
    </div>
  )
}

function CounselorApply() {
  const { registerCounselor, showToast } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState<'女' | '男'>('女')
  const [region, setRegion] = useState<Region>({ province: '浙江省', city: '杭州', district: '西湖区' })
  const [regionOpen, setRegionOpen] = useState(false)
  const [certificateType, setCertificateType] = useState(certificateTypes[0])
  const [licenseNumber, setLicenseNumber] = useState('')
  const [issuingAuthority, setIssuingAuthority] = useState('')
  const [years, setYears] = useState(5)
  const [institution, setInstitution] = useState('')
  const [specialties, setSpecialties] = useState<string[]>(['情绪压力'])
  const [bio, setBio] = useState('')
  const [certificateImage, setCertificateImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const applyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (step === 0) return
    applyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  const toggleSpecialty = (item: string) => {
    setSpecialties((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : prev.length >= 3 ? prev : [...prev, item],
    )
  }

  const next = () => {
    setError('')
    if (step === 0) {
      if (!name.trim()) return setError('请填写真实姓名')
      if (!/^1\d{10}$/.test(phone)) return setError('请输入 11 位手机号')
      if (password.length < 6) return setError('密码至少需要 6 位')
      setStep(1)
      return
    }
    if (step === 1) {
      if (!licenseNumber.trim()) return setError('请填写咨询师证件编号')
      if (!issuingAuthority.trim()) return setError('请填写发证机构')
      if (!institution.trim()) return setError('请填写所在机构或“独立执业”')
      if (specialties.length === 0) return setError('请至少选择一个擅长方向')
      setStep(2)
      return
    }
    if (!certificateImage) return setError('请上传咨询师证件照片')
    if (!agreed) return setError('请确认资料真实性与职业伦理承诺')
    const result = registerCounselor({
      name,
      phone,
      password,
      gender,
      region,
      years,
      institution,
      specialties,
      bio,
      certificateType,
      licenseNumber,
      issuingAuthority,
      certificateImage,
    })
    if (!result.ok) {
      setError(result.message ?? '提交失败')
      return
    }
    showToast('认证资料已提交，等待平台审核')
  }

  const upload = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const image = await compressImage(file, 1200, 0.8)
      setCertificateImage(image)
    } catch {
      setError('证件图片处理失败，请换一张图片')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="ca-apply" ref={applyRef}>
      <div className="ca-apply-progress">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn(i <= step && 'is-done')} />
        ))}
      </div>
      <div className="ca-apply-head">
        <span className="ca-apply-step">STEP 0{step + 1} / 03</span>
        <h2>{step === 0 ? '先创建你的咨询师账号' : step === 1 ? '填写你的专业资质' : '上传证件，完成认证'}</h2>
        <p>
          {step === 0
            ? '我们只展示你的公开姓名和专业信息，手机号不会公开。'
            : step === 1
              ? '这些信息将用于资质审核，以及用户端的咨询师主页展示。'
              : '请上传清晰、完整的证件照片。测试阶段的图片不会上传到服务器。'}
        </p>
      </div>

      {step === 0 && (
        <div className="ca-apply-fields">
          <label className="ca-field">
            <span>真实姓名</span>
            <div className="ca-field-control">
              <UserRound size={17} />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="证件上的姓名" />
            </div>
          </label>
          <label className="ca-field">
            <span>手机号</span>
            <div className="ca-field-control">
              <Phone size={17} />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="用于登录咨询师端"
                inputMode="numeric"
              />
            </div>
          </label>
          <label className="ca-field">
            <span>设置密码</span>
            <div className="ca-field-control">
              <LockKeyhole size={17} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                autoComplete="new-password"
              />
            </div>
          </label>
          <div className="ca-field">
            <span>性别</span>
            <div className="ca-gender-row">
              {(['女', '男'] as const).map((g) => (
                <button
                  key={g}
                  className={cn(gender === g && 'is-active')}
                  onClick={() => setGender(g)}
                  type="button"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="ca-apply-fields">
          <div className="ca-field">
            <span>证件类型</span>
            <div className="ca-cert-type-grid">
              {certificateTypes.map((type) => (
                <button
                  key={type}
                  className={cn(certificateType === type && 'is-active')}
                  onClick={() => setCertificateType(type)}
                  type="button"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <label className="ca-field">
            <span>咨询师证件编号</span>
            <div className="ca-field-control">
              <FileCheck2 size={17} />
              <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="请输入证书编号" />
            </div>
          </label>
          <label className="ca-field">
            <span>发证机构</span>
            <div className="ca-field-control">
              <BadgeCheck size={17} />
              <input value={issuingAuthority} onChange={(e) => setIssuingAuthority(e.target.value)} placeholder="例如：浙江省心理卫生协会" />
            </div>
          </label>
          <div className="ca-inline-fields">
            <label className="ca-field">
              <span>从业年限</span>
              <div className="ca-number-control">
                <button type="button" onClick={() => setYears(Math.max(0, years - 1))}>−</button>
                <strong>{years}</strong>
                <span>年</span>
                <button type="button" onClick={() => setYears(Math.min(40, years + 1))}>＋</button>
              </div>
            </label>
            <label className="ca-field">
              <span>所在机构</span>
              <div className="ca-field-control">
                <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="独立执业 / 机构名" />
              </div>
            </label>
          </div>
          <button className="ca-region-field" type="button" onClick={() => setRegionOpen(true)}>
            <span>
              <small>执业地区</small>
              <strong>{regionFullLabel(region)}</strong>
            </span>
            <ChevronRightIcon />
          </button>
          <div className="ca-field">
            <span>擅长方向（最多 3 个）</span>
            <div className="ca-specialty-grid">
              {specialtyOptions.map((item) => (
                <button
                  key={item}
                  className={cn(specialties.includes(item) && 'is-active')}
                  onClick={() => toggleSpecialty(item)}
                  type="button"
                >
                  {item}
                  {specialties.includes(item) && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ca-apply-fields">
          <div className="ca-field">
            <span>咨询师证件照片</span>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files)} />
            {certificateImage ? (
              <div className="ca-cert-upload-preview">
                <img src={certificateImage} alt="已上传的咨询师证件" />
                <button type="button" onClick={() => setCertificateImage('')}>
                  <X size={15} />
                  重新上传
                </button>
              </div>
            ) : (
              <button className="ca-cert-upload" type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <span className="tiny-spinner" /> : <UploadCloud size={24} />}
                <strong>{uploading ? '正在处理证件…' : '点击上传证件照片'}</strong>
                <small>请上传包含姓名、证件编号和发证机构的清晰照片</small>
              </button>
            )}
          </div>
          <label className="ca-field">
            <span>给来访者的一段话（选填）</span>
            <div className="ca-field-control ca-textarea-control">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 120))}
                placeholder="例如：我相信每一种情绪都有它想说的话。"
                rows={3}
                maxLength={120}
              />
            </div>
            <small className="ca-field-count">{bio.length} / 120</small>
          </label>
          <label className="ca-agreement">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>我承诺所提交的资质信息真实有效，并遵守心理咨询职业伦理与观心平台规范。</span>
          </label>
          <div className="ca-apply-security">
            <ShieldCheck size={15} />
            测试阶段证件资料仅保存在本机，不会上传服务器；正式版将接入人工审核。
          </div>
        </div>
      )}

      {error && <p className="ca-form-error">{error}</p>}

      <div className="ca-apply-actions">
        {step > 0 ? (
          <button className="ca-apply-back" type="button" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={15} />
            上一步
          </button>
        ) : (
          <span />
        )}
        <Button type="button" size="lg" onClick={next} className="ca-apply-next">
          {step === 2 ? '提交审核' : '继续'}
          <ArrowRight size={16} />
        </Button>
      </div>

      <RegionSheet open={regionOpen} onClose={() => setRegionOpen(false)} value={region} onConfirm={setRegion} />
    </div>
  )
}

function ChevronRightIcon() {
  return <ArrowRight size={16} />
}
