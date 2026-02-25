// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * MissionTracker.sol
 * Tracks drone missions and payload delivery on Hedera
 */

contract MissionTracker {
    enum MissionStatus { PENDING, ACTIVE, COMPLETED, FAILED, CANCELLED }
    
    struct Mission {
        uint256 missionId;
        string droneId;
        address coordinator;
        uint256 startTime;
        uint256 estimatedEndTime;
        MissionStatus status;
        string destination;
        uint256 altitudeLimit;
    }
    
    mapping(uint256 => Mission) public missions;
    uint256 public missionCounter = 0;
    
    event MissionCreated(uint256 indexed missionId, string droneId, address coordinator);
    event MissionStatusChanged(uint256 indexed missionId, MissionStatus newStatus);
    event MissionCompleted(uint256 indexed missionId, uint256 completionTime);
    
    function createMission(
        string memory droneId,
        uint256 estimatedDuration,
        string memory destination,
        uint256 altitudeLimit
    ) public returns (uint256) {
        uint256 missionId = missionCounter++;
        
        missions[missionId] = Mission({
            missionId: missionId,
            droneId: droneId,
            coordinator: msg.sender,
            startTime: block.timestamp,
            estimatedEndTime: block.timestamp + estimatedDuration,
            status: MissionStatus.PENDING,
            destination: destination,
            altitudeLimit: altitudeLimit
        });
        
        emit MissionCreated(missionId, droneId, msg.sender);
        return missionId;
    }
    
    function startMission(uint256 missionId) public {
        require(missions[missionId].coordinator == msg.sender, "Only coordinator can start");
        require(missions[missionId].status == MissionStatus.PENDING, "Mission not pending");
        
        missions[missionId].status = MissionStatus.ACTIVE;
        missions[missionId].startTime = block.timestamp;
        emit MissionStatusChanged(missionId, MissionStatus.ACTIVE);
    }
    
    function completeMission(uint256 missionId) public {
        require(missions[missionId].coordinator == msg.sender, "Only coordinator can complete");
        require(missions[missionId].status == MissionStatus.ACTIVE, "Mission not active");
        
        missions[missionId].status = MissionStatus.COMPLETED;
        emit MissionCompleted(missionId, block.timestamp);
    }
    
    function failMission(uint256 missionId) public {
        require(missions[missionId].coordinator == msg.sender, "Only coordinator can fail");
        missions[missionId].status = MissionStatus.FAILED;
        emit MissionStatusChanged(missionId, MissionStatus.FAILED);
    }
    
    function getMission(uint256 missionId) public view returns (Mission memory) {
        return missions[missionId];
    }
}
