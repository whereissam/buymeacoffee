import React, { useState } from 'react';

interface MessageCustomizerProps {
  message: string;
  onMessageChange: (message: string) => void;
}

const MESSAGE_CATEGORIES = {
  coffee: {
    name: "Coffee Vibes ☕",
    messages: [
      "Your coffee tastes like success! ☕✨",
      "Brewing up some magic! 🪄☕",
      "This coffee hits different! 💯☕",
      "Fueling creativity, one sip at a time! 🚀☕",
      "Coffee is my love language! 💕☕",
      "Bean there, done that - you're awesome! 🫘😄",
      "Espresso yourself - keep creating! ☕🎨",
      "Grounds for celebration! 🎉☕"
    ]
  },
  support: {
    name: "Support & Love 💖",
    messages: [
      "Keep doing what you're doing! 🌟",
      "Your work makes my day! ☀️",
      "Supporting amazing creators! 🙌",
      "You deserve all the good things! ✨",
      "Thank you for sharing your talent! 🎭",
      "Building something beautiful together! 🏗️💕",
      "Your passion is contagious! 🔥",
      "Making the internet a better place! 🌍"
    ]
  },
  fun: {
    name: "Fun & Quirky 🎉",
    messages: [
      "Take my money and make more cool stuff! 💰😎",
      "Shut up and take my crypto! 🤑",
      "This is better than Netflix! 📺➡️☕",
      "I'd rather tip you than buy ads! 📢❌",
      "Converting caffeine to code! 💻☕",
      "Funding your coffee addiction responsibly! 😄",
      "My wallet is lighter, my heart is fuller! 💝",
      "Consider this a blockchain hug! 🤗⛓️"
    ]
  },
  motivational: {
    name: "Motivational 🚀",
    messages: [
      "Keep pushing boundaries! 🚀",
      "Your innovation inspires me! 💡",
      "Building the future, one line at a time! 🏗️",
      "Your dedication doesn't go unnoticed! 👀",
      "Keep leveling up! ⬆️",
      "The world needs more creators like you! 🌎",
      "Excellence deserves recognition! 🏆",
      "Keep being awesome! ⭐"
    ]
  }
};

const EMOJI_COLLECTIONS = {
  coffee: ["☕", "🥤", "🫖", "🥛", "🧋", "🍵"],
  hearts: ["💖", "💕", "💝", "💗", "💓", "💞"],
  celebration: ["🎉", "🎊", "🥳", "🎈", "🎁", "🏆"],
  fire: ["🔥", "⚡", "✨", "💫", "⭐", "🌟"],
  tech: ["💻", "🚀", "⚙️", "🔧", "💡", "🎯"],
  money: ["💰", "💎", "🪙", "💵", "🤑", "🏦"]
};

export const MessageCustomizer: React.FC<MessageCustomizerProps> = ({
  message,
  onMessageChange
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('coffee');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const addEmoji = (emoji: string) => {
    const newMessage = message + emoji;
    if (newMessage.length <= 100) {
      onMessageChange(newMessage);
    }
  };

  const selectPresetMessage = (presetMessage: string) => {
    onMessageChange(presetMessage);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-card-foreground">💌 Customize Your Message</h3>
        <div className="text-xs text-muted-foreground">
          {message.length}/100
        </div>
      </div>

      {/* Message Input */}
      <div className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type your custom message..."
          className="w-full px-3 py-2 border-2 border-border bg-background text-foreground rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          maxLength={100}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(MESSAGE_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
              activeCategory === key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Preset Messages */}
      <div className="mb-4 max-h-32 overflow-y-auto">
        <div className="grid gap-2">
          {MESSAGE_CATEGORIES[activeCategory as keyof typeof MESSAGE_CATEGORIES].messages.map((msg, index) => (
            <button
              key={index}
              onClick={() => selectPresetMessage(msg)}
              className="text-left text-sm p-2 bg-muted text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg border border-border transition-colors cursor-pointer"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      {/* Emoji Collections */}
      <div className="border-t border-border pt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Quick Emojis:</span>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            {showEmojiPicker ? 'Hide' : 'Show More'} 🎨
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {EMOJI_COLLECTIONS.coffee.map((emoji, index) => (
            <button
              key={index}
              onClick={() => addEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 hover:bg-accent rounded cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {showEmojiPicker && (
          <div className="grid grid-cols-6 gap-2 p-2 bg-muted border border-border rounded-lg">
            {Object.entries(EMOJI_COLLECTIONS).map(([category, emojis]) => (
              <div key={category} className="col-span-6">
                <div className="text-xs text-muted-foreground mb-1 capitalize">{category}:</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => addEmoji(emoji)}
                      className="text-lg hover:scale-125 transition-transform p-1 hover:bg-accent rounded cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};