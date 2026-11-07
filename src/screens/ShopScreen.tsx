import { useMemo, useState } from 'react'
import { ArrowRight, Check, Crown, Flower2, Gift, Package, Palette, ShoppingBag, Sparkles, Truck } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../navigation'
import { Artwork } from '../components/Artwork'
import { Button, FlowerPill, Modal, Segmented, Sheet, Tag, TopBar } from '../components/UI'
import { SHOP_ITEMS } from '../theme'
import type { ShopItem } from '../types'
import { cn, formatTimeAgo, isVipActive } from '../utils'

type ShopFilter = 'all' | 'virtual' | 'physical'

const categoryLabel = { frame: '头像框', badge: '徽章', bubble: '气泡', merch: '实体周边' }

export function ShopScreen() {
  const { currentUser, state, redeemItem, showToast } = useStore()
  const nav = useNav()
  const [filter, setFilter] = useState<ShopFilter>('all')
  const [detail, setDetail] = useState<ShopItem | null>(null)
  const [success, setSuccess] = useState<ShopItem | null>(null)
  const VIP = isVipActive(currentUser)

  const items = useMemo(
    () => SHOP_ITEMS.filter((item) => filter === 'all' || item.type === filter),
    [filter],
  )

  const owned = (item: ShopItem) =>
    item.type === 'virtual' && (currentUser?.ownedItems.includes(item.id) ?? false)

  const balance = currentUser?.flowers ?? 0

  const redeem = (item: ShopItem) => {
    if (owned(item)) {
      setDetail(null)
      nav.navigate({ name: 'dressup' })
      return
    }
    if (item.vipOnly && !VIP) {
      setDetail(null)
      nav.navigate({ name: 'vip' })
      return
    }
    const result = redeemItem(item.id, item.price, item.name, item.type, item.vipOnly)
    if (!result.ok) {
      showToast(result.message ?? '兑换失败', 'error')
      return
    }
    setDetail(null)
    setSuccess(item)
  }

  return (
    <div className="page shop-page">
      <TopBar title="小红花商店" subtitle="把攒下的温柔，换成喜欢的东西" back right={<FlowerPill count={balance} />} />

      <section className="shop-hero">
        <div className="shop-hero-copy">
          <span className="eyebrow eyebrow-light">
            <Flower2 size={13} />
            我的小红花
          </span>
          <div className="shop-balance">
            <strong>{balance}</strong>
            <span>朵</span>
          </div>
          <p>每一朵，都来自一次认真的放松。它可以换成虚拟装扮，也可以换成一件真实的观心周边。</p>
          <div className="shop-hero-actions">
            <button onClick={() => nav.navigate({ name: 'games' })}>
              <Sparkles size={14} />
              去玩游戏赚花
            </button>
          </div>
        </div>
        <div className="shop-hero-visual">
          <div className="shop-flower-coin">
            <Flower2 size={40} />
            <span>观心</span>
          </div>
          <div className="shop-coin shop-coin-1" />
          <div className="shop-coin shop-coin-2" />
          <div className="shop-coin shop-coin-3" />
        </div>
      </section>

      <div className="shop-filter">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: '全部' },
            { value: 'virtual', label: '虚拟装扮' },
            { value: 'physical', label: '实体周边' },
          ]}
        />
      </div>

      {filter === 'physical' && (
        <div className="shop-shipping-note">
          <Truck size={15} />
          <span>实体周边为观心团队自制。演示阶段兑换后不会真实发货。</span>
        </div>
      )}

      <div className="shop-grid">
        {items.map((item) => {
          const isOwned = owned(item)
          const locked = item.vipOnly && !VIP
          const affordable = balance >= item.price
          return (
            <button
              key={item.id}
              className={cn('shop-card', !affordable && 'is-unaffordable', locked && 'is-locked')}
              onClick={() => setDetail(item)}
            >
              <div className="shop-card-art">
                <Artwork variant={item.art} />
                <span className="shop-card-type">
                  {item.type === 'virtual' ? <Palette size={11} /> : <Package size={11} />}
                  {categoryLabel[item.category]}
                </span>
                {item.vipOnly && (
                  <span className="shop-vip-badge">
                    <Crown size={11} />
                    VIP
                  </span>
                )}
                {isOwned && (
                  <span className="shop-owned-badge">
                    <Check size={11} />
                    已拥有
                  </span>
                )}
              </div>
              <div className="shop-card-body">
                <strong>{item.name}</strong>
                <p>{item.description}</p>
                <div className="shop-card-footer">
                  <span className="shop-price">
                    <Flower2 size={14} />
                    {item.price}
                  </span>
                  <span className={cn('shop-redeem-hint', isOwned && 'is-owned')}>
                    {isOwned ? '去看看' : locked ? '开通 VIP' : affordable ? '兑换' : `还差 ${item.price - balance}`}
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <section className="shop-earn-card">
        <div className="shop-earn-head">
          <span className="shop-earn-icon">
            <Sparkles size={20} />
          </span>
          <div>
            <strong>小红花怎么获得？</strong>
            <p>完成解压游戏或创建主题房间，都可以获得小红花。</p>
          </div>
        </div>
        <div className="shop-earn-actions">
          <button onClick={() => nav.navigate({ name: 'games' })}>
            🎮 玩一局游戏 <span>+2~3</span>
          </button>
          <button onClick={() => nav.navigate({ name: 'relax' })}>
            🏡 创建解压房 <span>+1</span>
          </button>
          <button onClick={() => nav.navigate({ name: 'vip' })}>
            👑 开通 VIP <span>额外赠礼</span>
          </button>
        </div>
      </section>

      {state.redemptions.length > 0 && (
        <section className="shop-history">
          <h2>兑换记录</h2>
          {state.redemptions.slice(0, 4).map((record) => (
            <div className="shop-history-row" key={record.id}>
              <span className={cn('shop-history-icon', record.type)}>
                {record.type === 'physical' ? <Package size={15} /> : <Palette size={15} />}
              </span>
              <div>
                <strong>{record.itemName}</strong>
                <small>
                  {formatTimeAgo(record.createdAt)} · {record.status}
                </small>
              </div>
              <span className="shop-history-price">-{record.price} 🌸</span>
            </div>
          ))}
        </section>
      )}

      <div className="shop-guideline">
        <Gift size={14} />
        <p>小红花为观心内虚拟积分，不可提现、不可交易。虚拟礼物兑换后长期有效，实体周边需联系客服确认配送信息。</p>
      </div>

      <Sheet open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.name} subtitle={detail ? categoryLabel[detail.category] : undefined}>
        {detail && (
          <div className="shop-detail">
            <div className="shop-detail-art">
              <Artwork variant={detail.art} />
              {detail.vipOnly && (
                <span className="shop-vip-badge">
                  <Crown size={11} /> VIP 专属
                </span>
              )}
            </div>
            <p className="shop-detail-desc">{detail.description}</p>
            <div className="shop-detail-meta">
              <span>
                <Flower2 size={15} />
                {detail.price} 朵小红花
              </span>
              <span>{detail.type === 'virtual' ? '虚拟装扮 · 永久有效' : '观心自制 · 演示商品'}</span>
            </div>
            {detail.type === 'physical' && (
              <div className="shop-detail-address">
                <Truck size={15} />
                兑换后，观心小助手会在 3 个工作日内联系你确认收货地址。演示环境不会真实发货。
              </div>
            )}
            {detail.vipOnly && !VIP && (
              <div className="shop-detail-vip">
                <Crown size={16} />
                这是 VIP 专属礼物，开通会员后即可用小红花兑换。
              </div>
            )}
            <div className="shop-detail-balance">
              当前余额 <strong>{balance}</strong> 朵
              {!owned(detail) && balance < detail.price && <span>· 还差 {detail.price - balance} 朵</span>}
            </div>
            <Button
              full
              size="lg"
              onClick={() => redeem(detail)}
              className="shop-detail-button"
            >
              {owned(detail) ? '已拥有 · 去装扮中心' : detail.vipOnly && !VIP ? '去开通 VIP' : `确认兑换 · ${detail.price} 朵`}
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </Sheet>

      <Modal open={Boolean(success)} onClose={() => setSuccess(null)} dismissible={false} className="shop-success-modal">
        <div className="shop-success-icon">
          <ShoppingBag size={30} />
        </div>
        <p className="success-eyebrow">兑换成功</p>
        <h2>{success?.name}</h2>
        <p className="success-sub">
          {success?.type === 'physical'
            ? '观心小助手会联系你确认地址。谢谢你把温柔带回家。'
            : '已经放进你的装扮里了，去试试看吧。'}
        </p>
        <div className="shop-success-balance">
          <Flower2 size={16} />
          剩余小红花 <strong>{balance}</strong> 朵
        </div>
        {success?.type === 'virtual' ? (
          <Button full size="lg" onClick={() => { setSuccess(null); nav.navigate({ name: 'dressup' }) }}>
            去装扮中心
          </Button>
        ) : (
          <Button full size="lg" onClick={() => setSuccess(null)}>
            好的，谢谢
          </Button>
        )}
        <button className="success-home" onClick={() => { setSuccess(null); nav.navigate({ name: 'relax' }) }}>
          继续逛逛解压空间
        </button>
      </Modal>
    </div>
  )
}
