import { useState } from 'react'
import { Check, ChevronRight, MapPin, Save, Shirt } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Button, RegionSheet, TopBar } from '../components/UI'
import type { Gender, Region } from '../types'
import { cn, guanxinId, regionFullLabel, regionLabel } from '../utils'

const genderOptions: Gender[] = ['女', '男', '非二元', '不愿透露']

export function EditProfileScreen() {
  const { currentUser, updateProfile, showToast } = useStore()
  const nav = useNav()
  const [nickname, setNickname] = useState(currentUser?.nickname ?? '')
  const [age, setAge] = useState(currentUser?.age ?? 24)
  const [gender, setGender] = useState<Gender>(currentUser?.gender ?? '不愿透露')
  const [region, setRegion] = useState<Region>(
    currentUser?.region ?? { province: '浙江省', city: '杭州', district: '西湖区' },
  )
  const [bio, setBio] = useState(currentUser?.bio ?? '')
  const [regionOpen, setRegionOpen] = useState(false)

  if (!currentUser) return null

  const save = () => {
    if (!nickname.trim()) {
      showToast('昵称不能为空', 'error')
      return
    }
    updateProfile({ nickname: nickname.trim(), age, gender, region, bio: bio.trim() })
    nav.back()
  }

  return (
    <div className="page edit-profile-page">
      <TopBar title="编辑资料" subtitle="让你被更懂一点" back right={<span className="topbar-save-hint">资料仅自己可见</span>} />

      <section className="edit-avatar-section">
        <div className="edit-avatar-wrap">
          <Avatar variant={currentUser.avatar} name={nickname} size={88} frame={currentUser.equippedFrame} />
          <button className="edit-avatar-button" onClick={() => nav.navigate({ name: 'dressup' })}>
            <Shirt size={14} />
            更换装扮
          </button>
        </div>
        <p className="edit-avatar-note">观心号 {guanxinId(currentUser.id)}</p>
      </section>

      <section className="edit-form-section">
        <label className="edit-field">
          <span className="edit-label">昵称</span>
          <input value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 16))} maxLength={16} placeholder="怎么称呼你？" />
          <small>{nickname.length} / 16</small>
        </label>

        <div className="edit-field">
          <span className="edit-label">年龄</span>
          <div className="edit-age-row">
            <button onClick={() => setAge(Math.max(12, age - 1))} aria-label="减小年龄">−</button>
            <strong>{age}<span>岁</span></strong>
            <button onClick={() => setAge(Math.min(80, age + 1))} aria-label="增加年龄">＋</button>
          </div>
          <input
            className="age-slider edit-age-slider"
            type="range"
            min={12}
            max={80}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            style={{ '--progress': `${((age - 12) / 68) * 100}%` } as React.CSSProperties}
            aria-label="年龄"
          />
        </div>

        <div className="edit-field">
          <span className="edit-label">性别</span>
          <div className="edit-gender-grid">
            {genderOptions.map((g) => (
              <button key={g} className={cn(gender === g && 'is-active')} onClick={() => setGender(g)}>
                {g}
                {gender === g && <Check size={12} />}
              </button>
            ))}
          </div>
        </div>

        <button className="edit-region-card" onClick={() => setRegionOpen(true)}>
          <span className="edit-region-icon">
            <MapPin size={20} />
          </span>
          <div>
            <small>所在地区</small>
            <strong>{regionFullLabel(region)}</strong>
            <p>用于推荐附近的咨询师和咨询机构</p>
          </div>
          <ChevronRight size={16} />
        </button>

        <label className="edit-field edit-bio-field">
          <span className="edit-label">个人简介</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 80))}
            rows={3}
            maxLength={80}
            placeholder="写一句你想让别人知道的话…"
          />
          <small>{bio.length} / 80</small>
        </label>
      </section>

      <div className="edit-privacy-note">
        <MapPin size={14} />
        你的年龄、性别和地区只用于匹配与推荐，不会在广场公开显示精确位置。
      </div>

      <div className="edit-save-wrap">
        <Button full size="lg" onClick={save}>
          <Save size={17} />
          保存修改
        </Button>
      </div>

      <RegionSheet
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        value={region}
        onConfirm={(next) => {
          setRegion(next)
          showToast(`地区已切换为 ${regionLabel(next)}`, 'info')
        }}
      />
    </div>
  )
}
