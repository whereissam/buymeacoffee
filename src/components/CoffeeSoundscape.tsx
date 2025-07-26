import React, { useState, useEffect, useRef } from 'react';

interface CoffeeSoundscapeProps {
  isActive: boolean;
  volume?: number;
}

const COFFEE_SOUNDS = {
  espresso: {
    name: "Espresso Machine",
    emoji: "☕",
    description: "Classic coffee shop vibes"
  },
  grinder: {
    name: "Coffee Grinder", 
    emoji: "🫘",
    description: "Fresh beans being ground"
  },
  steam: {
    name: "Steam Wand",
    emoji: "💨", 
    description: "Milk steaming sounds"
  },
  ambient: {
    name: "Café Chatter",
    emoji: "🗣️",
    description: "Background café atmosphere"
  },
  rain: {
    name: "Cozy Rain",
    emoji: "🌧️",
    description: "Perfect coding weather"
  }
};

// Web Audio API implementation for generating coffee shop sounds
class CoffeeSoundGenerator {
  private audioContext: AudioContext | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private createNoise(type: string): void {
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * 2;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    switch (type) {
      case 'espresso':
        bandpass.frequency.value = 2000;
        bandpass.Q.value = 10;
        gainNode.gain.value = 0.1;
        break;
      case 'steam':
        bandpass.frequency.value = 8000;
        bandpass.Q.value = 5;
        gainNode.gain.value = 0.08;
        break;
      case 'grinder':
        bandpass.frequency.value = 1000;
        bandpass.Q.value = 2;
        gainNode.gain.value = 0.06;
        break;
      case 'ambient':
        bandpass.frequency.value = 300;
        bandpass.Q.value = 1;
        gainNode.gain.value = 0.03;
        break;
      case 'rain':
        bandpass.frequency.value = 1500;
        bandpass.Q.value = 0.5;
        gainNode.gain.value = 0.04;
        break;
    }

    whiteNoise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    this.gainNodes.set(type, gainNode);
    whiteNoise.start();
  }

  startSound(type: string): void {
    if (this.gainNodes.has(type)) return;
    this.createNoise(type);
  }

  stopSound(type: string): void {
    const gainNode = this.gainNodes.get(type);
    if (gainNode && this.audioContext) {
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
      setTimeout(() => {
        this.gainNodes.delete(type);
      }, 500);
    }
  }

  setVolume(type: string, volume: number): void {
    const gainNode = this.gainNodes.get(type);
    if (gainNode) {
      gainNode.gain.value = volume * 0.1;
    }
  }

  stopAll(): void {
    for (const type of this.gainNodes.keys()) {
      this.stopSound(type);
    }
  }
}

export const CoffeeSoundscape: React.FC<CoffeeSoundscapeProps> = ({
  isActive,
  volume = 0.5
}) => {
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [masterVolume, setMasterVolume] = useState(volume);
  const soundGeneratorRef = useRef<CoffeeSoundGenerator | null>(null);

  useEffect(() => {
    soundGeneratorRef.current = new CoffeeSoundGenerator();
    return () => {
      if (soundGeneratorRef.current) {
        soundGeneratorRef.current.stopAll();
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive && soundGeneratorRef.current) {
      soundGeneratorRef.current.stopAll();
      setActiveSounds(new Set());
    }
  }, [isActive]);

  const toggleSound = (soundType: string) => {
    if (!soundGeneratorRef.current) return;

    const newActiveSounds = new Set(activeSounds);
    
    if (activeSounds.has(soundType)) {
      soundGeneratorRef.current.stopSound(soundType);
      newActiveSounds.delete(soundType);
    } else {
      soundGeneratorRef.current.startSound(soundType);
      soundGeneratorRef.current.setVolume(soundType, masterVolume);
      newActiveSounds.add(soundType);
    }
    
    setActiveSounds(newActiveSounds);
  };

  const handleVolumeChange = (newVolume: number) => {
    setMasterVolume(newVolume);
    if (soundGeneratorRef.current) {
      for (const soundType of activeSounds) {
        soundGeneratorRef.current.setVolume(soundType, newVolume);
      }
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-md w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <h3 className="font-bold text-card-foreground">Coffee Shop Vibes</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          {isExpanded ? 'Hide' : 'Show'} Controls
        </button>
      </div>

      {activeSounds.size > 0 && (
        <div className="mb-3 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground border border-accent/40 px-3 py-1 rounded-full text-sm">
            <span className="animate-pulse">🎵</span>
            <span>Playing {activeSounds.size} sound{activeSounds.size !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {isExpanded && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Master Volume: {Math.round(masterVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={masterVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted border border-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {Object.entries(COFFEE_SOUNDS).map(([key, sound]) => (
              <button
                key={key}
                onClick={() => toggleSound(key)}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  activeSounds.has(key)
                    ? 'border-accent bg-accent/20 text-accent-foreground'
                    : 'border-border bg-muted hover:border-primary hover:bg-primary/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sound.emoji}</span>
                  <div className="text-left">
                    <div className="font-medium text-foreground">{sound.name}</div>
                    <div className="text-xs text-muted-foreground">{sound.description}</div>
                  </div>
                </div>
                <div className="text-sm">
                  {activeSounds.has(key) ? (
                    <span className="text-accent animate-pulse">🔊</span>
                  ) : (
                    <span className="text-muted-foreground">🔇</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <div className="text-sm text-amber-800 text-center">
              <span className="font-medium">💡 Pro Tip:</span> Mix multiple sounds for the perfect coding atmosphere!
            </div>
          </div>
        </>
      )}

      {!isExpanded && activeSounds.size === 0 && (
        <div className="text-center text-gray-600 text-sm">
          Click "Show Controls" to start your coffee shop experience! ☕🎵
        </div>
      )}
    </div>
  );
};