// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract BoundaryZoneRegistry {
    struct Zone {
        address creator;
        uint256 timestamp;
        bytes coords;
    }

    mapping(bytes32 => Zone) zones;
    bytes32[] ids;

    function createBoundaryZone(bytes32 id, bytes calldata coords) external payable {
        require(msg.value >= 0.01 ether);
        require(zones[id].timestamp == 0);
        zones[id] = Zone(msg.sender, block.timestamp, coords);
        ids.push(id);
    }

    function getZone(bytes32 id) external view returns (address, uint256, bytes memory) {
        Zone memory z = zones[id];
        return (z.creator, z.timestamp, z.coords);
    }

    function getAllZoneIds() external view returns (bytes32[] memory) {
        return ids;
    }

    function getTotalZones() external view returns (uint256) {
        return ids.length;
    }
}
