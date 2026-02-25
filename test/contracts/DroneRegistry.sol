// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * DroneRegistry.sol
 * Manages drone registration and status tracking on Hedera
 */

contract DroneRegistry {
    struct Drone {
        string droneId;
        address owner;
        uint256 registeredAt;
        bool isActive;
        string missionStatus;
    }
    
    mapping(string => Drone) public drones;
    mapping(address => string[]) public ownerDrones;
    string[] public allDroneIds;
    
    event DroneRegistered(string indexed droneId, address indexed owner);
    event DroneStatusUpdated(string indexed droneId, string newStatus);
    event DroneDeactivated(string indexed droneId);
    
    function registerDrone(string memory droneId) public returns (bool) {
        require(bytes(drones[droneId].droneId).length == 0, "Drone already registered");
        
        Drone memory newDrone = Drone({
            droneId: droneId,
            owner: msg.sender,
            registeredAt: block.timestamp,
            isActive: true,
            missionStatus: "idle"
        });
        
        drones[droneId] = newDrone;
        ownerDrones[msg.sender].push(droneId);
        allDroneIds.push(droneId);
        
        emit DroneRegistered(droneId, msg.sender);
        return true;
    }
    
    function updateDroneStatus(string memory droneId, string memory newStatus) public {
        require(drones[droneId].owner == msg.sender, "Only drone owner can update");
        require(drones[droneId].isActive, "Drone is not active");
        
        drones[droneId].missionStatus = newStatus;
        emit DroneStatusUpdated(droneId, newStatus);
    }
    
    function deactivateDrone(string memory droneId) public {
        require(drones[droneId].owner == msg.sender, "Only drone owner can deactivate");
        drones[droneId].isActive = false;
        emit DroneDeactivated(droneId);
    }
    
    function getDrone(string memory droneId) public view returns (Drone memory) {
        return drones[droneId];
    }
    
    function getOwnerDrones(address owner) public view returns (string[] memory) {
        return ownerDrones[owner];
    }
    
    function getTotalDrones() public view returns (uint256) {
        return allDroneIds.length;
    }
}
