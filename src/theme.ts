import type { GameType, ShopItem, VipPlan } from './types'

export interface AvatarStyle {
  bg: string
  skin: string
  hair: string
  top: string
  accent: string
  style: 'long' | 'bob' | 'short' | 'wavy' | 'bun' | 'curly'
  accessory?: 'glasses' | 'earring' | 'flower' | 'none'
}

export const AVATARS: Record<string, AvatarStyle> = {
  me: { bg: '#F1DFC8', skin: '#F2C9AC', hair: '#3A2B27', top: '#D88A67', accent: '#F2C969', style: 'bob', accessory: 'earring' },
  me2: { bg: '#DCE6DE', skin: '#EFC6A8', hair: '#4A342D', top: '#5F7F72', accent: '#E9B7A3', style: 'short', accessory: 'none' },
  me3: { bg: '#E9DED7', skin: '#F0C8AF', hair: '#2F2724', top: '#C6916D', accent: '#8EAA9B', style: 'long', accessory: 'flower' },
  me4: { bg: '#DDE6E8', skin: '#EEC7AA', hair: '#3A2D28', top: '#52766F', accent: '#E2B09A', style: 'bun', accessory: 'glasses' },
  me5: { bg: '#F0E0DA', skin: '#F4CEB2', hair: '#56382C', top: '#BF8C74', accent: '#E9C46F', style: 'wavy', accessory: 'earring' },
  lin: { bg: '#E9D8CB', skin: '#F3CCB0', hair: '#382B27', top: '#91A996', accent: '#E6B09C', style: 'long', accessory: 'earring' },
  zhou: { bg: '#DDE4DD', skin: '#E8BE9F', hair: '#3B302A', top: '#55756C', accent: '#C59A7A', style: 'short', accessory: 'glasses' },
  su: { bg: '#EAD9C8', skin: '#F1C6A7', hair: '#3D2B25', top: '#C8886F', accent: '#F0C566', style: 'wavy', accessory: 'flower' },
  chen: { bg: '#DFE3DA', skin: '#E2B795', hair: '#39302C', top: '#6D7F76', accent: '#B58A69', style: 'short', accessory: 'glasses' },
  shen: { bg: '#E6DDD2', skin: '#F0C7A9', hair: '#332824', top: '#A58F77', accent: '#D8B186', style: 'bun', accessory: 'earring' },
  gu: { bg: '#DCE3E0', skin: '#EAC1A1', hair: '#2E2925', top: '#8A9C90', accent: '#D8A98D', style: 'short', accessory: 'none' },
  ye: { bg: '#F0DFD4', skin: '#F5CEB4', hair: '#44312A', top: '#B8A28D', accent: '#EFBFAC', style: 'bob', accessory: 'flower' },
  xu: { bg: '#DDE1E7', skin: '#E7BC9B', hair: '#342C29', top: '#657370', accent: '#B8A089', style: 'wavy', accessory: 'glasses' },
  ali: { bg: '#F2E2C9', skin: '#F5CFB2', hair: '#5A3A2D', top: '#DDA17E', accent: '#F1CF7A', style: 'long', accessory: 'earring' },
  nanzhi: { bg: '#E3E8DC', skin: '#EFC6A5', hair: '#2F2825', top: '#8AA48E', accent: '#E3B4A2', style: 'bob', accessory: 'none' },
  yangtao: { bg: '#F1DDD9', skin: '#F4C9AA', hair: '#4A3128', top: '#CC8677', accent: '#F1C763', style: 'curly', accessory: 'earring' },
  luye: { bg: '#DEE5DB', skin: '#EAC2A3', hair: '#39302A', top: '#728B7A', accent: '#C9A37B', style: 'short', accessory: 'none' },
  xiaoman: { bg: '#EEE0D0', skin: '#F0C7A8', hair: '#3A2C27', top: '#B99175', accent: '#E8BE7F', style: 'bun', accessory: 'flower' },
  fangtang: { bg: '#E8E0D8', skin: '#EAC3A8', hair: '#473028', top: '#C68E72', accent: '#E9C58D', style: 'wavy', accessory: 'none' },
  official: { bg: '#E4E8DD', skin: '#F1C7A6', hair: '#3A312A', top: '#607D70', accent: '#F0C45F', style: 'bob', accessory: 'flower' },
}

export const FRAMES: Record<string, { name: string; desc: string; className: string; vip?: boolean }> = {
  frame_none: { name: '素净', desc: '保持原本的样子', className: 'frame-none' },
  frame_spring: { name: '春芽', desc: '第一片新叶的颜色', className: 'frame-spring' },
  frame_dusk: { name: '晚风', desc: '傍晚六点的温柔', className: 'frame-dusk' },
  frame_star: { name: '星轨', desc: '给夜行的你', className: 'frame-star', vip: true },
  frame_moon: { name: '月白', desc: '安静的银色光晕', className: 'frame-moon', vip: true },
}

export const BADGES: Record<string, { name: string; emoji: string; desc: string }> = {
  badge_gentle: { name: '温柔观察者', emoji: '🌱', desc: '认真感受生活的人' },
  badge_listener: { name: '树洞倾听者', emoji: '🫧', desc: '愿意接住他人的情绪' },
  badge_star: { name: '夜航星', emoji: '✦', desc: '在暗处也发着光' },
}

export const VIP_PLANS: VipPlan[] = [
  {
    tier: 'week',
    name: '周卡',
    price: 9,
    days: 7,
    tag: '轻量体验',
    mic: '2 次连麦机会',
    discount: 0.95,
    perks: ['2 次直播连麦', '咨询预约 95 折', '周卡专属头像框', '会员专属身份标识'],
  },
  {
    tier: 'month',
    name: '月卡',
    price: 29,
    days: 30,
    tag: '最受欢迎',
    mic: '无限次连麦',
    discount: 0.9,
    perks: ['无限次直播连麦', '咨询预约 9 折', '全部 VIP 专属装扮', '会员专属徽章'],
  },
  {
    tier: 'year',
    name: '年卡',
    price: 299,
    days: 365,
    tag: '年度陪伴',
    mic: '连麦不限次',
    discount: 0.85,
    perks: ['无限次直播连麦', '咨询预约 85 折', '全部 VIP 装扮与标识', '赠 1 次 60 分钟面对面咨询'],
  },
]

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'frame_spring',
    name: '春芽头像框',
    description: '像春天刚冒头的第一片叶子，轻轻托住你的头像。',
    price: 30,
    type: 'virtual',
    category: 'frame',
    icon: '🌱',
    art: 'spring',
  },
  {
    id: 'frame_dusk',
    name: '晚风头像框',
    description: '把傍晚六点的橘色晚风，收进你的头像边缘。',
    price: 60,
    type: 'virtual',
    category: 'frame',
    icon: '🌇',
    art: 'dusk',
  },
  {
    id: 'frame_star',
    name: '星轨头像框',
    description: '环绕的星点与柔软光晕，是 VIP 的专属夜航标记。',
    price: 80,
    type: 'virtual',
    category: 'frame',
    icon: '✨',
    art: 'star',
    vipOnly: true,
  },
  {
    id: 'badge_gentle',
    name: '「温柔观察者」徽章',
    description: '送给每一个认真感受生活、也认真照顾自己的你。',
    price: 20,
    type: 'virtual',
    category: 'badge',
    icon: '🌿',
    art: 'badge',
  },
  {
    id: 'badge_listener',
    name: '「树洞倾听者」徽章',
    description: '愿意接住别人的情绪，也允许自己被接住。',
    price: 50,
    type: 'virtual',
    category: 'badge',
    icon: '🫧',
    art: 'badge',
  },
  {
    id: 'badge_star',
    name: '「夜航星」徽章',
    description: '在暗处也发着光，VIP 专属身份徽章。',
    price: 80,
    type: 'virtual',
    category: 'badge',
    icon: '✦',
    art: 'night',
    vipOnly: true,
  },
  {
    id: 'cup',
    name: '观心随行杯',
    description: '磨砂陶瓷杯，印着「慢一点，也没关系」。容量 350ml。',
    price: 199,
    type: 'physical',
    category: 'merch',
    icon: '☕',
    art: 'cup',
  },
  {
    id: 'seedcard',
    name: '观心种子卡',
    description: '一张可以种进土里的种子纸，写下心事，等它发芽。',
    price: 99,
    type: 'physical',
    category: 'merch',
    icon: '🌼',
    art: 'seed',
  },
  {
    id: 'tote',
    name: '观心帆布袋',
    description: '米白色厚帆布，手绘观心小眼睛，装得下日常与疲惫。',
    price: 159,
    type: 'physical',
    category: 'merch',
    icon: '👜',
    art: 'tote',
  },
  {
    id: 'aroma',
    name: '观心香薰「松间」',
    description: '雪松与佛手柑气息，为房间留一小块安静的地方。',
    price: 299,
    type: 'physical',
    category: 'merch',
    icon: '🕯️',
    art: 'aroma',
  },
]

export const GAME_META: Array<{
  type: GameType
  title: string
  tagline: string
  reward: number
  emoji: string
  art: string
  tone: string
  duration: string
}> = [
  { type: 'draw', title: '你画我猜', tagline: '不用画得好，开心就好', reward: 3, emoji: '🎨', art: 'draw', tone: 'peach', duration: '约 3 分钟' },
  { type: 'turtle', title: '海龟汤', tagline: '用一个谜面，拼出故事', reward: 2, emoji: '🐢', art: 'turtle', tone: 'sage', duration: '约 5 分钟' },
  { type: 'idiom', title: '猜成语', tagline: '看看你能猜中几个', reward: 2, emoji: '🧩', art: 'idiom', tone: 'sand', duration: '约 2 分钟' },
  { type: 'song', title: '听歌识曲', tagline: '旋律里藏着哪首歌', reward: 2, emoji: '🎧', art: 'song', tone: 'blue', duration: '约 3 分钟' },
  { type: 'karaoke', title: 'K 歌房', tagline: '跑调也没关系', reward: 3, emoji: '🎤', art: 'karaoke', tone: 'rose', duration: '约 4 分钟' },
]

export const MOODS = [
  { key: 'sunny', emoji: '🌤️', label: '还不错', color: '#F2C969', reply: '把这份轻盈收进口袋，今天慢慢走。' },
  { key: 'calm', emoji: '🌿', label: '平静', color: '#8FA796', reply: '平静也是一种珍贵的力量，愿你享受这份安稳。' },
  { key: 'tired', emoji: '🌧️', label: '有点累', color: '#9AA9B6', reply: '累了就靠一靠吧。你不需要每时每刻都很好。' },
  { key: 'anxious', emoji: '🌀', label: '焦虑', color: '#D7987E', reply: '先和我一起慢慢呼吸：吸气 4 秒，呼气 6 秒。' },
  { key: 'low', emoji: '🌑', label: '低落', color: '#847C8E', reply: '谢谢你愿意说出来。今天，先对自己温柔一点点。' },
]

export const REGION_DATA: Array<{ province: string; cities: Array<{ city: string; districts: string[] }> }> = [
  { province: '北京市', cities: [{ city: '北京', districts: ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区'] }] },
  { province: '上海市', cities: [{ city: '上海', districts: ['徐汇区', '黄浦区', '静安区', '长宁区', '浦东新区', '杨浦区'] }] },
  {
    province: '浙江省',
    cities: [
      { city: '杭州', districts: ['西湖区', '滨江区', '拱墅区', '上城区', '余杭区'] },
      { city: '宁波', districts: ['鄞州区', '海曙区', '江北区'] },
    ],
  },
  {
    province: '广东省',
    cities: [
      { city: '广州', districts: ['天河区', '越秀区', '海珠区', '荔湾区'] },
      { city: '深圳', districts: ['南山区', '福田区', '罗湖区', '宝安区'] },
    ],
  },
  { province: '四川省', cities: [{ city: '成都', districts: ['武侯区', '锦江区', '青羊区', '成华区', '高新区'] }] },
  {
    province: '江苏省',
    cities: [
      { city: '南京', districts: ['鼓楼区', '玄武区', '秦淮区', '建邺区'] },
      { city: '苏州', districts: ['姑苏区', '工业园区', '吴中区'] },
    ],
  },
  { province: '湖北省', cities: [{ city: '武汉', districts: ['武昌区', '江汉区', '洪山区'] }] },
  { province: '陕西省', cities: [{ city: '西安', districts: ['雁塔区', '碑林区', '高新区'] }] },
  { province: '重庆市', cities: [{ city: '重庆', districts: ['渝中区', '江北区', '南岸区', '沙坪坝区'] }] },
  { province: '湖南省', cities: [{ city: '长沙', districts: ['岳麓区', '天心区', '芙蓉区'] }] },
  { province: '福建省', cities: [{ city: '厦门', districts: ['思明区', '湖里区', '集美区'] }] },
  { province: '山东省', cities: [{ city: '青岛', districts: ['市南区', '崂山区', '市北区'] }] },
]
