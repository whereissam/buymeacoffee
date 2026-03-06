import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useWeb3 } from '../hooks/useWeb3';
import { GIVE_ME_COFFEE_ABI } from '../config/contract';
import { Button } from './ui/button';

interface CoffeeWidgetProps {
  contractAddress: `0x${string}`;
  creatorAddress: `0x${string}`;
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
  creatorAddress,
  title = "Buy Me a Coffee!"
}) => {
  const { userAddress, isConnected, isCorrectNetwork, connectWallet, switchToBase } = useWeb3();

  const [selectedAmount, setSelectedAmount] = useState("0.001");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const predefinedAmounts = [
    { value: "0.001", label: "Small Coffee", emoji: "☕" },
    { value: "0.003", label: "Medium Coffee", emoji: "☕☕" },
    { value: "0.005", label: "Large Coffee", emoji: "☕☕☕" },
    { value: "0.01", label: "Meal", emoji: "🍽️" }
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

  useEffect(() => {
    if (donateSuccess) {
      setStatusMessage("Donation successful! Thank you for your support! 🎉");
      setMessage("");
      refetchBalance();
      refetchLifetime();
      setTimeout(() => setStatusMessage(""), 5000);
    }
  }, [donateSuccess]);

  useEffect(() => {
    if (withdrawSuccess) {
      setStatusMessage("Withdrawal successful!");
      refetchBalance();
      setTimeout(() => setStatusMessage(""), 5000);
    }
  }, [withdrawSuccess]);

  const sendDonation = () => {
    setStatusMessage("Waiting for confirmation...");
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
          setStatusMessage("Transaction cancelled by user.");
        } else {
          setStatusMessage("Donation failed. Please try again.");
        }
        setTimeout(() => setStatusMessage(""), 5000);
      }
    });
  };

  const withdrawFunds = () => {
    setStatusMessage("Withdrawing funds...");
    withdraw({
      address: contractAddress,
      abi: GIVE_ME_COFFEE_ABI,
      functionName: 'withdraw',
    }, {
      onError: (err) => {
        console.error('Withdrawal failed:', err);
        setStatusMessage("Withdrawal failed. Please try again.");
        setTimeout(() => setStatusMessage(""), 5000);
      }
    });
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const balanceDisplay = creatorBalance ? formatEther(creatorBalance) : "0";
  const lifetimeDisplay = lifetimeTotal ? formatEther(lifetimeTotal) : "0";
  const isLoading = isDonating || isWithdrawing;

  return (
    <div className="coffee-widget max-w-md mx-auto bg-card rounded-xl shadow-lg p-6 m-4">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{title}</h2>

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
                  className={`p-3 text-sm rounded-lg border-2 transition-colors cursor-pointer ${
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
              Your Message (optional, max 64 chars):
            </label>
            <input
              type="text"
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Thanks for the great content!"
              className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              maxLength={64}
            />
          </div>

          <Button
            onClick={sendDonation}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-4"
          >
            {isDonating ? "Processing..." : `Send ${selectedAmount} ETH ☕`}
          </Button>

          {isOwner && (
            <Button
              onClick={withdrawFunds}
              disabled={isLoading || balanceDisplay === "0"}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mb-4"
            >
              Withdraw Funds ({parseFloat(balanceDisplay).toFixed(4)} ETH)
            </Button>
          )}

          <div className="text-center text-sm text-muted-foreground mb-4">
            <div>Creator Balance: {parseFloat(balanceDisplay).toFixed(4)} ETH</div>
            <div>Lifetime Total: {parseFloat(lifetimeDisplay).toFixed(4)} ETH</div>
          </div>
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
