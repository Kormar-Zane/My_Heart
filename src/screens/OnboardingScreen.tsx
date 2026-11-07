import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, MapPin } from 'lucide-react'
import { useStore } from '../store'
import { BrandMark } from '../components/BrandMark'
import { Button, RegionSheet } from '../components/UI'
import type { Gender, Region } from '../types'
import { cn } from '../utils'

const genders: Array<{ value: Gender; label: string; symbol: string; hint: string }> = [
  { value: '女', label: '女性', symbol: '♀', hint: '她' },
  { value: '男', label: '男性', symbol: '♂', hint: '他' },
  { value: '非二元', label: '非二元', symbol: '⚧', hint: 'TA' },
  { value: '不愿透露', label: '暂不透露', symbol: '◌', hint: '保密' },
]

export function OnboardingScreen() {
  const { currentUser, finishOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [age, setAge] = useState(currentUser?.age ?? 24)
  const [gender, setGender] = useState<Gender>(currentUser?.gender ?? '不愿透露')
  const [region, setRegion] = useState<Region>(
    currentUser?.region ?? { province: '浙江省', city: '杭州', district: '西湖区' },
  )
  const [regionOpen, setRegionOpen] = useState(false)

  if (!currentUser) return null

  const next = () => {
    if (step < 2) setStep(step + 1)
    else finishOnboarding({ age, gender, region })
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-glow" />
      <header className="onboarding-head">
        <div className="auth-brand">
          <BrandMark size={34} />
          <div>
            <strong>观心</strong>
            <span>GUANXIN</span>
          </div>
        </div>
        <span className="onboarding-step">{step + 1} / 3</span>
      </header>

      <div className="onboarding-progress">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn(i <= step && 'is-done')} />
        ))}
      </div>

      <main className="onboarding-main">
        {step === 0 && (
          <section className="onboarding-panel" key="age">
            <div className="onboarding-icon">🕯️</div>
            <p className="onboarding-eyebrow">先认识一下你</p>
            <h1>
              你的年龄是
              <br />
              <em>多少呢？</em>
            </h1>
            <p className="onboarding-desc">不同人生阶段有不同的心事。告诉我们年龄，才能给出更贴近你的陪伴。</p>
            <div className="age-picker">
              <button onClick={() => setAge(Math.max(12, age - 1))} aria-label="减小年龄">
                −
              </button>
              <div className="age-number">
                <strong>{age}</strong>
                <span>岁</span>
              </div>
              <button onClick={() => setAge(Math.min(80, age + 1))} aria-label="增加年龄">
                ＋
              </button>
            </div>
            <input
              className="age-slider"
              type="range"
              min={12}
              max={80}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              aria-label="年龄"
              style={{ '--progress': `${((age - 12) / 68) * 100}%` } as React.CSSProperties}
            />
            <div className="age-scale">
              <span>12</span>
              <span>80</span>
            </div>
            <p className="onboarding-note">你的年龄只会用于匹配合适的咨询师，不会公开展示。</p>
          </section>
        )}

        {step === 1 && (
          <section className="onboarding-panel" key="gender">
            <div className="onboarding-icon">🌿</div>
            <p className="onboarding-eyebrow">你的身份</p>
            <h1>
              你希望我们
              <br />
              <em>如何称呼你？</em>
            </h1>
            <p className="onboarding-desc">这只用于更自然地和你对话，你随时可以在个人资料里修改。</p>
            <div className="gender-grid">
              {genders.map((g) => (
                <button
                  key={g.value}
                  className={cn('gender-card', gender === g.value && 'is-active')}
                  onClick={() => setGender(g.value)}
                >
                  <span className="gender-symbol">{g.symbol}</span>
                  <span className="gender-label">{g.label}</span>
                  <span className="gender-hint">{g.hint}</span>
                  {gender === g.value && (
                    <span className="gender-check">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="onboarding-note">观心尊重每一种性别表达，也尊重你选择不说的权利。</p>
          </section>
        )}

        {step === 2 && (
          <section className="onboarding-panel" key="region">
            <div className="onboarding-icon">🗺️</div>
            <p className="onboarding-eyebrow">找到身边的支持</p>
            <h1>
              你现在
              <br />
              <em>在哪里生活？</em>
            </h1>
            <p className="onboarding-desc">我们会优先推荐你所在城市的咨询师、咨询机构和线下活动。</p>
            <button className="region-big-card" onClick={() => setRegionOpen(true)}>
              <span className="region-big-pin">
                <MapPin size={24} />
              </span>
              <span className="region-big-copy">
                <small>当前地区</small>
                <strong>{region.city}</strong>
                <span>{region.district}</span>
              </span>
              <span className="region-big-action">修改</span>
            </button>
            <div className="onboarding-region-list">
              {[
                ['杭州', '西湖区'],
                ['上海', '徐汇区'],
                ['北京', '朝阳区'],
                ['成都', '武侯区'],
                ['广州', '天河区'],
              ].map(([city, district]) => (
                <button
                  key={city}
                  className={cn('region-quick', region.city === city && 'is-active')}
                  onClick={() => {
                    const provinceMap: Record<string, string> = {
                      杭州: '浙江省',
                      上海: '上海市',
                      北京: '北京市',
                      成都: '四川省',
                      广州: '广东省',
                    }
                    setRegion({ province: provinceMap[city], city, district })
                  }}
                >
                  <span>{city}</span>
                  <small>{district}</small>
                </button>
              ))}
            </div>
            <p className="onboarding-note">地区只用于推荐附近资源，不会精确显示你的位置。</p>
          </section>
        )}
      </main>

      <footer className="onboarding-footer">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)} className="onboarding-back">
            <ArrowLeft size={17} />
            上一步
          </Button>
        ) : (
          <span className="onboarding-footer-note">1 分钟，慢慢来</span>
        )}
        <Button size="lg" onClick={next} className="onboarding-next">
          {step === 2 ? '开始我的观心之旅' : '继续'}
          <ArrowRight size={18} />
        </Button>
      </footer>

      <RegionSheet open={regionOpen} onClose={() => setRegionOpen(false)} value={region} onConfirm={setRegion} />
    </div>
  )
}
