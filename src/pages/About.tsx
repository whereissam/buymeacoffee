export function About() {
  return (
    <div className="container mx-auto p-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-card-foreground mb-6 text-center">About Coffee Widget Factory</h1>
          
          <div className="space-y-6 text-foreground">
            <p className="text-lg text-muted-foreground text-center">
              Empowering creators with blockchain-powered coffee donations
            </p>
            
            <div className="bg-muted border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                We believe every creator deserves an easy way to receive support from their community. 
                Our platform combines the simplicity of "Buy Me a Coffee" with the power and 
                transparency of blockchain technology.
              </p>
            </div>
            
            <div className="bg-muted border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Why Blockchain?</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Truly Yours:</strong> You own and control your smart contract</li>
                <li>• <strong>Global Reach:</strong> Accept donations from anywhere in the world</li>
                <li>• <strong>Low Fees:</strong> Built on Base for minimal transaction costs</li>
                <li>• <strong>Transparent:</strong> All transactions are publicly verifiable</li>
              </ul>
            </div>
            
            <div className="bg-muted border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Built For Everyone</h2>
              <p className="text-muted-foreground">
                Whether you're a content creator, artist, developer, or anyone sharing value with the world, 
                our platform makes it simple to set up your own coffee shop without any technical knowledge required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
