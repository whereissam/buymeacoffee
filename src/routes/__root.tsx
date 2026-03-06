import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Web3Provider } from '../contexts/Web3Context'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { AnimeNavBar } from '../components/ui/anime-navbar'
import { Home, Coffee, FileSearch, Heart, Info } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'Create Widget', url: '/factory', icon: Coffee },
  { name: 'Contract', url: '/contract-preview', icon: FileSearch },
  { name: 'Demo Coffee', url: '/coffee', icon: Heart },
  { name: 'About', url: '/about', icon: Info },
]

const RootComponent = () => {
  const location = useLocation()
  const [activeNav, setActiveNav] = useState('Home')

  useEffect(() => {
    const match = navItems.find((item) => {
      if (item.url === '/') return location.pathname === '/'
      return location.pathname.startsWith(item.url)
    })
    if (match) setActiveNav(match.name)
  }, [location.pathname])

  return (
    <ThemeProvider>
      <Web3Provider>
        <div className="min-h-screen bg-background font-sans">
          {/* Anime NavBar */}
          <AnimeNavBar items={navItems} defaultActive={activeNav} />

          {/* Theme Toggle - fixed top right */}
          <div className="fixed top-6 right-6 z-[10000]">
            <ThemeToggle />
          </div>

          {/* Main Content - add top padding for fixed navbar */}
          <main className="container mx-auto p-4 pb-8 pt-28">
            <Outlet />
          </main>
        </div>
        <TanStackRouterDevtools />
      </Web3Provider>
    </ThemeProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
