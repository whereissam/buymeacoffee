import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useWeb3 } from '../hooks/useWeb3'
import { Button } from '../components/ui/button'
import {
  saveCreator,
  getDefaultAmounts,
  getCreatorByAddress,
  type CreatorTheme,
  type SuggestedAmount,
} from '../lib/creatorStore'
import { Wallet, Palette, CheckCircle, Copy, ExternalLink } from 'lucide-react'

const themes: { id: CreatorTheme; name: string; colors: string }[] = [
  { id: 'coffee', name: 'Coffee Shop', colors: 'bg-gradient-to-r from-amber-400 to-orange-400' },
  { id: 'modern', name: 'Modern', colors: 'bg-gradient-to-r from-blue-400 to-purple-400' },
  { id: 'minimal', name: 'Minimal', colors: 'bg-gradient-to-r from-gray-400 to-slate-500' },
  { id: 'fun', name: 'Fun & Colorful', colors: 'bg-gradient-to-r from-pink-400 to-yellow-400' },
]

export default function CreatorSetup() {
  const { userAddress, isConnected, connectWallet } = useWeb3()
  const navigate = useNavigate()

  const [step, setStep] = useState<'connect' | 'configure' | 'done'>(() => {
    return 'connect'
  })

  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<CreatorTheme>('coffee')
  const [amounts, setAmounts] = useState<SuggestedAmount[]>(getDefaultAmounts())
  const [useCustomAmounts, setUseCustomAmounts] = useState(false)
  const [slug, setSlug] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  // Auto-advance from connect step when wallet connects
  if (step === 'connect' && isConnected && userAddress) {
    const existing = getCreatorByAddress(userAddress)
    if (existing) {
      setSlug(existing.slug)
      setDisplayName(existing.displayName)
      setDescription(existing.description)
      setSelectedTheme(existing.theme)
      setAmounts(existing.suggestedAmounts)
    }
    setStep('configure')
  }

  const updateAmount = (index: number, field: keyof SuggestedAmount, value: string) => {
    setAmounts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    )
  }

  const addAmount = () => {
    if (amounts.length < 6) {
      setAmounts((prev) => [...prev, { value: '0.005', label: 'Custom' }])
    }
  }

  const removeAmount = (index: number) => {
    if (amounts.length > 1) {
      setAmounts((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSave = () => {
    if (!userAddress || !displayName.trim()) return

    const creator = saveCreator({
      walletAddress: userAddress,
      displayName: displayName.trim(),
      description: description.trim(),
      suggestedAmounts: amounts,
      theme: selectedTheme,
    })

    setSlug(creator.slug)
    setStep('done')
  }

  const baseUrl = window.location.origin
  const tipUrl = `${baseUrl}/tip/${slug}`
  const embedUrl = `${baseUrl}/embed/${slug}`
  const iframeCode = `<iframe src="${embedUrl}" width="400" height="520" frameborder="0" style="border-radius:12px;"></iframe>`
  const badgeMarkdown = `[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-${encodeURIComponent(displayName)}-orange?style=for-the-badge)](${tipUrl})`

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-1 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Create Your Tip Page</h1>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
        Set up your donation page in a few simple steps.
      </p>

      {/* Progress */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
        {['Connect', 'Configure', 'Done'].map((label, i) => {
          const steps = ['connect', 'configure', 'done'] as const
          const isActive = steps.indexOf(step) >= i
          return (
            <div key={label} className="flex items-center gap-1.5 sm:gap-2 flex-1">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs sm:text-sm hidden min-[400px]:inline ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-border" />}
            </div>
          )
        })}
      </div>

      {/* Step 1: Connect Wallet */}
      {step === 'connect' && (
        <div className="bg-card rounded-xl shadow-md p-6 sm:p-8 text-center">
          <Wallet className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to prove ownership and set your creator address.
          </p>
          <Button
            onClick={connectWallet}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Connect Wallet
          </Button>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 'configure' && (
        <div className="bg-card rounded-xl shadow-md p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
            <Wallet className="w-4 h-4 shrink-0" />
            <span className="truncate">Connected: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</span>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name or project name"
              maxLength={50}
              className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell supporters what you're building..."
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {description.length}/200
            </div>
          </div>

          {/* Suggested Amounts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Donation Amounts (ETH)
              </label>
              <button
                onClick={() => {
                  setUseCustomAmounts(!useCustomAmounts)
                  if (useCustomAmounts) setAmounts(getDefaultAmounts())
                }}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                {useCustomAmounts ? 'Use defaults' : 'Customize'}
              </button>
            </div>
            <div className="space-y-2">
              {amounts.map((amount, i) => (
                <div key={i} className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    value={amount.value}
                    onChange={(e) => updateAmount(i, 'value', e.target.value)}
                    disabled={!useCustomAmounts}
                    className="w-full sm:w-28 px-3 py-2 border border-border bg-background text-foreground rounded-md text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.001"
                  />
                  <input
                    type="text"
                    value={amount.label}
                    onChange={(e) => updateAmount(i, 'label', e.target.value)}
                    disabled={!useCustomAmounts}
                    className="flex-1 min-w-0 px-3 py-2 border border-border bg-background text-foreground rounded-md text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Label"
                  />
                  {useCustomAmounts && amounts.length > 1 && (
                    <button
                      onClick={() => removeAmount(i)}
                      className="text-destructive hover:text-destructive/80 text-sm px-2 cursor-pointer"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
              {useCustomAmounts && amounts.length < 6 && (
                <button
                  onClick={addAmount}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  + Add amount
                </button>
              )}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Palette className="w-4 h-4" />
              Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedTheme === theme.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className={`h-3 rounded-full mb-2 ${theme.colors}`} />
                  <div className="text-sm font-medium text-foreground">
                    {theme.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!displayName.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Create Tip Page
          </Button>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 'done' && (
        <div className="bg-card rounded-xl shadow-md p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-green-500 mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              Your Tip Page is Ready!
            </h2>
            <p className="text-sm text-muted-foreground">
              Share it with your supporters to start receiving donations.
            </p>
          </div>

          {/* Hosted Page URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Hosted Page URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 px-3 py-2 border border-border bg-muted text-foreground rounded-md text-sm overflow-x-auto whitespace-nowrap">
                {tipUrl}
              </div>
              <Button
                onClick={() => copyToClipboard(tipUrl, 'url')}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied === 'url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => navigate({ to: '/tip/$creatorId', params: { creatorId: slug } })}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Iframe Embed */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Iframe Embed Code
            </label>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 px-3 py-2 border border-border bg-muted text-foreground rounded-md text-xs sm:text-sm font-mono overflow-x-auto whitespace-nowrap">
                {iframeCode}
              </div>
              <Button
                onClick={() => copyToClipboard(iframeCode, 'iframe')}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied === 'iframe' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* GitHub Badge */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              GitHub Badge Markdown
            </label>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 px-3 py-2 border border-border bg-muted text-foreground rounded-md text-xs sm:text-sm font-mono overflow-x-auto whitespace-nowrap">
                {badgeMarkdown}
              </div>
              <Button
                onClick={() => copyToClipboard(badgeMarkdown, 'badge')}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied === 'badge' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate({ to: '/tip/$creatorId', params: { creatorId: slug } })}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              View Tip Page
            </Button>
            <Button
              onClick={() => {
                setStep('configure')
              }}
              variant="outline"
              className="flex-1"
            >
              Edit Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
