const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("GiveMeCoffee", function () {
  let giveMeCoffee;
  let owner;
  let donor1;
  let donor2;
  let nonOwner;

  beforeEach(async function () {
    [owner, donor1, donor2, nonOwner] = await ethers.getSigners();
    
    const GiveMeCoffee = await ethers.getContractFactory("GiveMeCoffee");
    giveMeCoffee = await GiveMeCoffee.deploy();
    await giveMeCoffee.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await giveMeCoffee.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero total donations", async function () {
      expect(await giveMeCoffee.totalDonations()).to.equal(0);
    });

    it("Should initialize with zero balance", async function () {
      expect(await giveMeCoffee.getBalance()).to.equal(0);
    });
  });

  describe("Donations", function () {
    it("Should accept donations via receive function", async function () {
      const donationAmount = ethers.parseEther("0.001");
      
      await expect(
        donor1.sendTransaction({
          to: giveMeCoffee.target,
          value: donationAmount
        })
      ).to.emit(giveMeCoffee, "DonationReceived");

      expect(await giveMeCoffee.totalDonations()).to.equal(donationAmount);
      expect(await giveMeCoffee.getBalance()).to.equal(donationAmount);
    });

    it("Should accept donations via donate function with message", async function () {
      const donationAmount = ethers.parseEther("0.003");
      const message = "Great work on the project!";
      
      await expect(
        giveMeCoffee.connect(donor1).donate(message, { value: donationAmount })
      ).to.emit(giveMeCoffee, "DonationReceived");

      expect(await giveMeCoffee.totalDonations()).to.equal(donationAmount);
      expect(await giveMeCoffee.getBalance()).to.equal(donationAmount);
    });

    it("Should reject zero value donations", async function () {
      await expect(
        giveMeCoffee.connect(donor1).donate("Test message", { value: 0 })
      ).to.be.revertedWith("Donation must be greater than 0");
    });

    it("Should track multiple donations correctly", async function () {
      const donation1 = ethers.parseEther("0.001");
      const donation2 = ethers.parseEther("0.005");
      
      await giveMeCoffee.connect(donor1).donate("First donation", { value: donation1 });
      await giveMeCoffee.connect(donor2).donate("Second donation", { value: donation2 });

      expect(await giveMeCoffee.totalDonations()).to.equal(donation1 + donation2);
      expect(await giveMeCoffee.getBalance()).to.equal(donation1 + donation2);
      expect(await giveMeCoffee.getDonationCount()).to.equal(2);
    });
  });

  describe("Donation History", function () {
    beforeEach(async function () {
      await giveMeCoffee.connect(donor1).donate("First donation", { 
        value: ethers.parseEther("0.001") 
      });
      await giveMeCoffee.connect(donor2).donate("Second donation", { 
        value: ethers.parseEther("0.003") 
      });
    });

    it("Should return correct donation details", async function () {
      const [donor, amount, message, timestamp] = await giveMeCoffee.getDonation(0);
      
      expect(donor).to.equal(donor1.address);
      expect(amount).to.equal(ethers.parseEther("0.001"));
      expect(message).to.equal("First donation");
      expect(timestamp).to.be.gt(0);
    });

    it("Should return recent donations in reverse chronological order", async function () {
      const [donors, amounts, messages, timestamps] = await giveMeCoffee.getRecentDonations(2);
      
      expect(donors[0]).to.equal(donor2.address);
      expect(amounts[0]).to.equal(ethers.parseEther("0.003"));
      expect(messages[0]).to.equal("Second donation");
      
      expect(donors[1]).to.equal(donor1.address);
      expect(amounts[1]).to.equal(ethers.parseEther("0.001"));
      expect(messages[1]).to.equal("First donation");
    });

    it("Should handle out of bounds donation index", async function () {
      await expect(
        giveMeCoffee.getDonation(10)
      ).to.be.revertedWith("Donation index out of bounds");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await giveMeCoffee.connect(donor1).donate("Test donation", { 
        value: ethers.parseEther("0.01") 
      });
    });

    it("Should allow owner to withdraw funds", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await giveMeCoffee.getBalance();
      
      await expect(
        giveMeCoffee.connect(owner).withdraw()
      ).to.emit(giveMeCoffee, "WithdrawalMade");

      expect(await giveMeCoffee.getBalance()).to.equal(0);
    });

    it("Should not allow non-owner to withdraw funds", async function () {
      await expect(
        giveMeCoffee.connect(nonOwner).withdraw()
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should not allow withdrawal when balance is zero", async function () {
      await giveMeCoffee.connect(owner).withdraw();
      
      await expect(
        giveMeCoffee.connect(owner).withdraw()
      ).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty donation history", async function () {
      const [donors, amounts, messages, timestamps] = await giveMeCoffee.getRecentDonations(5);
      
      expect(donors.length).to.equal(0);
      expect(amounts.length).to.equal(0);
      expect(messages.length).to.equal(0);
      expect(timestamps.length).to.equal(0);
    });

    it("Should handle requesting more donations than available", async function () {
      await giveMeCoffee.connect(donor1).donate("Only donation", { 
        value: ethers.parseEther("0.001") 
      });
      
      const [donors, amounts, messages, timestamps] = await giveMeCoffee.getRecentDonations(10);
      
      expect(donors.length).to.equal(1);
      expect(amounts.length).to.equal(1);
      expect(messages.length).to.equal(1);
      expect(timestamps.length).to.equal(1);
    });
  });
});