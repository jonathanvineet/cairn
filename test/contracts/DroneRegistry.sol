// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * DroneRegistry.sol
 * Manages drone registration and status tracking on Hedera
 */

contract DroneRegistry {
    struct Drone {
        string cairnId;
        address accountId;
        string zoneId;
        string model;
        uint256 registeredAt;
        bool isActive;
    }

    mapping(address => Drone) public drones;
    mapping(string => address) public cairnIdToAddress;
    address[] public allDrones;
    
    event DroneRegistered(string cairnId, address indexed accountId, string zoneId);
    event DroneStatusUpdated(address indexed accountId, bool isActive);

    function registerDrone(
        string memory _cairnId,
        address _accountId,
        string memory _zoneId,
        string memory _model
    ) public returns (bool) {
        require(drones[_accountId].accountId == address(0), "Drone already registered");
        
        drones[_accountId] = Drone({
            cairnId: _cairnId,
            accountId: _accountId,
            zoneId: _zoneId,
            model: _model,
            registeredAt: block.timestamp,
            isActive: true
        });
        
        cairnIdToAddress[_cairnId] = _accountId;
        allDrones.push(_accountId);
        
        emit DroneRegistered(_cairnId, _accountId, _zoneId);
        return true;
    }

    function getDrone(address _accountId) public view returns (Drone memory) {
        return drones[_accountId];
    }
    
    function getTotalDrones() public view returns (uint256) {
        return allDrones.length;
    }
}
