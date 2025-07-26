import { createRootRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Web3Provider } from '../contexts/Web3Context'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { useState } from 'react'

const RootComponent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }
  
  return (
      <ThemeProvider>
        <Web3Provider>
          <div className="min-h-screen bg-background font-sans">
            {/* Desktop Navigation */}
            <nav className="hidden md:block bg-card border-b border-border sticky top-0 z-40 shadow-lg">
              <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  {/* Brand */}
                  <Link to="/" className="text-2xl font-bold text-primary hover:text-accent transition-colors cursor-pointer">
                    ☕ Coffee Factory
                  </Link>
                  
                  {/* Desktop Links & Theme Toggle */}
                  <div className="flex items-center gap-6">
                    <Link 
                      to="/" 
                      className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer border-2 ${
                        isActive('/') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary border-border'
                      }`}
                    >
                      🏠 Home
                    </Link>
                    <Link 
                      to="/factory" 
                      className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer border-2 ${
                        isActive('/factory') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary border-border'
                      }`}
                    >
                      ☕ Create Widget
                    </Link>
                    <Link 
                      to="/contract-preview" 
                      className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer border-2 ${
                        isActive('/contract-preview') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary border-border'
                      }`}
                    >
                      🔍 Contract
                    </Link>
                    <Link 
                      to="/coffee" 
                      className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer border-2 ${
                        isActive('/coffee') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary border-border'
                      }`}
                    >
                      💝 Demo Coffee
                    </Link>
                    <Link 
                      to="/about" 
                      className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer border-2 ${
                        isActive('/about') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary border-border'
                      }`}
                    >
                      ℹ️ About
                    </Link>
                    
                    {/* Theme Toggle in Desktop Nav */}
                    <div className="ml-4 pl-4 border-l border-border">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Mobile Top Header */}
            <header className="md:hidden bg-card border-b border-border sticky top-0 z-40 shadow-lg">
              <div className="flex items-center justify-between px-4 py-4">
                {/* Mobile Brand */}
                <Link to="/" className="text-xl font-bold text-primary hover:text-accent transition-colors cursor-pointer">
                  ☕ Coffee Factory
                </Link>
                
                {/* Mobile Controls */}
                <div className="flex items-center gap-3">
                  {/* Theme Toggle */}
                  <ThemeToggle />
                  
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-foreground hover:text-primary p-2 rounded-lg bg-secondary shadow-sm hover:shadow-md transition-all cursor-pointer"
                    aria-label="Toggle menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="border-t border-border bg-card shadow-lg">
                  <div className="px-4 py-3 space-y-2">
                    <Link 
                      to="/" 
                      className={`flex items-center gap-3 font-medium px-4 py-3 rounded-lg transition-all cursor-pointer border-2 ${
                        isActive('/') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary bg-muted border-border'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">🏠</span>
                      Home
                    </Link>
                    <Link 
                      to="/factory" 
                      className={`flex items-center gap-3 font-medium px-4 py-3 rounded-lg transition-all cursor-pointer border-2 ${
                        isActive('/factory') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary bg-muted border-border'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">☕</span>
                      Create Widget
                    </Link>
                    <Link 
                      to="/contract-preview" 
                      className={`flex items-center gap-3 font-medium px-4 py-3 rounded-lg transition-all cursor-pointer border-2 ${
                        isActive('/contract-preview') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary bg-muted border-border'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">🔍</span>
                      Contract
                    </Link>
                    <Link 
                      to="/coffee" 
                      className={`flex items-center gap-3 font-medium px-4 py-3 rounded-lg transition-all cursor-pointer border-2 ${
                        isActive('/coffee') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary bg-muted border-border'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">💝</span>
                      Demo Coffee
                    </Link>
                    <Link 
                      to="/about" 
                      className={`flex items-center gap-3 font-medium px-4 py-3 rounded-lg transition-all cursor-pointer border-2 ${
                        isActive('/about') 
                          ? 'bg-primary text-primary-foreground border-accent shadow-md' 
                          : 'text-foreground hover:bg-secondary bg-muted border-border'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">ℹ️</span>
                      About
                    </Link>
                  </div>
                </div>
              )}
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4 pb-8">
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