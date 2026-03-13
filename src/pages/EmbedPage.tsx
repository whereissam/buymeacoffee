import { useState, useEffect, useCallback } from 'react'
import { useParams } from '@tanstack/react-router'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useWeb3 } from '../hooks/useWeb3'
import { GIVE_ME_COFFEE_ABI, CONTRACT_ADDRESS } from '../config/contract'
import { getCreatorBySlug, getThemeStyles } from '../lib/creatorStore'
import { Loader2, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'

type TxState =
  | 'idle'
  | 'connecting'
  | 'wrong-network'
  | 'awaiting-signature'
  | 'pending'
  | 'success'
  | 'failed'

export default function EmbedPage() {
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

  useEffect(() => {
    if (amounts.length > 0 && !selectedAmount) {
      setSelectedAmount(amounts[0].value)
    }
  }, [amounts, selectedAmount])

  useEffect(() => {
    if (txState === 'idle' || txState === 'success' || txState === 'failed') {
      if (isConnected && !isCorrectNetwork) {
        setTxState('wrong-network')
      }
    }
  }, [isConnected, isCorrectNetwork, txState])

  const { data: creatorBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GIVE_ME_COFFEE_ABI,
    functionName: 'getLifetimeTotal',
    args: creatorAddress ? [creatorAddress] : undefined,
    query: { enabled: !!creatorAddress },
  })

  const {
    writeContract: donate,
    data: donateTxHash,
    isPending: isDonating,
    reset: resetDonate,
  } = useWriteContract()

  const {
    isLoading: isTxPending,
    isSuccess: isTxSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash: donateTxHash })

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
          if (err.message.includes('rejected')) {
            setErrorMessage('Transaction was cancelled. No funds were sent.')
          } else if (err.message.includes('insufficient')) {
            setErrorMessage('Insufficient funds. Please add more ETH.')
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

  if (!creator) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Creator not found.
      </div>
    )
  }

  const lifetimeDisplay = creatorBalance ? formatEther(creatorBalance) : '0'
  const baseScanUrl = donateTxHash
    ? `https://sepolia.basescan.org/tx/${donateTxHash}`
    : null

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-3`}>
      <div className={`${theme.card} backdrop-blur-sm rounded-xl p-4 shadow-sm`}>
        {/* Header */}
        <div className="mb-3">
          <h2 className={`text-lg font-bold ${theme.heading}`}>
            {creator.displayName}
          </h2>
          {creator.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {creator.description}
            </p>
          )}
          {parseFloat(lifetimeDisplay) > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(lifetimeDisplay).toFixed(4)} ETH received
            </p>
          )}
        </div>

        {/* Not connected */}
        {!isConnected && txState !== 'success' && (
          <button
            onClick={() => {
              setTxState('connecting')
              connectWallet()
            }}
            className={`w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer ${theme.accent} ${theme.accentText}`}
          >
            Connect Wallet
          </button>
        )}

        {/* Wrong network */}
        {isConnected && !isCorrectNetwork && txState !== 'success' && (
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-xs text-muted-foreground mb-2">Switch to Base network</p>
            <button
              onClick={switchToBase}
              className="w-full py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
            >
              Switch Network
            </button>
          </div>
        )}

        {/* Donate form */}
        {isConnected && isCorrectNetwork && (txState === 'idle' || txState === 'wrong-network') && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-1.5">
              {amounts.map((amount) => (
                <button
                  key={amount.value}
                  onClick={() => {
                    setSelectedAmount(amount.value)
                    setCustomAmount('')
                  }}
                  className={`p-2 text-xs rounded-lg border-2 transition-all cursor-pointer ${
                    selectedAmount === amount.value && !customAmount
                      ? theme.selected
                      : 'border-border/50'
                  }`}
                >
                  <div className="font-semibold">{amount.value} ETH</div>
                  <div className="text-muted-foreground">{amount.label}</div>
                </button>
              ))}
            </div>

            <input
              type="number"
              step="0.001"
              min="0"
              max="100"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom amount (ETH)"
              className="w-full px-2.5 py-1.5 border border-border bg-background text-foreground rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message (optional, max 64 chars)"
              maxLength={64}
              className="w-full px-2.5 py-1.5 border border-border bg-background text-foreground rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <button
              onClick={handleDonate}
              disabled={!effectiveAmount || parseFloat(effectiveAmount) <= 0}
              className={`w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 ${theme.accent} ${theme.accentText}`}
            >
              Send {effectiveAmount || '0'} ETH
            </button>
          </div>
        )}

        {/* Awaiting signature */}
        {txState === 'awaiting-signature' && (
          <div className="text-center py-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Confirm in your wallet...</p>
          </div>
        )}

        {/* Pending */}
        {txState === 'pending' && (
          <div className="text-center py-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-2" />
            <p className="text-xs text-muted-foreground mb-2">Transaction pending...</p>
            {baseScanUrl && (
              <a
                href={baseScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                BaseScan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Success */}
        {txState === 'success' && (
          <div className="text-center py-3">
            <CheckCircle className="w-10 h-10 mx-auto text-green-500 mb-2" />
            <p className="text-sm font-semibold text-foreground">Thank You!</p>
            <p className="text-xs text-muted-foreground mb-3">Tip sent successfully.</p>
            {baseScanUrl && (
              <a
                href={baseScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-2"
              >
                View tx <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <div className="mt-2">
              <button
                onClick={handleReset}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Send another tip
              </button>
            </div>
          </div>
        )}

        {/* Failed */}
        {txState === 'failed' && (
          <div className="text-center py-3">
            <XCircle className="w-10 h-10 mx-auto text-destructive mb-2" />
            <p className="text-xs text-muted-foreground mb-2">
              {errorMessage || 'Something went wrong.'}
            </p>
            <button
              onClick={handleReset}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-2">
        <a
          href={window.location.origin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground"
        >
          Give Me Coffee
        </a>
      </div>
    </div>
  )
}
