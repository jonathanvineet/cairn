// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * BoundaryZoneRegistry.sol
 * Manages drone registrations, authorized zones, and boundary creation with payment
 */
contract BoundaryZoneRegistry {
    struct Drone {
        address accountId;
        string zoneId;
        uint256 registeredAt;
        bool isActive;
    }

    struct Zone {
        string zoneId;
        address createdBy;
        uint256 createdAt;
        bool exists;
    }

    mapping(address => Drone) public drones;
    mapping(string => address[]) public zoneDrones;
    mapping(string => Zone) public zones;
    address[] public allDrones;
    address public owner;
    uint256 public boundaryCreationFee = 0.01 ether; // Fee for creating boundary zones

    event DroneRegistered(address indexed droneAccount, string zoneId);
    event DroneStatusUpdated(address indexed droneAccount, bool isActive);
    event ZoneCreated(string indexed zoneId, address indexed creator, uint256 fee);
    event BoundaryFeeUpdated(uint256 newFee);
    event FundsWithdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Create boundary zone with payment
    function createBoundaryZone(string memory _zoneId) public payable returns (bool) {
        require(msg.value >= boundaryCreationFee, "Insufficient payment for boundary creation");
        require(!zones[_zoneId].exists, "Zone already exists");

        zones[_zoneId] = Zone({
            zoneId: _zoneId,
            createdBy: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        emit ZoneCreated(_zoneId, msg.sender, msg.value);
        return true;
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

    function getBoundaryCreationFee() public view returns (uint256) {
        return boundaryCreationFee;
    }

    function updateBoundaryFee(uint256 _newFee) public onlyOwner {
        boundaryCreationFee = _newFee;
        emit BoundaryFeeUpdated(_newFee);
    }

    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner, balance);
    }

    receive() external payable {}
}
