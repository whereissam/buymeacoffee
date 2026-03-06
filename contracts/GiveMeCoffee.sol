// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GiveMeCoffee - Shared tipping protocol for Base
/// @notice One contract serves all creators. Non-custodial: each creator withdraws their own balance.
contract GiveMeCoffee is ReentrancyGuard {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public totalDonatedLifetime;

    event DonationReceived(
        address indexed creator,
        address indexed donor,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    event WithdrawalMade(
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Donate ETH to a creator with an optional short message
    /// @param creator The address of the creator to tip
    /// @param message A short memo (max 64 bytes)
    function donate(address creator, string calldata message) external payable {
        require(msg.value > 0, "Must send ETH");
        require(creator != address(0), "Invalid creator");
        require(bytes(message).length <= 64, "Message too long");

        balances[creator] += msg.value;
        totalDonatedLifetime[creator] += msg.value;

        emit DonationReceived(creator, msg.sender, msg.value, message, block.timestamp);
    }

    /// @notice Direct ETH transfers are rejected to force proper attribution via donate()
    receive() external payable {
        revert("Use donate()");
    }

    /// @notice Creator withdraws their full accumulated balance
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        balances[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit WithdrawalMade(msg.sender, amount, block.timestamp);
    }

    /// @notice Get a creator's current withdrawable balance
    function getBalance(address creator) external view returns (uint256) {
        return balances[creator];
    }

    /// @notice Get a creator's lifetime total donations received
    function getLifetimeTotal(address creator) external view returns (uint256) {
        return totalDonatedLifetime[creator];
    }
}
