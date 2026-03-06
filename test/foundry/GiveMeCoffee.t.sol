// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../contracts/GiveMeCoffee.sol";

contract GiveMeCoffeeTest is Test {
    GiveMeCoffee public coffee;
    address public creator1;
    address public creator2;
    address public donor1;
    address public donor2;

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

    function setUp() public {
        coffee = new GiveMeCoffee();
        creator1 = makeAddr("creator1");
        creator2 = makeAddr("creator2");
        donor1 = makeAddr("donor1");
        donor2 = makeAddr("donor2");

        vm.deal(donor1, 10 ether);
        vm.deal(donor2, 10 ether);
    }

    // --- Donate tests ---

    function test_DonateWithValidMessage() public {
        vm.prank(donor1);
        coffee.donate{value: 0.001 ether}(creator1, "Great work!");

        assertEq(coffee.getBalance(creator1), 0.001 ether);
        assertEq(coffee.getLifetimeTotal(creator1), 0.001 ether);
    }

    function test_DonateWithEmptyMessage() public {
        vm.prank(donor1);
        coffee.donate{value: 0.001 ether}(creator1, "");

        assertEq(coffee.getBalance(creator1), 0.001 ether);
    }

    function test_DonateRejectsZeroETH() public {
        vm.prank(donor1);
        vm.expectRevert("Must send ETH");
        coffee.donate{value: 0}(creator1, "hello");
    }

    function test_DonateRejectsMessageOver64Bytes() public {
        // 65 bytes
        string memory longMsg = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        assertEq(bytes(longMsg).length, 65);

        vm.prank(donor1);
        vm.expectRevert("Message too long");
        coffee.donate{value: 0.001 ether}(creator1, longMsg);
    }

    function test_DonateAcceptsExactly64Bytes() public {
        // 64 bytes
        string memory msg64 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        assertEq(bytes(msg64).length, 64);

        vm.prank(donor1);
        coffee.donate{value: 0.001 ether}(creator1, msg64);

        assertEq(coffee.getBalance(creator1), 0.001 ether);
    }

    function test_DonateRejectsZeroAddressCreator() public {
        vm.prank(donor1);
        vm.expectRevert("Invalid creator");
        coffee.donate{value: 0.001 ether}(address(0), "hello");
    }

    function test_DonateEmitsEvent() public {
        vm.prank(donor1);
        vm.expectEmit(true, true, false, true);
        emit DonationReceived(creator1, donor1, 0.001 ether, "hello", block.timestamp);
        coffee.donate{value: 0.001 ether}(creator1, "hello");
    }

    // --- Multiple creators ---

    function test_MultipleCreatorsCorrectBalanceTracking() public {
        vm.prank(donor1);
        coffee.donate{value: 0.003 ether}(creator1, "tip1");

        vm.prank(donor2);
        coffee.donate{value: 0.005 ether}(creator2, "tip2");

        vm.prank(donor1);
        coffee.donate{value: 0.002 ether}(creator2, "tip3");

        assertEq(coffee.getBalance(creator1), 0.003 ether);
        assertEq(coffee.getBalance(creator2), 0.007 ether);
        assertEq(coffee.getLifetimeTotal(creator1), 0.003 ether);
        assertEq(coffee.getLifetimeTotal(creator2), 0.007 ether);
    }

    // --- Withdraw tests ---

    function test_WithdrawFullBalance() public {
        vm.prank(donor1);
        coffee.donate{value: 1 ether}(creator1, "big tip");

        uint256 balBefore = creator1.balance;

        vm.prank(creator1);
        coffee.withdraw();

        assertEq(coffee.getBalance(creator1), 0);
        assertEq(creator1.balance, balBefore + 1 ether);
        // lifetime total stays
        assertEq(coffee.getLifetimeTotal(creator1), 1 ether);
    }

    function test_WithdrawWithZeroBalanceReverts() public {
        vm.prank(creator1);
        vm.expectRevert("No balance");
        coffee.withdraw();
    }

    function test_WithdrawEmitsEvent() public {
        vm.prank(donor1);
        coffee.donate{value: 0.01 ether}(creator1, "");

        vm.prank(creator1);
        vm.expectEmit(true, false, false, true);
        emit WithdrawalMade(creator1, 0.01 ether, block.timestamp);
        coffee.withdraw();
    }

    function test_WithdrawDoesNotAffectOtherCreator() public {
        vm.prank(donor1);
        coffee.donate{value: 1 ether}(creator1, "");

        vm.prank(donor2);
        coffee.donate{value: 2 ether}(creator2, "");

        vm.prank(creator1);
        coffee.withdraw();

        assertEq(coffee.getBalance(creator1), 0);
        assertEq(coffee.getBalance(creator2), 2 ether);
    }

    // --- receive() reverts ---

    function test_ReceiveReverts() public {
        vm.prank(donor1);
        vm.expectRevert("Use donate()");
        (bool success, ) = address(coffee).call{value: 0.001 ether}("");
        // The revert is caught by expectRevert, success is unused
        success; // silence warning
    }

    // --- Reentrancy test ---

    function test_ReentrancyAttackFails() public {
        ReentrancyAttacker attacker = new ReentrancyAttacker(coffee);
        vm.deal(address(attacker), 1 ether);

        // Donor tips the attacker's address
        vm.prank(donor1);
        coffee.donate{value: 1 ether}(address(attacker), "");

        // Attacker tries to reenter
        vm.expectRevert();
        attacker.attack();
    }
}

/// @notice Helper contract that attempts reentrancy on withdraw
contract ReentrancyAttacker {
    GiveMeCoffee public target;
    uint256 public attackCount;

    constructor(GiveMeCoffee _target) {
        target = _target;
    }

    function attack() external {
        target.withdraw();
    }

    receive() external payable {
        if (attackCount < 2) {
            attackCount++;
            target.withdraw();
        }
    }
}
