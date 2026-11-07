import { useState } from 'react'
import { ArrowRight, Check, Crown, Flower2, Lock, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Avatar } from '../components/Avatar'
import { Button, FlowerPill, Segmented, TopBar } from '../components/UI'
import { AVATARS, BADGES, FRAMES, SHOP_ITEMS } from '../theme'
import { activeVipTier, cn, guanxinId, isVipActive, vipName } from '../utils'

type DressTab = 'frames' | 'badges' | 'avatars'

const avatarOptions = ['me', 'me2', 'me3', 'me4', 'me5']
const frameOptions = ['frame_none', 'frame_spring', 'frame_dusk', 'frame_star', 'frame_moon']
const badgeOptions = [null, 'badge_gentle', 'badge_listener', 'badge_star']

export function DressUpScreen() {
  const { currentUser, equipFrame, equipBadge, updateProfile, showToast } = useStore()
  const nav = useNav()
  const [tab, setTab] = useState<DressTab>('frames')
  if (!currentUser) return null
  const VIP = isVipActive(currentUser)
  const tier = activeVipTier(currentUser)

  const isUnlocked = (frameId: string) => {
    if (frameId === 'frame_none') return true
    if (frameId === 'frame_moon') return VIP
    return currentUser.ownedItems.includes(frameId)
  }

  const framePrice = (frameId: string) => SHOP_ITEMS.find((i) => i.id === frameId)?.price
  const badgePrice = (badgeId: string) => SHOP_ITEMS.find((i) => i.id === badgeId)?.price

  const badge = currentUser.equippedBadge ? BADGES[currentUser.equippedBadge] : null
  const unlockedFrameCount = frameOptions.filter((frameId) => isUnlocked(frameId)).length

  return (
    <div className="page dressup-page">
      <TopBar title="装扮中心" subtitle="今天想成为什么样子？" back right={<FlowerPill count={currentUser.flowers} onClick={() => nav.navigate({ name: 'shop' })} />} />

      <section className="dressup-preview">
        <div className="dressup-preview-bg" />
        <div className="dressup-preview-orbit" />
        <span className="dressup-preview-eyebrow">MY LOOK</span>
        <div className="dressup-avatar-large">
          <Avatar variant={currentUser.avatar} name={currentUser.nickname} size={130} frame={currentUser.equippedFrame} />
          {VIP && (
            <span className={`dressup-vip-mark tier-${tier}`}>
              <Crown size={12} />
              {vipName(tier)}
            </span>
          )}
        </div>
        <div className="dressup-preview-name">
          <strong>{currentUser.nickname}</strong>
          {badge && <span>{badge.emoji} {badge.name}</span>}
        </div>
        <p className="dressup-preview-hint">{FRAMES[currentUser.equippedFrame]?.name ?? '素净'}头像框 · 观心号 {guanxinId(currentUser.id)}</p>
        <span className="dressup-preview-flower">❀</span>
      </section>

      <div className="dressup-tabs">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'frames', label: '头像框' },
            { value: 'badges', label: '徽章' },
            { value: 'avatars', label: '头像' },
          ]}
        />
      </div>

      {tab === 'frames' && (
        <section className="dressup-section">
          <div className="dressup-section-head">
            <h2>头像框</h2>
            <p>已拥有 {unlockedFrameCount} 款</p>
          </div>
          <div className="frame-grid">
            {frameOptions.map((frameId) => {
              const frame = FRAMES[frameId]
              const owned = isUnlocked(frameId)
              const equipped = currentUser.equippedFrame === frameId
              const price = framePrice(frameId)
              return (
                <div className={cn('frame-card', equipped && 'is-equipped', !owned && 'is-locked')} key={frameId}>
                  <div className="frame-card-preview">
                    <Avatar variant={currentUser.avatar} size={70} frame={frameId} />
                    {frame.vip && (
                      <span className="frame-vip-tag">
                        <Crown size={10} />
                        VIP
                      </span>
                    )}
                  </div>
                  <strong>{frame.name}</strong>
                  <p>{frame.desc}</p>
                  {equipped ? (
                    <span className="frame-equipped-tag">
                      <Check size={12} />
                      使用中
                    </span>
                  ) : owned ? (
                    <button className="frame-action" onClick={() => equipFrame(frameId)}>
                      使用
                    </button>
                  ) : (
                    <button
                      className="frame-action frame-action-locked"
                      onClick={() => nav.navigate({ name: frame.vip && !price ? 'vip' : 'shop' })}
                    >
                      <Lock size={11} />
                      {price ? `${price} 🌸` : '开通 VIP'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {tab === 'badges' && (
        <section className="dressup-section">
          <div className="dressup-section-head">
            <h2>身份徽章</h2>
            <p>小小的标记，也是一份看见</p>
          </div>
          <div className="badge-list">
            {badgeOptions.map((badgeId) => {
              if (!badgeId) {
                return (
                  <div className={cn('badge-card', !currentUser.equippedBadge && 'is-equipped')} key="none">
                    <span className="badge-preview none">—</span>
                    <div>
                      <strong>不佩戴徽章</strong>
                      <p>保持最原本的样子</p>
                    </div>
                    {currentUser.equippedBadge ? (
                      <button onClick={() => equipBadge(null)}>摘下</button>
                    ) : (
                      <span className="badge-equipped">
                        <Check size={12} /> 使用中
                      </span>
                    )}
                  </div>
                )
              }
              const badgeMeta = BADGES[badgeId]
              const owned = currentUser.ownedItems.includes(badgeId)
              const equipped = currentUser.equippedBadge === badgeId
              const price = badgePrice(badgeId)
              return (
                <div className={cn('badge-card', equipped && 'is-equipped', !owned && 'is-locked')} key={badgeId}>
                  <span className="badge-preview">{badgeMeta.emoji}</span>
                  <div>
                    <strong>{badgeMeta.name}</strong>
                    <p>{badgeMeta.desc}</p>
                  </div>
                  {equipped ? (
                    <span className="badge-equipped">
                      <Check size={12} /> 使用中
                    </span>
                  ) : owned ? (
                    <button onClick={() => equipBadge(badgeId)}>佩戴</button>
                  ) : (
                    <button className="badge-locked-button" onClick={() => nav.navigate({ name: 'shop' })}>
                      <Lock size={11} />
                      {price ? `${price} 🌸` : '获取'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          {!VIP && (
            <button className="dressup-vip-upsell" onClick={() => nav.navigate({ name: 'vip' })}>
              <Crown size={17} />
              <div>
                <strong>解锁 VIP 专属装扮</strong>
                <p>星轨头像框、夜航星徽章、会员标识</p>
              </div>
              <ArrowRight size={16} />
            </button>
          )}
        </section>
      )}

      {tab === 'avatars' && (
        <section className="dressup-section">
          <div className="dressup-section-head">
            <h2>选择头像</h2>
            <p>随时可以换一种心情</p>
          </div>
          <div className="avatar-picker">
            {avatarOptions.map((avatar, index) => (
              <button
                key={avatar}
                className={cn('avatar-pick', currentUser.avatar === avatar && 'is-active')}
                onClick={() => {
                  updateProfile({ avatar })
                  showToast('头像已更新')
                }}
              >
                <Avatar variant={avatar} size={64} frame={currentUser.equippedFrame} />
                <span>{['原来的我', '短发', '长发', '圆框眼镜', '卷发'][index]}</span>
                {currentUser.avatar === avatar && (
                  <span className="avatar-pick-check">
                    <Check size={11} />
                  </span>
                )}
              </button>
            ))}
            <button className="avatar-pick avatar-pick-more" onClick={() => showToast('更多头像将在后续版本开放', 'info')}>
              <span className="avatar-pick-plus">＋</span>
              <span>敬请期待</span>
            </button>
          </div>
          <p className="avatar-picker-note">头像仅用于观心内展示，你可以随时更换或恢复默认。</p>
        </section>
      )}

      <div className="dressup-tip">
        <Sparkles size={14} />
        <p>装扮不改变任何功能权益。小红花可通过解压游戏获得，VIP 专属装扮在会员有效期内可用。</p>
      </div>

      {!VIP && (
        <button className="dressup-shop-banner" onClick={() => nav.navigate({ name: 'shop' })}>
          <Flower2 size={18} />
          <span>小红花商店还有更多礼物</span>
          <ArrowRight size={15} />
        </button>
      )}

      <div className="dressup-footer">
        <span>已拥有 {currentUser.ownedItems.length} 件装扮</span>
        <button onClick={() => nav.navigate({ name: 'vip' })}>
          <Crown size={14} />
          VIP 中心
        </button>
      </div>
    </div>
  )
}
