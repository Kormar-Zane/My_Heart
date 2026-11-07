import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { CounselorNavProvider, useCounselorNav } from './navigation'
import { CounselorBottomNav, CounselorComposeSheet } from './components'
import { CounselorHomeScreen } from './CounselorHomeScreen'
import { CounselorLiveScreen } from './CounselorLiveScreen'
import { CounselorLiveSetupScreen } from './CounselorLiveSetupScreen'
import { CounselorLiveRoomScreen } from './CounselorLiveRoomScreen'
import { CounselorMessagesScreen } from './CounselorMessagesScreen'
import { CounselorChatScreen } from './CounselorChatScreen'
import { CounselorMeScreen } from './CounselorMeScreen'
import { CounselorPostsScreen } from './CounselorPostsScreen'
import { CounselorCredentialScreen } from './CounselorCredentialScreen'
import { CounselorScheduleScreen } from './CounselorScheduleScreen'
import { CounselorPublishSheet } from './CounselorPublishSheet'
import { CounselorAuthScreen } from './CounselorAuthScreen'
import { CounselorPendingScreen } from './CounselorPendingScreen'
import { cn } from '../utils'

const rootScreens = ['home', 'live', 'messages', 'me']

function CounselorShell({ onExit }: { onExit: () => void }) {
  const { state, currentCounselorAccount } = useStore()
  const nav = useCounselorNav()
  const [composeOpen, setComposeOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isRoot = rootScreens.includes(nav.screen.name)
  const key = JSON.stringify(nav.screen)
  const activeLive = state.lives.find(
    (live) => live.hostId === currentCounselorAccount?.counselorId && live.status === 'live',
  )

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [key])

  const render = () => {
    switch (nav.screen.name) {
      case 'home':
        return <CounselorHomeScreen onPublish={() => setPublishOpen(true)} />
      case 'live':
        return <CounselorLiveScreen />
      case 'messages':
        return <CounselorMessagesScreen />
      case 'me':
        return <CounselorMeScreen onPublish={() => setPublishOpen(true)} onExit={onExit} />
      case 'live-setup':
        return <CounselorLiveSetupScreen />
      case 'live-room':
        return <CounselorLiveRoomScreen id={nav.screen.id} />
      case 'chat':
        return <CounselorChatScreen id={nav.screen.id} />
      case 'posts':
        return <CounselorPostsScreen onPublish={() => setPublishOpen(true)} />
      case 'credential':
        return <CounselorCredentialScreen />
      case 'schedule':
        return <CounselorScheduleScreen />
      default:
        return <CounselorHomeScreen onPublish={() => setPublishOpen(true)} />
    }
  }

  return (
    <div className={cn('ca-shell', isRoot && 'has-ca-nav')}>
      <div className="ca-scroll" ref={scrollRef}>
        <div className="ca-screen-fade" key={key}>
          {render()}
        </div>
      </div>
      {isRoot && <CounselorBottomNav onCompose={() => setComposeOpen(true)} />}
      <CounselorComposeSheet
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onPublish={() => setPublishOpen(true)}
        hasLive={Boolean(activeLive)}
        onLive={() =>
          activeLive
            ? nav.navigate({ name: 'live-room', id: activeLive.id })
            : nav.navigate({ name: 'live-setup' })
        }
      />
      {publishOpen && (
        <CounselorPublishSheet
          onClose={() => setPublishOpen(false)}
          onPublished={() => {
            setPublishOpen(false)
            nav.navigate({ name: 'posts' })
          }}
        />
      )}
    </div>
  )
}

export function CounselorApp({ onExit }: { onExit: () => void }) {
  const { currentCounselorAccount } = useStore()
  if (!currentCounselorAccount) {
    return <CounselorAuthScreen onExit={onExit} />
  }
  if (currentCounselorAccount.status !== 'approved') {
    return <CounselorPendingScreen onExit={onExit} />
  }
  return (
    <CounselorNavProvider>
      <CounselorShell onExit={onExit} />
    </CounselorNavProvider>
  )
}
