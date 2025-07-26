import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center bg-background min-h-screen pt-12 font-sans">
      <div className="mb-12">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-6">
          Coffee Widget Factory ☕🏭
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Create your own "Buy Me Coffee" widget in minutes! No coding required. 
          Deploy your smart contract, customize your widget, and start receiving crypto donations on any website.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/factory" className="cursor-pointer">
            <Button className="bg-primary hover:bg-accent text-primary-foreground px-10 py-4 text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 active:shadow-md cursor-pointer">
              🚀 Create Your Widget
            </Button>
          </Link>
          <Link to="/coffee" className="cursor-pointer">
            <Button variant="outline" className="px-6 py-4 text-lg border-2 border-border hover:bg-secondary text-foreground active:shadow-sm cursor-pointer">
              👀 See Demo
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium border border-border">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            <span>✨ Completely Free • 🔒 Your Contract • 🌍 Works Anywhere</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border border-border cursor-pointer">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">No-Code Setup</h3>
          <p className="text-muted-foreground">
            Create your coffee widget with our visual wizard - no programming or blockchain knowledge required!
          </p>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border border-border cursor-pointer">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Fully Customizable</h3>
          <p className="text-muted-foreground">
            Choose themes, colors, features, and donation amounts to match your brand perfectly.
          </p>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border border-border cursor-pointer">
          <div className="text-4xl mb-4">🌐</div>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Embed Anywhere</h3>
          <p className="text-muted-foreground">
            Get simple embed code that works on any website - WordPress, GitHub, personal sites, and more!
          </p>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-8 border border-border">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
          Create Your Coffee Shop in 4 Easy Steps 🚀
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg">
              🛠️
            </div>
            <h4 className="font-semibold text-foreground mb-2">Setup & Customize</h4>
            <p className="text-muted-foreground text-sm">
              Fill in your details, choose a theme, and customize your widget appearance
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-accent to-primary text-accent-foreground rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg">
              🚀
            </div>
            <h4 className="font-semibold text-foreground mb-2">One-Click Deploy</h4>
            <p className="text-muted-foreground text-sm">
              Deploy your smart contract to Base blockchain with a single click
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg">
              📋
            </div>
            <h4 className="font-semibold text-foreground mb-2">Copy & Embed</h4>
            <p className="text-muted-foreground text-sm">
              Get your embed code and paste it anywhere on the web - it's that simple!
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-accent to-destructive text-accent-foreground rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg">
              💰
            </div>
            <h4 className="font-semibold text-foreground mb-2">Start Earning</h4>
            <p className="text-muted-foreground text-sm">
              Watch donations roll in and withdraw your earnings whenever you want!
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/factory" className="cursor-pointer">
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 active:shadow-md cursor-pointer">
              Start Building Now! ☕🏗️
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
