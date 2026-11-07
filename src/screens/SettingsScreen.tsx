import { useState } from 'react'
import { AlertTriangle, BadgeCheck, ChevronRight, LogOut, RotateCcw, ShieldCheck, Smartphone, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { BrandMark } from '../components/BrandMark'
import { Button, Modal, TopBar } from '../components/UI'
import { cn } from '../utils'

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button className={cn('settings-toggle', value && 'is-on')} onClick={onChange} aria-label="切换设置">
      <span />
    </button>
  )
}

export function SettingsScreen() {
  const { currentUser, logout, resetDemo, showToast, serverMode, serverChecked } = useStore()
  const nav = useNav()
  const [notifications, setNotifications] = useState({ live: true, booking: true, square: false })
  const [resetOpen, setResetOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  if (!currentUser) return null

  const maskedPhone = currentUser.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')

  return (
    <div className="page settings-page">
      <TopBar title="设置" back />

      <section className="settings-account" onClick={() => nav.navigate({ name: 'edit-profile' })}>
        <Avatar variant={currentUser.avatar} name={currentUser.nickname} size={58} frame={currentUser.equippedFrame} />
        <div>
          <strong>{currentUser.nickname}</strong>
          <p>
            <Smartphone size={12} />
            {maskedPhone}
          </p>
        </div>
        <span className="settings-account-edit">
          编辑资料
          <ChevronRight size={14} />
        </span>
      </section>

      <section className="settings-group">
        <h2>通知</h2>
        <div className="settings-row">
          <div>
            <strong>直播开播提醒</strong>
            <p>关注的咨询师开播时提醒我</p>
          </div>
          <Toggle
            value={notifications.live}
            onChange={() => setNotifications((v) => ({ ...v, live: !v.live }))}
          />
        </div>
        <div className="settings-row">
          <div>
            <strong>预约提醒</strong>
            <p>咨询开始前 10 分钟提醒我</p>
          </div>
          <Toggle
            value={notifications.booking}
            onChange={() => setNotifications((v) => ({ ...v, booking: !v.booking }))}
          />
        </div>
        <div className="settings-row">
          <div>
            <strong>广场互动</strong>
            <p>有人喜欢或评论我的日常时提醒我</p>
          </div>
          <Toggle
            value={notifications.square}
            onChange={() => setNotifications((v) => ({ ...v, square: !v.square }))}
          />
        </div>
      </section>

      <section className="settings-group">
        <h2>隐私与安全</h2>
        <button className="settings-link" onClick={() => showToast('隐私设置将在正式版开放', 'info')}>
          <span>
            <ShieldCheck size={17} />
            隐私与安全中心
          </span>
          <ChevronRight size={15} />
        </button>
        <button className="settings-link" onClick={() => showToast('账号安全设置将在接入服务端后开放', 'info')}>
          <span>
            <Smartphone size={17} />
            账号与登录方式
          </span>
          <ChevronRight size={15} />
        </button>
        <button className="settings-link" onClick={() => showToast('客服邮箱：care@guanxin.demo', 'info')}>
          <span>
            <Sparkles size={17} />
            联系观心小助手
          </span>
          <ChevronRight size={15} />
        </button>
      </section>

      <section className="settings-group">
        <h2>服务连接</h2>
        <button
          className="settings-link"
          onClick={() =>
            showToast(
              serverMode
                ? '已连接真实后端：JWT 会话、SQLite 数据、WebSocket 聊天'
                : '未连接后端，当前使用本地模式。运行 npm run dev:full 启动真实服务',
              'info',
            )
          }
        >
          <span>
            <ShieldCheck size={17} />
            数据服务
          </span>
          <span className="settings-version">
            {serverMode ? '真实后端已连接' : serverChecked ? '本地模式' : '连接中…'}
          </span>
          <ChevronRight size={15} />
        </button>
      </section>

      <section className="settings-group">
        <h2>咨询师</h2>
        <button
          className="settings-link"
          onClick={() => {
            window.location.hash = 'counselor'
          }}
        >
          <span>
            <BadgeCheck size={17} />
            咨询师专用端
          </span>
          <span className="settings-version">认证后进入</span>
          <ChevronRight size={15} />
        </button>
      </section>

      <section className="settings-group">
        <h2>关于</h2>
        <button className="settings-link" onClick={() => showToast('观心用户端 v1.2 · 内测版本', 'info')}>
          <span>版本信息</span>
          <span className="settings-version">v1.2.0 内测</span>
        </button>
        <button className="settings-link" onClick={() => showToast('用户协议为演示占位内容', 'info')}>
          <span>用户协议</span>
          <ChevronRight size={15} />
        </button>
        <button className="settings-link" onClick={() => showToast('隐私说明为演示占位内容', 'info')}>
          <span>隐私说明</span>
          <ChevronRight size={15} />
        </button>
      </section>

      <section className="settings-about-card">
        <BrandMark size={38} />
        <div>
          <strong>观心 · 看见情绪，也看见自己</strong>
          <p>一个温柔的心理陪伴空间。咨询师专用端已上线，认证咨询师可从设置或登录页进入。</p>
        </div>
      </section>

      <section className="settings-group danger-group">
        <h2>演示工具</h2>
        <button className="settings-link" onClick={() => setResetOpen(true)}>
          <span>
            <RotateCcw size={17} />
            {serverMode ? '清理本地缓存' : '重置演示数据'}
          </span>
          <ChevronRight size={15} />
        </button>
        <button className="settings-link danger" onClick={() => setLogoutOpen(true)}>
          <span>
            <LogOut size={17} />
            退出登录
          </span>
          <ChevronRight size={15} />
        </button>
      </section>

      <p className="settings-footer-note">
        观心提供心理支持与陪伴，不替代医疗诊断与治疗。
        <br />
        如果你正处于紧急危机中，请优先联系当地急救或心理援助热线。
      </p>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} className="confirm-modal">
        <div className="confirm-icon warning">
          <AlertTriangle size={27} />
        </div>
        <p className="success-eyebrow">重置演示</p>
        <h2>要清除本机所有演示数据吗？</h2>
        <p className="success-sub">你发布的日常、预约、小红花和账号都会被清空，并回到登录页。此操作无法撤销。</p>
        <div className="cancel-actions">
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            再想想
          </Button>
          <Button
            onClick={() => {
              setResetOpen(false)
              resetDemo()
            }}
          >
            确认重置
          </Button>
        </div>
      </Modal>

      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} className="confirm-modal">
        <div className="confirm-icon">
          <LogOut size={26} />
        </div>
        <p className="success-eyebrow">退出登录</p>
        <h2>要暂时离开观心吗？</h2>
        <p className="success-sub">本机数据会保留，下次登录还能看到你的日常和预约。</p>
        <div className="cancel-actions">
          <Button variant="secondary" onClick={() => setLogoutOpen(false)}>
            留下来
          </Button>
          <Button
            onClick={() => {
              setLogoutOpen(false)
              logout()
            }}
          >
            退出登录
          </Button>
        </div>
      </Modal>
    </div>
  )
}
