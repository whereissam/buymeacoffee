import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from './ui/button';

const CONTRACT_ABI = [
  "function donate(string memory _message) external payable",
  "function withdraw() external",
  "function getBalance() external view returns (uint256)",
  "function totalDonations() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function getRecentDonations(uint256 count) external view returns (address[] memory, uint256[] memory, string[] memory, uint256[] memory)",
  "event DonationReceived(address indexed donor, uint256 amount, string message, uint256 timestamp)"
];

interface CoffeeWidgetProps {
  contractAddress: string;
  title?: string;
}

interface Donation {
  donor: string;
  amount: string;
  message: string;
  timestamp: number;
}

export const CoffeeWidget: React.FC<CoffeeWidgetProps> = ({ 
  contractAddress, 
  title = "Buy Me a Coffee! ☕" 
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

  const predefinedAmounts = [
    { value: "0.001", label: "Small Coffee", emoji: "☕" },
    { value: "0.003", label: "Medium Coffee", emoji: "☕☕" },
    { value: "0.005", label: "Large Coffee", emoji: "☕☕☕" },
    { value: "0.01", label: "Meal", emoji: "🍽️" }
  ];

  const getContract = () => {
    if (!signer || !contractAddress) return null;
    return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
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
      setIsLoading(true);
      setStatusMessage("Preparing transaction...");

      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const donationAmount = ethers.parseEther(selectedAmount);
      
      setStatusMessage("Waiting for transaction confirmation...");
      const tx = await contract.donate(message, { value: donationAmount });
      
      setStatusMessage("Transaction submitted! Waiting for confirmation...");
      await tx.wait();
      
      setStatusMessage("Donation successful! Thank you for your support! 🎉");
      setMessage("");
      
      // Reload contract data
      await loadContractData();
      
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (err: any) {
      console.error('Donation failed:', err);
      if (err.code === 'ACTION_REJECTED') {
        setStatusMessage("Transaction cancelled by user.");
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        setStatusMessage("Insufficient funds for transaction.");
      } else {
        setStatusMessage("Donation failed. Please try again.");
      }
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = async () => {
    if (!signer || !isOwner) return;

    try {
      setIsLoading(true);
      setStatusMessage("Withdrawing funds...");

      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const tx = await contract.withdraw();
      await tx.wait();

      setStatusMessage("Withdrawal successful!");
      await loadContractData();
      
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (err: any) {
      console.error('Withdrawal failed:', err);
      setStatusMessage("Withdrawal failed. Please try again.");
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
    <div className="coffee-widget max-w-md mx-auto bg-card rounded-xl shadow-lg p-6 m-4">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{title}</h2>
      
      {web3Error && (
        <div className="bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {web3Error}
        </div>
      )}

      {!isConnected ? (
        <Button 
          onClick={connectWallet}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Connect Wallet
        </Button>
      ) : !isCorrectNetwork ? (
        <div className="text-center">
          <div className="bg-amber-100 border border-amber-400 text-amber-700 px-4 py-3 rounded mb-4">
            <strong>Wrong Network!</strong> Please switch to Base.
          </div>
          <Button 
            onClick={switchToBase}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            Switch to Base Network
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-center text-sm text-muted-foreground">
            Connected: {formatAddress(userAddress!)}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Choose Amount (ETH):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount.value}
                  onClick={() => setSelectedAmount(amount.value)}
                  className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                    selectedAmount === amount.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="font-semibold">{amount.emoji}</div>
                  <div>{amount.value} ETH</div>
                  <div className="text-xs">{amount.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Your Message (optional):
            </label>
            <input
              type="text"
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Thanks for the great content!"
              className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              maxLength={100}
            />
          </div>

          <Button
            onClick={sendDonation}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-4"
          >
            {isLoading ? "Processing..." : `Send ${selectedAmount} ETH ☕`}
          </Button>

          {isOwner && (
            <Button
              onClick={withdrawFunds}
              disabled={isLoading || contractBalance === "0.0"}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mb-4"
            >
              Withdraw Funds ({contractBalance} ETH)
            </Button>
          )}

          <div className="text-center text-sm text-muted-foreground mb-4">
            <div>Contract Balance: {parseFloat(contractBalance).toFixed(4)} ETH</div>
            <div>Total Donations: {parseFloat(totalDonations).toFixed(4)} ETH</div>
          </div>

          {recentDonations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Recent Donations</h3>
              <div className="space-y-2">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="bg-muted p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-primary">
                          {parseFloat(donation.amount).toFixed(4)} ETH
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatAddress(donation.donor)} • {formatTimestamp(donation.timestamp)}
                        </div>
                        {donation.message && (
                          <div className="text-sm text-foreground mt-1">
                            "{donation.message}"
                          </div>
                        )}
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
        <div className="mt-4 text-center text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          {statusMessage}
        </div>
      )}
    </div>
  );
};