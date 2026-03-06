import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useWeb3 } from '../hooks/useWeb3';
import { GIVE_ME_COFFEE_ABI } from '../config/contract';
import { Button } from './ui/button';
import { MessageCustomizer } from './MessageCustomizer';

interface FunCoffeeWidgetProps {
  contractAddress: `0x${string}`;
  creatorAddress: `0x${string}`;
  title?: string;
}

interface CoffeeAchievement {
  name: string;
  emoji: string;
  description: string;
  threshold: number;
  color: string;
}

const COFFEE_ACHIEVEMENTS: CoffeeAchievement[] = [
  { name: "First Sip", emoji: "☕", description: "Your first coffee!", threshold: 0.001, color: "bg-accent/20 text-accent-foreground border border-accent/40" },
  { name: "Coffee Lover", emoji: "☕☕", description: "Multiple coffees!", threshold: 0.01, color: "bg-primary/20 text-primary-foreground border border-primary/40" },
  { name: "Caffeine Addict", emoji: "☕☕☕", description: "Serious coffee support!", threshold: 0.05, color: "bg-secondary/20 text-secondary-foreground border border-secondary/40" },
  { name: "Coffee Connoisseur", emoji: "🏆☕", description: "Premium supporter!", threshold: 0.1, color: "bg-destructive/20 text-destructive-foreground border border-destructive/40" },
];

const COFFEE_REACTIONS = ["☕", "💖", "🎉", "🚀", "⭐", "🔥", "💎", "🎯"];

const BREWING_STAGES = [
  { stage: "Grinding beans", emoji: "🫘", duration: 1000 },
  { stage: "Heating water", emoji: "💧", duration: 1000 },
  { stage: "Brewing coffee", emoji: "☕", duration: 1500 },
  { stage: "Adding foam", emoji: "🥛", duration: 800 },
  { stage: "Ready to serve!", emoji: "✨", duration: 700 }
];

const THANK_YOU_MESSAGES = [
  "You're brew-tiful! ☕✨",
  "Thanks a latte! 🥛💕",
  "You're my cup of tea! 🫖💚",
  "Coffee makes everything better! ☕🌟",
  "Fueling creativity, one sip at a time! 🚀☕",
  "Bean there, done that - thanks! 🫘😄",
  "Espresso yourself - you're awesome! ☕🎨",
  "Grounds for celebration! 🎉☕"
];

export const FunCoffeeWidget: React.FC<FunCoffeeWidgetProps> = ({
  contractAddress,
  creatorAddress,
  title = "Brew Me Some Magic! ✨☕"
}) => {
  const { userAddress, isConnected, isCorrectNetwork, connectWallet, switchToBase } = useWeb3();

  const [selectedAmount, setSelectedAmount] = useState("0.001");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [brewingStage, setBrewingStage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<CoffeeAchievement | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<{id: number, emoji: string, x: number}[]>([]);
  const [coffeeParticles, setCoffeeParticles] = useState<{id: number, x: number, delay: number}[]>([]);

  const funAmounts = [
    { value: "0.001", label: "Espresso Shot", emoji: "☕", description: "Quick energy boost!" },
    { value: "0.003", label: "Cappuccino", emoji: "🥛", description: "Smooth and creamy!" },
    { value: "0.005", label: "Latte Art", emoji: "🎨", description: "Beautiful creation!" },
    { value: "0.01", label: "Coffee & Cake", emoji: "🍰", description: "The full experience!" },
    { value: "0.02", label: "Coffee Date", emoji: "💕", description: "Extra special!" },
    { value: "0.05", label: "Coffee Bar", emoji: "🏪", description: "Opening a shop!" }
  ];

  // Read creator balance
  const { data: creatorBalance, refetch: refetchBalance } = useReadContract({
    address: contractAddress,
    abi: GIVE_ME_COFFEE_ABI,
    functionName: 'getBalance',
    args: [creatorAddress],
  });

  // Read lifetime total
  const { data: lifetimeTotal, refetch: refetchLifetime } = useReadContract({
    address: contractAddress,
    abi: GIVE_ME_COFFEE_ABI,
    functionName: 'getLifetimeTotal',
    args: [creatorAddress],
  });

  // Write: donate
  const { writeContract: donate, data: donateTxHash, isPending: isDonating } = useWriteContract();

  // Write: withdraw
  const { writeContract: withdraw, data: withdrawTxHash, isPending: isWithdrawing } = useWriteContract();

  // Wait for donate tx
  const { isSuccess: donateSuccess } = useWaitForTransactionReceipt({ hash: donateTxHash });

  // Wait for withdraw tx
  const { isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawTxHash });

  const isOwner = userAddress?.toLowerCase() === creatorAddress.toLowerCase();

  const playBrewingAnimation = async () => {
    setIsAnimating(true);
    for (let i = 0; i < BREWING_STAGES.length; i++) {
      setBrewingStage(i);
      setStatusMessage(BREWING_STAGES[i].stage + " " + BREWING_STAGES[i].emoji);
      await new Promise(resolve => setTimeout(resolve, BREWING_STAGES[i].duration));
    }
  };

  const createFloatingReaction = () => {
    const newReaction = {
      id: Date.now(),
      emoji: COFFEE_REACTIONS[Math.floor(Math.random() * COFFEE_REACTIONS.length)],
      x: Math.random() * 300
    };
    setFloatingReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);
  };

  const createCoffeeParticles = () => {
    const particles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 400,
      delay: Math.random() * 2000
    }));
    setCoffeeParticles(particles);
    setTimeout(() => setCoffeeParticles([]), 4000);
  };

  const checkAchievement = (amount: string) => {
    const numAmount = parseFloat(amount);
    const achievement = COFFEE_ACHIEVEMENTS
      .filter(a => numAmount >= a.threshold)
      .sort((a, b) => b.threshold - a.threshold)[0];

    if (achievement) {
      setCurrentAchievement(achievement);
      setTimeout(() => setCurrentAchievement(null), 5000);
    }
  };

  useEffect(() => {
    if (donateSuccess) {
      createFloatingReaction();
      createCoffeeParticles();
      checkAchievement(selectedAmount);
      setShowSuccess(true);
      const thankYouMessage = THANK_YOU_MESSAGES[Math.floor(Math.random() * THANK_YOU_MESSAGES.length)];
      setStatusMessage(thankYouMessage);
      setMessage("");
      refetchBalance();
      refetchLifetime();
      setTimeout(() => {
        setStatusMessage("");
        setShowSuccess(false);
        setIsAnimating(false);
      }, 6000);
    }
  }, [donateSuccess]);

  useEffect(() => {
    if (withdrawSuccess) {
      createFloatingReaction();
      setStatusMessage("Tips collected successfully! Time for a celebration coffee! 🎉☕");
      refetchBalance();
      setTimeout(() => setStatusMessage(""), 5000);
    }
  }, [withdrawSuccess]);

  const sendDonation = async () => {
    await playBrewingAnimation();
    setStatusMessage("Sending your coffee order... ☕📡");
    donate({
      address: contractAddress,
      abi: GIVE_ME_COFFEE_ABI,
      functionName: 'donate',
      args: [creatorAddress, message],
      value: parseEther(selectedAmount),
    }, {
      onError: (err) => {
        console.error('Donation failed:', err);
        if (err.message.includes('User rejected')) {
          setStatusMessage("Order cancelled - maybe next time? 😊");
        } else {
          setStatusMessage("Something went wrong with your order! 😅");
        }
        setIsAnimating(false);
        setTimeout(() => setStatusMessage(""), 5000);
      }
    });
  };

  const withdrawFunds = () => {
    setStatusMessage("Collecting coffee tips... 💰☕");
    withdraw({
      address: contractAddress,
      abi: GIVE_ME_COFFEE_ABI,
      functionName: 'withdraw',
    }, {
      onError: (err) => {
        console.error('Withdrawal failed:', err);
        setStatusMessage("Withdrawal failed - try again! ☕😅");
        setTimeout(() => setStatusMessage(""), 5000);
      }
    });
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const balanceDisplay = creatorBalance ? formatEther(creatorBalance) : "0";
  const lifetimeDisplay = lifetimeTotal ? formatEther(lifetimeTotal) : "0";
  const isLoading = isDonating || isWithdrawing || isAnimating;

  return (
    <div className="relative coffee-widget w-full max-w-md mx-auto bg-gradient-to-br from-card to-accent/10 border-2 border-border rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Floating particles */}
      {coffeeParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-bounce opacity-70 pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: '20px',
            animationDelay: `${particle.delay}ms`,
            animationDuration: '2s'
          }}
        >
          ☕
        </div>
      ))}

      {/* Floating reactions */}
      {floatingReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute text-3xl animate-ping pointer-events-none"
          style={{
            left: `${reaction.x}px`,
            top: '50px',
            animationDuration: '3s'
          }}
        >
          {reaction.emoji}
        </div>
      ))}

      {/* Achievement notification */}
      {currentAchievement && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className={`${currentAchievement.color} px-4 py-2 rounded-full shadow-lg animate-bounce`}>
            <div className="text-center">
              <div className="text-2xl">{currentAchievement.emoji}</div>
              <div className="font-bold text-sm">{currentAchievement.name}</div>
              <div className="text-xs">{currentAchievement.description}</div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
          {title}
        </h2>
        <div className="text-4xl animate-pulse">☕✨☕</div>
      </div>

      {!isConnected ? (
        <Button
          onClick={connectWallet}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-4 text-lg font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          🔗 Connect Your Wallet ✨
        </Button>
      ) : !isCorrectNetwork ? (
        <div className="text-center">
          <div className="bg-destructive/10 border-2 border-destructive text-destructive-foreground px-4 py-3 rounded-lg mb-4 animate-pulse">
            <strong>Wrong Network! 🌐</strong> Let's switch to Base for the best coffee experience!
          </div>
          <Button
            onClick={switchToBase}
            className="w-full bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-secondary-foreground py-4 rounded-xl"
          >
            🔄 Switch to Base Network ☕
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-center text-sm text-muted-foreground bg-muted/50 border border-border rounded-lg p-2">
            Connected: {formatAddress(userAddress!)} ✅
          </div>

          <div className="mb-6">
            <label className="block text-lg font-bold text-foreground mb-3 text-center">
              Choose Your Coffee Adventure: ☕🎯
            </label>
            <div className="grid grid-cols-1 gap-3">
              {funAmounts.map((amount) => (
                <button
                  key={amount.value}
                  onClick={() => setSelectedAmount(amount.value)}
                  className={`p-4 text-sm rounded-xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                    selectedAmount === amount.value
                      ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                      : 'border-border hover:border-accent bg-card/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{amount.emoji} {amount.label}</div>
                      <div className="text-xs text-muted-foreground">{amount.description}</div>
                    </div>
                    <div className="font-mono font-bold">{amount.value} ETH</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <MessageCustomizer message={message} onMessageChange={setMessage} />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-6xl animate-spin mb-4">☕</div>
              <div className="text-lg font-bold text-primary">{statusMessage}</div>
              <div className="mt-2 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: `${(brewingStage + 1) * 20}%`}}></div>
              </div>
            </div>
          ) : (
            <Button
              onClick={sendDonation}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-4 text-xl font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 mb-4"
            >
              ☕ Brew Magic ({selectedAmount} ETH) ✨
            </Button>
          )}

          {isOwner && parseFloat(balanceDisplay) > 0 && (
            <Button
              onClick={withdrawFunds}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-secondary to-destructive hover:from-secondary/90 hover:to-destructive/90 text-secondary-foreground py-3 rounded-xl mb-4"
            >
              💰 Collect Coffee Tips ({parseFloat(balanceDisplay).toFixed(4)} ETH) 🎉
            </Button>
          )}

          <div className="text-center text-sm text-foreground mb-6 bg-muted/50 border border-border rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold">☕ Coffee Fund</div>
                <div>{parseFloat(balanceDisplay).toFixed(4)} ETH</div>
              </div>
              <div>
                <div className="font-bold">🎯 Total Brewed</div>
                <div>{parseFloat(lifetimeDisplay).toFixed(4)} ETH</div>
              </div>
            </div>
          </div>
        </>
      )}

      {statusMessage && !isLoading && (
        <div className="mt-6 text-center">
          <div className={`text-lg font-bold p-4 rounded-xl border ${
            showSuccess
              ? 'bg-accent/20 text-accent-foreground border-accent/40 animate-bounce'
              : 'bg-primary/20 text-primary-foreground border-primary/40'
          }`}>
            {statusMessage}
          </div>
        </div>
      )}
    </div>
  );
};
