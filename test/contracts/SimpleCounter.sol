// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * SimpleCounter.sol
 * A basic smart contract for testing on Hedera
 * Demonstrates: contract deployment, state management, and transactions
 */

contract SimpleCounter {
    uint256 private count = 0;
    address public owner;
    
    event CountIncremented(uint256 newCount);
    event CountDecremented(uint256 newCount);
    event CountReset(address resetBy);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    function increment() public {
        count += 1;
        emit CountIncremented(count);
    }
    
    function decrement() public {
        require(count > 0, "Count cannot be negative");
        count -= 1;
        emit CountDecremented(count);
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }
    
    function setCount(uint256 newCount) public onlyOwner {
        count = newCount;
    }
    
    function reset() public onlyOwner {
        count = 0;
        emit CountReset(msg.sender);
    }
}
