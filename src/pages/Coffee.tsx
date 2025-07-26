import { FunCoffeeWidget } from '../components/FunCoffeeWidget';
import { CoffeeSoundscape } from '../components/CoffeeSoundscape';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x98e6660178EB04D2de2687e7a61b082d81A5BFdf";

export const Coffee = () => {
  const [soundscapeActive, setSoundscapeActive] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-4">
            ✨ Magical Coffee Experience ✨
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Step into our enchanted coffee shop where every donation creates magic! ☕🪄
            Support creators with blockchain-powered coffee that tastes like innovation.
          </p>
          
          <button
            onClick={() => setSoundscapeActive(!soundscapeActive)}
            className="bg-primary text-primary-foreground px-6 py-3 font-bold transition-all duration-200 rounded-lg border border-border shadow-md hover:shadow-lg active:shadow-sm cursor-pointer"
          >
            {soundscapeActive ? '🔇 Turn Off' : '🎵 Turn On'} Coffee Shop Vibes
          </button>
        </div>

        {/* Prominent Call-to-Action Section */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              🚀 Ready to Deploy Your Coffee Contract?
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Connect your wallet to deploy your personal Buy Me Coffee smart contract on Base network!
            </p>
            <div className="bg-accent/20 border border-accent/40 rounded-lg p-4 inline-block">
              <div className="text-sm text-foreground">
                <strong>💡 What happens next:</strong>
                <div className="mt-2 text-left space-y-1">
                  <div>• Connect your MetaMask wallet</div>
                  <div>• Switch to Base network (fast & cheap!)</div>
                  <div>• Your contract is already deployed at:</div>
                  <div className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">
                    {CONTRACT_ADDRESS}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-accent/30">
                  <Link 
                    to="/contract-preview" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    🔍 Review Contract Details & Source Code →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6 flex flex-col items-center lg:items-stretch">
            <div className="w-full max-w-md lg:max-w-none">
              <CoffeeSoundscape isActive={soundscapeActive} />
            </div>
            <div className="bg-card border-2 border-primary/30 rounded-2xl shadow-lg p-2 w-full max-w-md lg:max-w-none">
              <FunCoffeeWidget contractAddress={CONTRACT_ADDRESS} />
            </div>
          </div>
        
          <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-4 text-center">
              🪄 How The Magic Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-muted border border-border rounded-lg p-3">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg border border-border shadow-sm">
                  🔗
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Connect & Cast Your Spell</h3>
                  <p className="text-muted-foreground text-sm">
                    Link your magical Web3 wallet to enter our enchanted coffee realm! ✨
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-muted border border-border rounded-lg p-3">
                <div className="bg-secondary text-secondary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg border border-border shadow-sm">
                  🌉
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Enter Base Kingdom</h3>
                  <p className="text-muted-foreground text-sm">
                    Switch to the mystical Base network where coffee flows fast and fees are tiny! 🏰
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-muted border border-border rounded-lg p-3">
                <div className="bg-accent text-accent-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg border border-border shadow-sm">
                  ☕
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Brew Your Magic Potion</h3>
                  <p className="text-muted-foreground text-sm">
                    Choose your coffee spell, craft a magical message, and brew some blockchain magic! 🪄
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-accent/20 border border-accent/40 rounded-lg p-3">
                <div className="bg-destructive text-destructive-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg border border-border shadow-sm">
                  💰
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Claim Your Coffee Tips</h3>
                  <p className="text-muted-foreground text-sm">
                    As the contract owner, you can withdraw all donated ETH to your wallet anytime using the "💰 Collect Coffee Tips" button! 🎉
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-4 text-center">
              🚀 Why Base is Magical
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-muted border border-border rounded-lg p-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-bold text-foreground">Lightning Fast Spells</div>
                  <div className="text-muted-foreground text-sm">Transactions complete faster than you can say "espresso"!</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-muted border border-border rounded-lg p-3">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="font-bold text-foreground">Pocket-Friendly Magic</div>
                  <div className="text-muted-foreground text-sm">Fees so low, you'll think it's actually magic! ✨</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-muted border border-border rounded-lg p-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <div className="font-bold text-foreground">Fortress-Level Security</div>
                  <div className="text-muted-foreground text-sm">Your coffee is protected by blockchain dragons! 🐲</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-muted border border-border rounded-lg p-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <div className="font-bold text-foreground">Global Coffee Portal</div>
                  <div className="text-muted-foreground text-sm">Send coffee magic anywhere in the multiverse! 🌌</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-card-foreground mb-3 text-center">
              🧙‍♂️ New to Web3 Magic?
            </h3>
            <div className="space-y-3 text-foreground">
              <p className="text-center font-medium">
                Don't worry, every wizard started somewhere! 🪄
              </p>
              <div className="bg-muted border border-border rounded-lg p-4">
                <div className="text-sm space-y-2">
                  <div>📱 <strong>Install MetaMask:</strong> Your magical wallet portal</div>
                  <div>🔗 <strong>Get Base Network:</strong> The kingdom of fast coffee</div>
                  <div>💧 <strong>Get Testnet ETH:</strong> Practice with fake gold first!</div>
                  <div>☕ <strong>Brew Away:</strong> Start your coffee adventure!</div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Remember: All transactions are final once the blockchain wizards approve them! 🧙‍♀️✨
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-card-foreground mb-3 text-center">
              🎁 Coffee Achievement System
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted border border-border rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">☕</div>
                <div className="font-bold text-foreground">First Sip</div>
                <div className="text-xs text-muted-foreground">0.001+ ETH</div>
              </div>
              <div className="bg-muted border border-border rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">☕☕</div>
                <div className="font-bold text-foreground">Coffee Lover</div>
                <div className="text-xs text-muted-foreground">0.01+ ETH</div>
              </div>
              <div className="bg-muted border border-border rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">☕☕☕</div>
                <div className="font-bold text-foreground">Caffeine Addict</div>
                <div className="text-xs text-muted-foreground">0.05+ ETH</div>
              </div>
              <div className="bg-muted border border-border rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🏆☕</div>
                <div className="font-bold text-foreground">Coffee Connoisseur</div>
                <div className="text-xs text-muted-foreground">0.1+ ETH</div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};