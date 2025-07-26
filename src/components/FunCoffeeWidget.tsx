import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from './ui/button';
import { MessageCustomizer } from './MessageCustomizer';

const CONTRACT_ABI = [
  "function donate(string memory _message) external payable",
  "function withdraw() external",
  "function getBalance() external view returns (uint256)",
  "function totalDonations() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function getRecentDonations(uint256 count) external view returns (address[] memory, uint256[] memory, string[] memory, uint256[] memory)",
  "event DonationReceived(address indexed donor, uint256 amount, string message, uint256 timestamp)"
];

interface FunCoffeeWidgetProps {
  contractAddress: string;
  title?: string;
}

interface Donation {
  donor: string;
  amount: string;
  message: string;
  timestamp: number;
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
  title = "Brew Me Some Magic! ✨☕" 
}) => {
  const { signer, userAddress, isConnected, isCorrectNetwork, connectWallet, switchToBase, error: web3Error } = useWeb3();
  
  const [selectedAmount, setSelectedAmount] = useState("0.001");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [totalDonations, setTotalDonations] = useState<string>("0");
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [isOwner, setIsOwner] = useState(false);
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

  const getContract = () => {
    if (!signer || !contractAddress) return null;
    return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
  };

  const playBrewingAnimation = async () => {
    setIsLoading(true);
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

  const loadContractData = async () => {
    try {
      const contract = getContract();
      if (!contract) return;

      const [balance, total, owner, donations] = await Promise.all([
        contract.getBalance(),
        contract.totalDonations(),
        contract.owner(),
        contract.getRecentDonations(5)
      ]);

      setContractBalance(ethers.formatEther(balance));
      setTotalDonations(ethers.formatEther(total));
      setIsOwner(userAddress?.toLowerCase() === owner.toLowerCase());

      const [donors, amounts, messages, timestamps] = donations;
      const formattedDonations: Donation[] = donors.map((donor: string, index: number) => ({
        donor,
        amount: ethers.formatEther(amounts[index]),
        message: messages[index],
        timestamp: Number(timestamps[index])
      }));

      setRecentDonations(formattedDonations);
    } catch (err) {
      console.error('Failed to load contract data:', err);
    }
  };

  const sendDonation = async () => {
    if (!signer || !contractAddress) return;

    try {
      await playBrewingAnimation();
      
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const donationAmount = ethers.parseEther(selectedAmount);
      
      setStatusMessage("Sending your coffee order... ☕📡");
      const tx = await contract.donate(message, { value: donationAmount });
      
      setStatusMessage("Your coffee is being prepared... ⏳✨");
      await tx.wait();
      
      // Success animations
      createFloatingReaction();
      createCoffeeParticles();
      checkAchievement(selectedAmount);
      setShowSuccess(true);
      
      const thankYouMessage = THANK_YOU_MESSAGES[Math.floor(Math.random() * THANK_YOU_MESSAGES.length)];
      setStatusMessage(thankYouMessage);
      setMessage("");
      
      // Reload contract data
      await loadContractData();
      
      setTimeout(() => {
        setStatusMessage("");
        setShowSuccess(false);
      }, 6000);
      
    } catch (err: any) {
      console.error('Donation failed:', err);
      if (err.code === 'ACTION_REJECTED') {
        setStatusMessage("Order cancelled - maybe next time? 😊");
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        setStatusMessage("Oops! Your wallet needs more ETH ☕💔");
      } else {
        setStatusMessage("Something went wrong with your order! 😅");
      }
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setIsLoading(false);
      setBrewingStage(0);
    }
  };

  const withdrawFunds = async () => {
    if (!signer || !isOwner) return;

    try {
      setIsLoading(true);
      setStatusMessage("Collecting coffee tips... 💰☕");

      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const tx = await contract.withdraw();
      await tx.wait();

      createFloatingReaction();
      setStatusMessage("Tips collected successfully! Time for a celebration coffee! 🎉☕");
      await loadContractData();
      
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (err: any) {
      console.error('Withdrawal failed:', err);
      setStatusMessage("Withdrawal failed - try again! ☕😅");
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && isCorrectNetwork && signer) {
      loadContractData();
    }
  }, [isConnected, isCorrectNetwork, signer, contractAddress]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

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
      
      {web3Error && (
        <div className="bg-destructive/10 border-2 border-destructive text-destructive-foreground px-4 py-3 rounded-lg mb-4 animate-shake">
          <strong>Oops! ☕💔</strong> {web3Error}
        </div>
      )}

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

          {isOwner && parseFloat(contractBalance) > 0 && (
            <Button
              onClick={withdrawFunds}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-secondary to-destructive hover:from-secondary/90 hover:to-destructive/90 text-secondary-foreground py-3 rounded-xl mb-4"
            >
              💰 Collect Coffee Tips ({contractBalance} ETH) 🎉
            </Button>
          )}

          <div className="text-center text-sm text-foreground mb-6 bg-muted/50 border border-border rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold">☕ Coffee Fund</div>
                <div>{parseFloat(contractBalance).toFixed(4)} ETH</div>
              </div>
              <div>
                <div className="font-bold">🎯 Total Brewed</div>
                <div>{parseFloat(totalDonations).toFixed(4)} ETH</div>
              </div>
            </div>
          </div>

          {recentDonations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-foreground mb-4 text-center">☕ Recent Coffee Lovers 💕</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="bg-card/70 border border-border p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-primary text-lg">
                          ☕ {parseFloat(donation.amount).toFixed(4)} ETH
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {formatAddress(donation.donor)} • {formatTimestamp(donation.timestamp)}
                        </div>
                        {donation.message && (
                          <div className="text-sm text-foreground bg-accent/10 border border-accent/20 p-2 rounded-lg">
                            💌 "{donation.message}"
                          </div>
                        )}
                      </div>
                      <div className="text-2xl animate-pulse">
                        {COFFEE_REACTIONS[index % COFFEE_REACTIONS.length]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {statusMessage && (
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

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};