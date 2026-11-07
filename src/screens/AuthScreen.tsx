import { useState } from 'react'
import { ArrowRight, BadgeCheck, Eye, EyeOff, LockKeyhole, Phone, UserRound } from 'lucide-react'
import { useStore } from '../store'
import { BrandMark } from '../components/BrandMark'
import { Button } from '../components/UI'
import { cn } from '../utils'

type Mode = 'login' | 'register'

export function AuthScreen({ onOpenCounselor }: { onOpenCounselor?: () => void }) {
  const { login, register, serverMode, serverChecked } = useStore()
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [account, setAccount] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setShowPassword(false)
  }

  const handleSubmit = async () => {
    setError('')
    if (!serverChecked) {
      setError('正在连接服务，请稍候')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'login') {
        if (!account.trim()) {
          setError('请输入手机号')
          return
        }
        if (!password) {
          setError('请输入密码')
          return
        }
        const result = await login(account, password)
        if (!result.ok) setError(result.message ?? '登录失败')
      } else {
        if (!nickname.trim()) {
          setError('给自己起一个昵称吧')
          return
        }
        if (!/^1\d{10}$/.test(phone)) {
          setError('请输入 11 位手机号')
          return
        }
        if (password.length < 6) {
          setError('密码至少需要 6 位')
          return
        }
        if (password !== confirm) {
          setError('两次输入的密码不一致')
          return
        }
        const result = await register({ phone, password, nickname })
        if (!result.ok) setError(result.message ?? '注册失败')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-grain" />
      <div className="auth-content">
        <header className="auth-brandbar">
          <div className="auth-brand">
            <BrandMark size={38} />
            <div>
              <strong>观心</strong>
              <span>GUANXIN</span>
            </div>
          </div>
          <span className="auth-beta">{serverMode ? '真实服务 · 已连接' : serverChecked ? '本地模式' : '连接中…'}</span>
        </header>

        <section className="auth-hero">
          <div className="auth-orbit auth-orbit-1" />
          <div className="auth-orbit auth-orbit-2" />
          <div className="auth-sun" />
          <div className="auth-floating-card auth-floating-card-1">
            <span>🌿</span>
            <div>
              <strong>今日心情</strong>
              <small>平静，就很好</small>
            </div>
          </div>
          <div className="auth-floating-card auth-floating-card-2">
            <span>🌸</span>
            <div>
              <strong>+3 小红花</strong>
              <small>完成一次呼吸练习</small>
            </div>
          </div>
          <div className="auth-hero-copy">
            <p className="auth-eyebrow">
              <span />
              给心一个停靠的地方
            </p>
            <h1>
              看见情绪，
              <br />
              <em>也看见自己。</em>
            </h1>
            <p className="auth-sub">咨询、解压、分享，和一个愿意听你说话的空间。慢一点，也没关系。</p>
          </div>
          <div className="auth-badges">
            <span>🌱 温柔陪伴</span>
            <span>🫧 匿名解压</span>
            <span>✦ 专业咨询</span>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel-handle" />
          <div className="auth-tabs" role="tablist">
            <button className={cn('auth-tab', mode === 'login' && 'is-active')} onClick={() => switchMode('login')}>
              登录
            </button>
            <button className={cn('auth-tab', mode === 'register' && 'is-active')} onClick={() => switchMode('register')}>
              注册
            </button>
          </div>
          <div className="auth-form-heading">
            <h2>{mode === 'login' ? '欢迎回来' : '创建你的观心账号'}</h2>
            <p>{mode === 'login' ? '今天，也给自己留一点空间。' : '不需要验证码，一分钟就能开始。'}</p>
          </div>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            {mode === 'register' ? (
              <>
                <label className="field">
                  <span className="field-label">昵称</span>
                  <div className="field-control">
                    <UserRound size={18} />
                    <input
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value)
                        setError('')
                      }}
                      placeholder="想让我们怎么称呼你？"
                      maxLength={16}
                      autoComplete="nickname"
                    />
                  </div>
                </label>
                <label className="field">
                  <span className="field-label">手机号</span>
                  <div className="field-control">
                    <Phone size={18} />
                    <input
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))
                        setError('')
                      }}
                      placeholder="用于登录，测试阶段不会发送验证码"
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                  </div>
                </label>
              </>
            ) : (
              <label className="field">
                <span className="field-label">手机号</span>
                <div className="field-control">
                  <Phone size={18} />
                  <input
                    value={account}
                    onChange={(e) => {
                      setAccount(e.target.value.replace(/\D/g, '').slice(0, 11))
                      setError('')
                    }}
                    placeholder="注册时使用的手机号"
                    inputMode="numeric"
                    autoComplete="username"
                  />
                </div>
              </label>
            )}

            <label className="field">
              <span className="field-label">密码</span>
              <div className="field-control">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder={mode === 'register' ? '至少 6 位，简单好记就好' : '输入你的密码'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="field-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {mode === 'register' && (
              <label className="field">
                <span className="field-label">确认密码</span>
                <div className="field-control">
                  <LockKeyhole size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value)
                      setError('')
                    }}
                    placeholder="再输入一次密码"
                    autoComplete="new-password"
                  />
                </div>
              </label>
            )}

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" full disabled={submitting || !serverChecked} className="auth-submit">
              {submitting ? (
                <span className="btn-loading">
                  <span />
                  <span />
                  <span />
                </span>
              ) : mode === 'login' ? (
                '进入观心'
              ) : (
                '创建账号'
              )}
            </Button>
          </form>

          {onOpenCounselor && (
            <button className="auth-role-switch" onClick={onOpenCounselor}>
              <span className="auth-role-icon">
                <BadgeCheck size={17} />
              </span>
              <span>
                <strong>我是认证心理咨询师</strong>
                <small>进入咨询师专用端</small>
              </span>
              <ArrowRight size={16} />
            </button>
          )}

          <p className="auth-legal">
            继续即表示你同意《用户协议》与《隐私说明》。{serverMode ? '账号密码由服务端加密存储，内容会同步到已连接的数据库。' : '当前为本地模式，账号与内容仅保存在本机。'}
          </p>
          <p className="auth-care">观心提供心理支持与陪伴，不替代医疗诊断与治疗。</p>
        </section>
      </div>
    </div>
  )
}
