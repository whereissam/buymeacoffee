// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract GiveMeCoffee {
    address public owner;
    uint256 public totalDonations;
    
    struct Donation {
        address donor;
        uint256 amount;
        string message;
        uint256 timestamp;
    }
    
    Donation[] public donations;
    
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        string message,
        uint256 timestamp
    );
    
    event WithdrawalMade(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    receive() external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        totalDonations += msg.value;
        
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            message: "",
            timestamp: block.timestamp
        }));
        
        emit DonationReceived(msg.sender, msg.value, "", block.timestamp);
    }
    
    function donate(string memory _message) external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        totalDonations += msg.value;
        
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        }));
        
        emit DonationReceived(msg.sender, msg.value, _message, block.timestamp);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit WithdrawalMade(owner, balance, block.timestamp);
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }
    
    function getDonation(uint256 index) external view returns (
        address donor,
        uint256 amount,
        string memory message,
        uint256 timestamp
    ) {
        require(index < donations.length, "Donation index out of bounds");
        Donation memory donation = donations[index];
        return (donation.donor, donation.amount, donation.message, donation.timestamp);
    }
    
    function getRecentDonations(uint256 count) external view returns (
        address[] memory donors,
        uint256[] memory amounts,
        string[] memory messages,
        uint256[] memory timestamps
    ) {
        uint256 totalCount = donations.length;
        uint256 returnCount = count > totalCount ? totalCount : count;
        
        if (returnCount == 0) {
            return (new address[](0), new uint256[](0), new string[](0), new uint256[](0));
        }
        
        donors = new address[](returnCount);
        amounts = new uint256[](returnCount);
        messages = new string[](returnCount);
        timestamps = new uint256[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 donationIndex = totalCount - 1 - i;
            Donation memory donation = donations[donationIndex];
            donors[i] = donation.donor;
            amounts[i] = donation.amount;
            messages[i] = donation.message;
            timestamps[i] = donation.timestamp;
        }
    }
}