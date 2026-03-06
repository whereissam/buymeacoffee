// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/GiveMeCoffee.sol";

contract DeployGiveMeCoffee is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        GiveMeCoffee coffee = new GiveMeCoffee();

        vm.stopBroadcast();

        console.log("GiveMeCoffee deployed to:", address(coffee));
    }
}
