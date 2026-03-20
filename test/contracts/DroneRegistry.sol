// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * DroneRegistry.sol
 * Manages drone registration and credentials storage on Hedera
 * Encrypted private keys stored on-chain for autonomous agent signing
 */

contract DroneRegistry {
    struct Drone {
        string cairnId;
        address accountId;
        string zoneId;
        string model;
        string hederaAccountId;              // e.g., "0.0.5555"
        string encryptedPrivateKey;          // AES-256-CBC encrypted, hex-encoded
        string agentTopicId;                 // HCS topic for autonomous agent
        uint256 missionCount;                // Total missions submitted by this drone
        uint256 registeredAt;
        bool isActive;
    }

    mapping(address => Drone) public drones;
    mapping(string => address) public cairnIdToAddress;
    mapping(string => address) public hederaAccountIdToCairnAddress; // "0.0.5555" -> contract address
    address[] public allDrones;
    
    event DroneRegistered(
        string indexed cairnId, 
        address indexed accountId, 
        string hederaAccountId,
        string zoneId
    );
    event DroneCredentialsUpdated(string indexed cairnId, string hederaAccountId);
    event AgentTopicUpdated(string indexed cairnId, string agentTopicId);
    event DroneStatusUpdated(address indexed accountId, bool isActive);

    function registerDrone(
        string memory _cairnId,
        address _accountId,
        string memory _zoneId,
        string memory _model,
        string memory _hederaAccountId,
        string memory _encryptedPrivateKey
    ) public returns (bool) {
        require(drones[_accountId].accountId == address(0), "Drone already registered");
        require(bytes(_hederaAccountId).length > 0, "Hedera account ID required");
        require(bytes(_encryptedPrivateKey).length > 0, "Encrypted key required");
        
        drones[_accountId] = Drone({
            cairnId: _cairnId,
            accountId: _accountId,
            zoneId: _zoneId,
            model: _model,
            hederaAccountId: _hederaAccountId,
            encryptedPrivateKey: _encryptedPrivateKey,
            agentTopicId: "",
            missionCount: 0,
            registeredAt: block.timestamp,
            isActive: true
        });
        
        cairnIdToAddress[_cairnId] = _accountId;
        hederaAccountIdToCairnAddress[_hederaAccountId] = _accountId;
        allDrones.push(_accountId);
        
        emit DroneRegistered(_cairnId, _accountId, _hederaAccountId, _zoneId);
        return true;
    }

    function updateDroneCredentials(
        string memory _cairnId,
        string memory _hederaAccountId,
        string memory _encryptedPrivateKey
    ) external {
        address droneAddr = cairnIdToAddress[_cairnId];
        require(droneAddr != address(0), "Drone not found");
        require(bytes(_hederaAccountId).length > 0, "Hedera account ID required");
        require(bytes(_encryptedPrivateKey).length > 0, "Encrypted key required");
        
        drones[droneAddr].hederaAccountId = _hederaAccountId;
        drones[droneAddr].encryptedPrivateKey = _encryptedPrivateKey;
        
        hederaAccountIdToCairnAddress[_hederaAccountId] = droneAddr;
        
        emit DroneCredentialsUpdated(_cairnId, _hederaAccountId);
    }

    function updateAgentTopic(
        string memory _cairnId,
        string memory _agentTopicId
    ) external {
        address droneAddr = cairnIdToAddress[_cairnId];
        require(droneAddr != address(0), "Drone not found");
        require(bytes(_agentTopicId).length > 0, "Topic ID required");
        
        drones[droneAddr].agentTopicId = _agentTopicId;
        emit AgentTopicUpdated(_cairnId, _agentTopicId);
    }

    function incrementMissionCount(string memory _cairnId) external {
        address droneAddr = cairnIdToAddress[_cairnId];
        require(droneAddr != address(0), "Drone not found");
        
        drones[droneAddr].missionCount++;
    }

    function getMissionCount(string memory _cairnId) external view returns (uint256) {
        address droneAddr = cairnIdToAddress[_cairnId];
        require(droneAddr != address(0), "Drone not found");
        
        return drones[droneAddr].missionCount;
    }

    function getDrone(address _accountId) public view returns (Drone memory) {
        return drones[_accountId];
    }

    function getDroneByCAIRNId(string memory _cairnId) public view returns (Drone memory) {
        address droneAddr = cairnIdToAddress[_cairnId];
        require(droneAddr != address(0), "Drone not found");
        return drones[droneAddr];
    }

    function getDroneByHederaAccountId(string memory _hederaAccountId) public view returns (Drone memory) {
        address droneAddr = hederaAccountIdToCairnAddress[_hederaAccountId];
        require(droneAddr != address(0), "Drone not found");
        return drones[droneAddr];
    }
    
    function getTotalDrones() public view returns (uint256) {
        return allDrones.length;
    }

    function getAllDrones() public view returns (Drone[] memory) {
        Drone[] memory result = new Drone[](allDrones.length);
        for (uint256 i = 0; i < allDrones.length; i++) {
            result[i] = drones[allDrones[i]];
        }
        return result;
    }
}
