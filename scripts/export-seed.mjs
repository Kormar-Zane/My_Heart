import { createServer } from 'vite'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const data = await vite.ssrLoadModule('/src/data.ts')
  const seed = {
    users: data.COMMUNITY_USERS.map(({ password: _password, ...user }) => user),
    counselors: data.COUNSELORS,
    institutions: data.INSTITUTIONS,
    posts: data.SEED_POSTS,
    lives: data.SEED_LIVES,
    rooms: data.SEED_ROOMS,
  }
  mkdirSync(resolve('server'), { recursive: true })
  writeFileSync(resolve('server/seed-data.json'), JSON.stringify(seed, null, 2), 'utf8')
  console.log('seed written', {
    users: seed.users.length,
    counselors: seed.counselors.length,
    institutions: seed.institutions.length,
    posts: seed.posts.length,
    lives: seed.lives.length,
    rooms: seed.rooms.length,
  })
} finally {
  await vite.close()
}
