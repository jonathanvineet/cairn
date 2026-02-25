// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * BoundaryZoneRegistry.sol
 * Manages drone registrations and their authorized zones
 */
contract BoundaryZoneRegistry {
    struct Drone {
        address accountId;
        string zoneId;
        uint256 registeredAt;
        bool isActive;
    }

    mapping(address => Drone) public drones;
    mapping(string => address[]) public zoneDrones;
    address[] public allDrones;
    address public owner;

    event DroneRegistered(address indexed droneAccount, string zoneId);
    event DroneStatusUpdated(address indexed droneAccount, bool isActive);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerDrone(address _droneAccount, string memory _zoneId) public returns (bool) {
        // In a real scenario, you might want to restrict this to certain officers
        require(drones[_droneAccount].accountId == address(0), "Drone already registered");

        drones[_droneAccount] = Drone({
            accountId: _droneAccount,
            zoneId: _zoneId,
            registeredAt: block.timestamp,
            isActive: true
        });

        zoneDrones[_zoneId].push(_droneAccount);
        allDrones.push(_droneAccount);

        emit DroneRegistered(_droneAccount, _zoneId);
        return true;
    }

    function isDroneAuthorized(address _droneAccount, string memory _zoneId) public view returns (bool) {
        Drone memory drone = drones[_droneAccount];
        return (drone.isActive && keccak256(bytes(drone.zoneId)) == keccak256(bytes(_zoneId)));
    }

    function getDronesInZone(string memory _zoneId) public view returns (address[] memory) {
        return zoneDrones[_zoneId];
    }
}
