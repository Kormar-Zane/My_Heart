import { useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { useStore } from '../store'
import { BrandMark } from '../components/BrandMark'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/UI'
import { CertificateImage, MaskedLicense } from './components'
import { formatDateCN } from '../utils'

export function CounselorPendingScreen({ onExit }: { onExit: () => void }) {
  const {
    currentCounselorAccount,
    logoutCounselor,
    approveCounselorDemo,
    syncFromServer,
    serverMode,
    showToast,
  } = useStore()
  const [refreshing, setRefreshing] = useState(false)

  if (!currentCounselorAccount) return null
  const account = currentCounselorAccount
  const rejected = account.status === 'rejected'

  const refresh = async () => {
    setRefreshing(true)
    try {
      await syncFromServer()
      showToast('已刷新审核状态', 'info')
    } catch {
      showToast('暂时无法连接服务器', 'error')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="ca-pending-screen">
      <header className="ca-pending-header">
        <div className="ca-auth-brand">
          <BrandMark size={34} />
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

      <main className="ca-pending-main">
        <div className="ca-pending-orbit" />
        <div className="ca-pending-icon">
          <Clock3 size={30} />
        </div>
        <span className="ca-pending-eyebrow">{rejected ? 'REVIEW RETURNED' : 'UNDER REVIEW'}</span>
        <h1>{rejected ? '认证资料需要补充' : '你的资质正在审核中'}</h1>
        <p className="ca-pending-desc">
          {rejected
            ? '本次资料未通过审核。请查看审核意见，准备清晰完整的证件材料后联系平台重新提交。'
            : '已收到你的咨询师认证资料。审核人员会核验证件类型、编号、发证机构与照片是否一致，通过后即可使用全部工作台功能。'}
        </p>

        <div className="ca-pending-profile">
          <Avatar variant={account.avatar} name={account.name} size={52} />
          <div>
            <strong>{account.name}</strong>
            <p>{account.title} · {account.years} 年从业</p>
            <span>{account.credential.issuingAuthority}</span>
          </div>
          <span className={rejected ? 'ca-status-pill is-rejected' : 'ca-status-pill'}>
            {rejected ? <ShieldCheck size={12} /> : <Clock3 size={12} />}
            {rejected ? '需补充' : '待审核'}
          </span>
        </div>

        <div className="ca-pending-timeline">
          <div className="ca-timeline-step is-done">
            <span>✓</span>
            <div>
              <strong>资料已提交</strong>
              <p>{formatDateCN(account.credential.submittedAt)} · {serverMode ? '账号与资质信息已保存到服务端' : '账号与资质信息仅保存在本机'}</p>
            </div>
          </div>
          <div className="ca-timeline-step is-active">
            <span><span className="ca-timeline-pulse" /></span>
            <div>
              <strong>{rejected ? '等待补充资料' : '平台人工审核'}</strong>
              <p>{rejected ? '请根据审核意见更新证件后重新申请' : '预计 1–2 个工作日 · 管理员登录审核后台完成'}</p>
            </div>
          </div>
          <div className="ca-timeline-step">
            <span>3</span>
            <div>
              <strong>解锁咨询师工作台</strong>
              <p>开启直播、与来访者沟通、分享专业日常</p>
            </div>
          </div>
        </div>

        <div className="ca-pending-certificate">
          <div className="ca-pending-cert-head">
            <span>
              <FileCheck2 size={15} />
              已提交资质
            </span>
            <span>仅审核人员可见</span>
          </div>
          <div className="ca-pending-cert-body">
            <CertificateImage src={account.credential.certificateImage} />
            <div>
              <strong>{account.credential.certificateType}</strong>
              <p>证件编号 <MaskedLicense license={account.credential.licenseNumber} /></p>
              <span>{account.credential.issuingAuthority}</span>
            </div>
          </div>
        </div>

        <div className="ca-pending-actions">
          <Button full size="lg" onClick={refresh} disabled={refreshing}>
            {refreshing ? (
              <span className="btn-loading">
                <span /><span /><span />
              </span>
            ) : (
              <>
                <RefreshCw size={16} />
                刷新审核状态
              </>
            )}
          </Button>
          {!serverMode && (
            <button
              className="ca-pending-demo"
              onClick={() => {
                const result = approveCounselorDemo()
                if (!result.ok) showToast(result.message ?? '审核失败', 'error')
              }}
            >
              本地模式 · 模拟审核通过
            </button>
          )}
          <button className="ca-pending-logout" onClick={() => logoutCounselor()}>
            退出当前咨询师账号
          </button>
        </div>

        <p className="ca-pending-note">
          <ShieldCheck size={13} />
          {serverMode
            ? '审核由平台管理员在独立后台完成。通过后点击「刷新审核状态」即可进入工作台。'
            : '当前未连接后端，审核功能不可用。请使用 npm run dev:full 启动真实服务后重新提交。'}
        </p>
      </main>
    </div>
  )
}
