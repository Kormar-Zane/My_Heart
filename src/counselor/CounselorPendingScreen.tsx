import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock3,
  FileCheck2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../store'
import { BrandMark } from '../components/BrandMark'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/UI'
import { CertificateImage, MaskedLicense } from './components'
import { formatDateCN } from '../utils'

export function CounselorPendingScreen({ onExit }: { onExit: () => void }) {
  const { currentCounselorAccount, approveCounselorDemo, logoutCounselor, showToast } = useStore()
  const [approving, setApproving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!approving) return
    const timer = window.setTimeout(() => {
      const result = approveCounselorDemo()
      setApproving(false)
      setDone(result.ok)
      if (!result.ok) showToast(result.message ?? '审核失败', 'error')
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [approving, approveCounselorDemo, showToast])

  if (!currentCounselorAccount) return null
  const account = currentCounselorAccount
  const rejected = account.status === 'rejected'

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
        <div className={done ? 'ca-pending-icon is-done' : 'ca-pending-icon'}>
          {done ? <Check size={32} /> : <Clock3 size={30} />}
        </div>
        <span className="ca-pending-eyebrow">{done ? 'REVIEW PASSED' : 'UNDER REVIEW'}</span>
        <h1>{done ? '认证已通过' : rejected ? '认证未通过' : '你的资质正在审核中'}</h1>
        <p className="ca-pending-desc">
          {done
            ? '欢迎加入观心专业团队。你的工作台已经准备好，可以开始开播、回复来访者与分享日常。'
            : rejected
              ? '本次资料未能通过审核，请检查证件信息后重新提交。'
              : '已收到你的咨询师认证资料。平台会核验证件类型、编号与发证机构，审核通过后即可使用全部功能。'}
        </p>

        <div className="ca-pending-profile">
          <Avatar variant={account.avatar} name={account.name} size={52} />
          <div>
            <strong>{account.name}</strong>
            <p>{account.title} · {account.years} 年从业</p>
            <span>{account.credential.issuingAuthority}</span>
          </div>
          <span className={done ? 'ca-status-pill is-approved' : 'ca-status-pill'}>
            {done ? <BadgeCheck size={12} /> : <Clock3 size={12} />}
            {done ? '认证通过' : rejected ? '未通过' : '审核中'}
          </span>
        </div>

        <div className="ca-pending-timeline">
          <div className="ca-timeline-step is-done">
            <span>
              <Check size={12} />
            </span>
            <div>
              <strong>资料已提交</strong>
              <p>{formatDateCN(account.credential.submittedAt)} · 账号与资质信息</p>
            </div>
          </div>
          <div className={done ? 'ca-timeline-step is-done' : 'ca-timeline-step is-active'}>
            <span>{done ? <Check size={12} /> : <span className="ca-timeline-pulse" />}</span>
            <div>
              <strong>{done ? '平台审核完成' : '平台资质审核'}</strong>
              <p>{done ? '证件信息与发证机构已核验（演示流程）' : '预计 1–2 个工作日 · 测试阶段可模拟审核'}</p>
            </div>
          </div>
          <div className={done ? 'ca-timeline-step is-done' : 'ca-timeline-step'}>
            <span>{done ? <Check size={12} /> : '3'}</span>
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
            <span>仅自己可见</span>
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
          {!done && (
            <Button full size="lg" variant="gold" onClick={() => setApproving(true)} disabled={approving}>
              {approving ? (
                <span className="btn-loading">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <>
                  <Sparkles size={16} />
                  演示环境 · 模拟审核通过
                </>
              )}
            </Button>
          )}
          {done && (
            <Button full size="lg" onClick={() => showToast('正在进入工作台')}>
              进入咨询师工作台
              <ArrowLeft size={16} className="ca-arrow-flip" />
            </Button>
          )}
          <button
            className="ca-pending-logout"
            onClick={() => {
              logoutCounselor()
            }}
          >
            退出当前咨询师账号
          </button>
        </div>

        <p className="ca-pending-note">
          <ShieldCheck size={13} />
          正式版本中，资质审核由平台工作人员人工完成。演示环境不验证真实证件，请勿上传敏感个人信息。
        </p>
      </main>
    </div>
  )
}
