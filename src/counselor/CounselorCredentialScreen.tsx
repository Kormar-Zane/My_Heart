import {
  BadgeCheck,
  CalendarDays,
  FileCheck2,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../store'
import { Button, Tag } from '../components/UI'
import { CertificateImage, CounselorTopBar, MaskedLicense } from './components'
import { formatDateCN } from '../utils'

export function CounselorCredentialScreen() {
  const { currentCounselorAccount, showToast } = useStore()
  if (!currentCounselorAccount) return null
  const account = currentCounselorAccount
  const credential = account.credential

  return (
    <div className="page ca-page ca-credential-page">
      <CounselorTopBar title="认证资料" subtitle="你的专业身份与资质" back />

      <section className="ca-credential-hero">
        <div className="ca-credential-seal">
          <ShieldCheck size={28} />
          <span>
            <BadgeCheck size={12} />
          </span>
        </div>
        <span className="ca-credential-eyebrow">VERIFIED PROFESSIONAL</span>
        <h1>专业身份已认证</h1>
        <p>你的资质资料已通过观心平台审核，用户端会展示认证咨询师标识。</p>
        <div className="ca-credential-status">
          <span>
            <BadgeCheck size={13} />
            认证通过
          </span>
          <span>
            <Lock size={12} />
            信息仅用于核验
          </span>
        </div>
      </section>

      <section className="ca-credential-card">
        <div className="ca-credential-card-head">
          <div>
            <span>咨询师资质</span>
            <strong>{credential.certificateType}</strong>
          </div>
          <Tag tone="gold">已核验</Tag>
        </div>
        <CertificateImage src={credential.certificateImage} />
        <div className="ca-credential-fields">
          <div>
            <span>证件编号</span>
            <strong>
              <MaskedLicense license={credential.licenseNumber} />
            </strong>
          </div>
          <div>
            <span>发证机构</span>
            <strong>{credential.issuingAuthority}</strong>
          </div>
          <div>
            <span>提交时间</span>
            <strong>{formatDateCN(credential.submittedAt)}</strong>
          </div>
          <div>
            <span>认证状态</span>
            <strong className="is-approved">
              <BadgeCheck size={13} />
              审核通过
            </strong>
          </div>
        </div>
      </section>

      <section className="ca-credential-profile">
        <div className="ca-credential-section-title">
          <FileCheck2 size={16} />
          <h2>公开专业资料</h2>
        </div>
        <div className="ca-credential-profile-grid">
          <div>
            <span>姓名</span>
            <strong>{account.name}</strong>
          </div>
          <div>
            <span>咨询师类型</span>
            <strong>{account.title}</strong>
          </div>
          <div>
            <span>从业年限</span>
            <strong>{account.years} 年</strong>
          </div>
          <div>
            <span>所在机构</span>
            <strong>{account.institution}</strong>
          </div>
          <div>
            <span>执业地区</span>
            <strong>{account.region.city} · {account.region.district}</strong>
          </div>
          <div>
            <span>擅长方向</span>
            <strong>{account.specialties.join(' / ')}</strong>
          </div>
        </div>
      </section>

      <section className="ca-credential-privacy">
        <ShieldCheck size={16} />
        <div>
          <strong>关于你的资质信息</strong>
          <p>证件照片与完整编号不会在用户端公开。正式版将把资质文件加密存储，并仅向审核人员开放必要权限。</p>
        </div>
      </section>

      <div className="ca-credential-actions">
        <Button
          variant="secondary"
          onClick={() => showToast('更新证件将在正式版开放，需要重新审核', 'info')}
        >
          <CalendarDays size={16} />
          更新认证资料
        </Button>
        <button onClick={() => showToast('资质问题请联系 care@guanxin.demo', 'info')}>
          联系平台审核
        </button>
      </div>

      <p className="ca-credential-note">
        <Sparkles size={13} />
        当前为测试认证流程，证件与身份资料仅保存在本机，不代表真实资质核验结果。
      </p>
    </div>
  )
}
