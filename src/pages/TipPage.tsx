import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useWeb3 } from '../hooks/useWeb3'
import { GIVE_ME_COFFEE_ABI, CONTRACT_ADDRESS } from '../config/contract'
import { getCreatorBySlug, getThemeStyles } from '../lib/creatorStore'
import { Button } from '../components/ui/button'
import { Loader2, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'

function SuccessParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 0.8 + Math.random() * 0.6,
    emoji: ['☕', '✨', '🎉', '💛'][i % 4],
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-lg animate-bounce"
          style={{
            left: `${p.x}%`,
            top: '50%',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.8,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl shadow-lg overflow-hidden bg-muted/30 animate-pulse">
        <div className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="h-7 w-40 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="bg-card/50 p-4 sm:p-6 mx-2 sm:mx-3 mb-3 rounded-xl space-y-3">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-10 bg-muted rounded-md" />
          <div className="h-10 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  )
}

type TxState =
  | 'idle'
  | 'connecting'
  | 'wrong-network'
  | 'awaiting-signature'
  | 'pending'
  | 'success'
  | 'failed'

export default function TipPage() {
  const { creatorId } = useParams({ strict: false }) as { creatorId: string }
  const creator = getCreatorBySlug(creatorId)
  const {
    userAddress,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    switchToBase,
  } = useWeb3()

  const [selectedAmount, setSelectedAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [txState, setTxState] = useState<TxState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const creatorAddress = creator?.walletAddress as `0x${string}` | undefined
  const theme = creator ? getThemeStyles(creator.theme) : getThemeStyles('coffee')
  const amounts = creator?.suggestedAmounts ?? []

  // Set default selected amount
  useEffect(() => {
    if (amounts.length > 0 && !selectedAmount) {
      setSelectedAmount(amounts[0].value)
    }
  }, [amounts, selectedAmount])

  // Derive tx state from wallet state
  useEffect(() => {
    if (txState === 'idle' || txState === 'success' || txState === 'failed') {
      if (!isConnected) {
        // stay idle
      } else if (!isCorrectNetwork) {
        setTxState('wrong-network')
      }
    }
  }, [isConnected, isCorrectNetwork, txState])

  // Read creator balance
  const { data: creatorBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GIVE_ME_COFFEE_ABI,
    functionName: 'getLifetimeTotal',
    args: creatorAddress ? [creatorAddress] : undefined,
    query: { enabled: !!creatorAddress },
  })

  // Write: donate
  const {
    writeContract: donate,
    data: donateTxHash,
    isPending: isDonating,
    reset: resetDonate,
  } = useWriteContract()

  // Wait for tx
  const {
    isLoading: isTxPending,
    isSuccess: isTxSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash: donateTxHash })

  // Track tx lifecycle
  useEffect(() => {
    if (isDonating) setTxState('awaiting-signature')
  }, [isDonating])

  useEffect(() => {
    if (isTxPending && donateTxHash) setTxState('pending')
  }, [isTxPending, donateTxHash])

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 80])
    }
  }, [])

  useEffect(() => {
    if (isTxSuccess) {
      setTxState('success')
      setMessage('')
      setCustomAmount('')
      triggerHaptic()
    }
  }, [isTxSuccess, triggerHaptic])

  useEffect(() => {
    if (isTxError) setTxState('failed')
  }, [isTxError])

  const effectiveAmount = customAmount || selectedAmount

  const handleDonate = () => {
    if (!creatorAddress || !effectiveAmount) return

    setErrorMessage('')
    donate(
      {
        address: CONTRACT_ADDRESS,
        abi: GIVE_ME_COFFEE_ABI,
        functionName: 'donate',
        args: [creatorAddress, message],
        value: parseEther(effectiveAmount),
      },
      {
        onError: (err) => {
          if (err.message.includes('User rejected') || err.message.includes('rejected')) {
            setErrorMessage('Transaction was cancelled. No funds were sent.')
          } else if (err.message.includes('insufficient funds') || err.message.includes('insufficient balance')) {
            setErrorMessage('Insufficient funds in your wallet. Please add more ETH.')
          } else if (err.message.includes('gas')) {
            setErrorMessage('Gas estimation failed. The amount may be too low or the network is congested.')
          } else {
            setErrorMessage('Transaction failed. Please check your wallet and try again.')
          }
          setTxState('failed')
        },
      }
    )
  }

  const handleReset = () => {
    setTxState('idle')
    setErrorMessage('')
    resetDonate()
  }

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-start justify-center px-2 sm:px-0 pt-4 sm:pt-8">
        <SkeletonCard />
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Creator Not Found</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          This tip page doesn't exist or hasn't been set up yet.
        </p>
        <Link to="/" className="text-primary hover:underline">
          Go Home
        </Link>
      </div>
    )
  }

  const lifetimeDisplay = creatorBalance ? formatEther(creatorBalance) : '0'
  const baseScanUrl = donateTxHash
    ? `https://sepolia.basescan.org/tx/${donateTxHash}`
    : null

  return (
    <div className={`min-h-[70vh] flex items-start justify-center px-2 sm:px-0 pt-4 sm:pt-8`}>
      <div className="w-full max-w-md">
        <div
          className={`rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br ${theme.bg}`}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4">
            <h1 className={`text-2xl font-bold ${theme.heading} mb-1`}>
              {creator.displayName}
            </h1>
            {creator.description && (
              <p className="text-sm text-muted-foreground">{creator.description}</p>
            )}
            {parseFloat(lifetimeDisplay) > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {parseFloat(lifetimeDisplay).toFixed(4)} ETH received
              </p>
            )}
          </div>

          {/* Body */}
          <div className={`${theme.card} backdrop-blur-sm p-4 sm:p-6 mx-2 sm:mx-3 mb-3 rounded-xl`}>
            {/* Idle / Not connected */}
            {!isConnected && txState !== 'success' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your wallet to send a tip
                </p>
                <Button
                  onClick={() => {
                    setTxState('connecting')
                    connectWallet()
                  }}
                  className={`w-full ${theme.accent} ${theme.accentText}`}
                >
                  Connect Wallet
                </Button>
              </div>
            )}

            {/* Wrong network */}
            {isConnected && !isCorrectNetwork && txState !== 'success' && (
              <div className="text-center">
                <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Wrong Network
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Please switch to Base to send a tip.
                </p>
                <Button
                  onClick={switchToBase}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Switch to Base
                </Button>
              </div>
            )}

            {/* Ready to donate */}
            {isConnected && isCorrectNetwork && (txState === 'idle' || txState === 'wrong-network') && (
              <>
                {/* Amount selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Choose Amount (ETH)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {amounts.map((amount) => (
                      <button
                        key={amount.value}
                        onClick={() => {
                          setSelectedAmount(amount.value)
                          setCustomAmount('')
                        }}
                        className={`p-3 text-sm rounded-lg border-2 transition-all cursor-pointer ${
                          selectedAmount === amount.value && !customAmount
                            ? theme.selected
                            : `border-border/50 hover:${theme.border}`
                        }`}
                      >
                        <div className="font-semibold">{amount.value} ETH</div>
                        <div className="text-xs text-muted-foreground">
                          {amount.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom amount */}
                <div className="mb-4">
                  <label className="block text-xs text-muted-foreground mb-1">
                    Or enter custom amount
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="block text-xs text-muted-foreground mb-1">
                    Message (optional, max 64 chars)
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Thanks for the great work!"
                    maxLength={64}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="text-right text-xs text-muted-foreground mt-1">
                    {message.length}/64
                  </div>
                </div>

                {/* Send button */}
                <Button
                  onClick={handleDonate}
                  disabled={!effectiveAmount || parseFloat(effectiveAmount) <= 0}
                  className={`w-full ${theme.accent} ${theme.accentText}`}
                >
                  Send {effectiveAmount || '0'} ETH
                </Button>
              </>
            )}

            {/* Awaiting signature */}
            {txState === 'awaiting-signature' && (
              <div className="text-center py-4">
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Awaiting Signature
                </p>
                <p className="text-xs text-muted-foreground">
                  Please confirm the transaction in your wallet.
                </p>
              </div>
            )}

            {/* Pending */}
            {txState === 'pending' && (
              <div className="text-center py-4">
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-500 mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Transaction Pending
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Waiting for confirmation on Base...
                </p>
                {baseScanUrl && (
                  <a
                    href={baseScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View on BaseScan <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Success */}
            {txState === 'success' && (
              <div className="text-center py-4 relative">
                <SuccessParticles />
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <p className="text-lg font-semibold text-foreground mb-1">
                  Thank You!
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your tip was sent successfully.
                </p>
                {baseScanUrl && (
                  <a
                    href={baseScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-4"
                  >
                    View transaction <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <div className="mt-3">
                  <Button onClick={handleReset} variant="outline" size="sm">
                    Send Another Tip
                  </Button>
                </div>
              </div>
            )}

            {/* Failed */}
            {txState === 'failed' && (
              <div className="text-center py-4">
                <XCircle className="w-12 h-12 mx-auto text-destructive mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Transaction Failed
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </p>
                <Button onClick={handleReset} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Powered by Give Me Coffee
          </Link>
        </div>
      </div>
    </div>
  )
}
