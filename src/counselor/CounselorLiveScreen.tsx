import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  ChevronRight,
  Clock3,
  Eye,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from 'lucide-react'
import { useStore } from '../store'
import { useCounselorNav } from './navigation'
import { Avatar } from '../components/Avatar'
import { Artwork } from '../components/Artwork'
import { Button, Tag } from '../components/UI'
import { formatClock, formatDateCN } from '../utils'

export function CounselorLiveScreen() {
  const { state, currentCounselorAccount, currentCounselorProfile } = useStore()
  const nav = useCounselorNav()
  if (!currentCounselorAccount) return null
  const account = currentCounselorAccount
  const activeLive = state.lives.find(
    (live) => live.hostId === account.counselorId && live.status === 'live',
  )
  const today = new Date()
  const dateText = `${today.getMonth() + 1}月${today.getDate()}日 · ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][today.getDay()]}`

  return (
    <div className="page ca-page ca-live-page">
      <header className="ca-live-header">
        <div>
          <span className="ca-home-brand">
            <span className="ca-brand-dot" />
            观心 · 咨询师端
          </span>
          <h1>我的直播</h1>
          <p>{dateText} · 让一段真实的分享，被更多人听见。</p>
        </div>
        {!activeLive && (
          <button className="ca-live-start-top" onClick={() => nav.navigate({ name: 'live-setup' })}>
            <Video size={16} />
            开播
          </button>
        )}
      </header>

      {activeLive ? (
        <section className="ca-live-feature">
          <div className="ca-live-feature-art">
            <Artwork variant={activeLive.art} />
            <span className="ca-live-badge">
              <span className="live-dot" /> 正在直播
            </span>
            <span className="ca-live-viewers">
              <Eye size={12} />
              {activeLive.viewers}
            </span>
          </div>
          <div className="ca-live-feature-body">
            <div className="ca-live-feature-host">
              <Avatar variant={account.avatar} name={account.name} size={38} online />
              <div>
                <strong>{account.name}</strong>
                <span>已开播 {formatClock(activeLive.startsAt)}</span>
              </div>
              <Tag tone="gold">免费公开</Tag>
            </div>
            <h2>{activeLive.title}</h2>
            <p>{activeLive.description}</p>
            <div className="ca-live-feature-stats">
              <span>
                <Users size={12} />
                {activeLive.viewers} 人正在听
              </span>
              <span>
                <Radio size={12} />
                {activeLive.chat.length} 条互动
              </span>
            </div>
            <div className="ca-live-feature-actions">
              <Button variant="secondary" size="sm" onClick={() => nav.navigate({ name: 'live-room', id: activeLive.id })}>
                查看数据
              </Button>
              <Button size="sm" onClick={() => nav.navigate({ name: 'live-room', id: activeLive.id })}>
                进入直播控制台
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="ca-live-empty-hero">
          <div className="ca-live-empty-art">
            <Artwork variant="live" />
          </div>
          <div className="ca-live-empty-copy">
            <span className="ca-eyebrow">
              <Radio size={13} />
              免费直播
            </span>
            <h2>
              把专业，
              <br />
              变成一次真实的相遇。
            </h2>
            <p>用户端「免费直播」版块会展示你的直播间。分享知识、回应问题，或只是陪大家坐一会儿。</p>
            <Button size="md" onClick={() => nav.navigate({ name: 'live-setup' })}>
              <Video size={16} />
              开启一场直播
            </Button>
          </div>
          <span className="ca-live-empty-orbit" />
        </section>
      )}

      <section className="ca-live-stats">
        <div>
          <span className="ca-live-stat-icon">
            <Radio size={17} />
          </span>
          <strong>{activeLive ? 1 : 0}</strong>
          <small>今日直播场次</small>
        </div>
        <div>
          <span className="ca-live-stat-icon">
            <Eye size={17} />
          </span>
          <strong>{activeLive?.viewers ?? 0}</strong>
          <small>当前观看人数</small>
        </div>
        <div>
          <span className="ca-live-stat-icon">
            <Users size={17} />
          </span>
          <strong>{currentCounselorProfile?.followers ?? 0}</strong>
          <small>关注你的用户</small>
        </div>
      </section>

      <section className="ca-live-guide">
        <div className="ca-section-head">
          <div>
            <h2>开播准备</h2>
            <p>让每一次出现，都对来访者负责</p>
          </div>
          <ShieldCheck size={18} />
        </div>
        <div className="ca-live-guide-list">
          <div>
            <span>01</span>
            <div>
              <strong>确认一个清晰的主题</strong>
              <p>例如「如何与焦虑相处」「关系里的边界感」</p>
            </div>
          </div>
          <div>
            <span>02</span>
            <div>
              <strong>保护来访者隐私</strong>
              <p>直播中不讨论可识别个人身份的信息，不替代个体咨询</p>
            </div>
          </div>
          <div>
            <span>03</span>
            <div>
              <strong>留一点时间回应</strong>
              <p>文字互动不收费，VIP 用户可以申请连麦</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ca-live-coming">
        <div className="ca-section-head">
          <div>
            <h2>直播回看与数据</h2>
            <p>本场内测暂不提供回放</p>
          </div>
          <CalendarClock size={17} />
        </div>
        <div className="ca-live-coming-body">
          <Clock3 size={19} />
          <p>结束直播后，系统会生成本场的小结。真实推流与回放将在正式版接入。</p>
        </div>
      </section>

      <div className="ca-page-note">
        <Sparkles size={13} />
        直播为演示场景，当前不会采集真实音视频；你可以在用户端看到新增的直播间。
      </div>
    </div>
  )
}
