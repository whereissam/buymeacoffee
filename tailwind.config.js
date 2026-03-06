/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        "pulse-slow": {
          '0%, 100%': {
            transform: 'translateX(-100%)',
          },
          '50%': {
            transform: 'translateX(100%)',
          },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        coffee: {
          primary: 'hsl(var(--coffee-primary))',
          'primary-foreground': 'hsl(var(--coffee-primary-foreground))',
          secondary: 'hsl(var(--coffee-secondary))',
          'secondary-foreground': 'hsl(var(--coffee-secondary-foreground))',
          background: 'hsl(var(--coffee-background))',
          surface: 'hsl(var(--coffee-surface))',
          'surface-secondary': 'hsl(var(--coffee-surface-secondary))',
          text: 'hsl(var(--coffee-text))',
          'text-muted': 'hsl(var(--coffee-text-muted))',
          border: 'hsl(var(--coffee-border))',
          accent: 'hsl(var(--coffee-accent))',
          success: 'hsl(var(--coffee-success))',
          warning: 'hsl(var(--coffee-warning))',
          error: 'hsl(var(--coffee-error))'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        // Skeuomorphism Light Mode
        '.skeuo-raised': {
          'background': 'linear-gradient(145deg, #f0f0f3, #d1d1d6)',
          'box-shadow': '20px 20px 40px #bebec4, -20px -20px 40px #ffffff, inset 2px 2px 4px rgba(255,255,255,0.3)',
          'border': '1px solid rgba(255, 255, 255, 0.5)',
          'border-radius': '12px',
        },
        '.skeuo-inset': {
          'background': 'linear-gradient(145deg, #d1d1d6, #f0f0f3)',
          'box-shadow': 'inset 20px 20px 40px #bebec4, inset -20px -20px 40px #ffffff',
          'border': '2px solid rgba(0, 0, 0, 0.05)',
          'border-radius': '12px',
        },
        '.skeuo-button': {
          'background': 'linear-gradient(145deg, #f0f0f3, #d1d1d6)',
          'box-shadow': '15px 15px 30px #bebec4, -15px -15px 30px #ffffff, inset 2px 2px 4px rgba(255,255,255,0.2)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
          'border-radius': '12px',
          'transition': 'all 0.2s ease',
          'position': 'relative',
        },
        '.skeuo-button:hover': {
          'box-shadow': '10px 10px 20px #bebec4, -10px -10px 20px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.4)',
          'transform': 'translateY(-2px)',
        },
        '.skeuo-button:active': {
          'box-shadow': 'inset 15px 15px 30px #bebec4, inset -15px -15px 30px #ffffff',
          'transform': 'translateY(0px)',
        },
        '.skeuo-card': {
          'background': 'linear-gradient(145deg, #f5f5f8, #e8e8ed)',
          'box-shadow': '25px 25px 50px #d1d1d6, -25px -25px 50px #ffffff, inset 2px 2px 6px rgba(255,255,255,0.3)',
          'border': '2px solid rgba(255, 255, 255, 0.4)',
          'border-radius': '16px',
        },
        
        // Skeuomorphism Dark Mode
        '.dark .skeuo-raised': {
          'background': 'linear-gradient(145deg, #2a2a2e, #1e1e22)',
          'box-shadow': '20px 20px 40px #161619, -20px -20px 40px #343438, inset 2px 2px 4px rgba(255,255,255,0.05)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.dark .skeuo-inset': {
          'background': 'linear-gradient(145deg, #1e1e22, #2a2a2e)',
          'box-shadow': 'inset 20px 20px 40px #161619, inset -20px -20px 40px #343438',
          'border': '2px solid rgba(255, 255, 255, 0.05)',
        },
        '.dark .skeuo-button': {
          'background': 'linear-gradient(145deg, #2a2a2e, #1e1e22)',
          'box-shadow': '15px 15px 30px #161619, -15px -15px 30px #343438, inset 2px 2px 4px rgba(255,255,255,0.02)',
          'border': '1px solid rgba(255, 255, 255, 0.08)',
        },
        '.dark .skeuo-button:hover': {
          'box-shadow': '10px 10px 20px #161619, -10px -10px 20px #343438, inset 4px 4px 8px rgba(255,255,255,0.05)',
        },
        '.dark .skeuo-button:active': {
          'box-shadow': 'inset 15px 15px 30px #161619, inset -15px -15px 30px #343438',
        },
        '.dark .skeuo-card': {
          'background': 'linear-gradient(145deg, #252529, #1a1a1e)',
          'box-shadow': '25px 25px 50px #0f0f11, -25px -25px 50px #2f2f33, inset 2px 2px 6px rgba(255,255,255,0.03)',
          'border': '2px solid rgba(255, 255, 255, 0.08)',
        },
        
        // Theme Toggle Button
        '.theme-toggle': {
          'position': 'fixed',
          'top': '20px',
          'right': '20px',
          'z-index': '50',
          'width': '60px',
          'height': '60px',
          'border-radius': '50%',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'font-size': '24px',
          'cursor': 'pointer',
          'transition': 'all 0.3s ease',
        },
      })
    }
  ]
}

