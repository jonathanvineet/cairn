// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DroneEvidenceVault {

    struct PatrolRecord {
        uint256 patrolId;
        string droneId;
        string zoneId;
        string ipfsCid;        // full patrol dataset stored on IPFS
        bytes32 dataHash;      // hash of patrol data for verification
        uint256 timestamp;
        address submittedBy;
        bool verified;
    }

    struct BoundaryAlert {
        uint256 patrolId;
        string droneId;
        string zoneId;
        int256 latitude;
        int256 longitude;
        uint256 timestamp;
    }

    uint256 private patrolCounter;

    mapping(uint256 => PatrolRecord) public patrols;
    mapping(string => uint256[]) public dronePatrolIds;
    mapping(string => uint256[]) public zonePatrolIds;

    mapping(string => bool) public registeredDrones;

    BoundaryAlert[] public alerts;

    event DroneRegistered(
        string droneId
    );

    event PatrolSubmitted(
        uint256 indexed patrolId,
        string droneId,
        string zoneId,
        string ipfsCid,
        uint256 timestamp
    );

    event BoundaryBreachDetected(
        uint256 patrolId,
        string droneId,
        string zoneId,
        int256 latitude,
        int256 longitude,
        uint256 timestamp
    );

    event PatrolVerified(
        uint256 patrolId
    );

    modifier onlyRegisteredDrone(string memory droneId) {
        require(registeredDrones[droneId], "Drone not registered");
        _;
    }

    function registerDrone(string memory droneId) external {
        registeredDrones[droneId] = true;

        emit DroneRegistered(droneId);
    }

    function submitPatrol(
        string memory droneId,
        string memory zoneId,
        string memory ipfsCid,
        bytes32 dataHash
    )
        external
        onlyRegisteredDrone(droneId)
        returns (uint256)
    {
        patrolCounter++;

        PatrolRecord memory record = PatrolRecord({
            patrolId: patrolCounter,
            droneId: droneId,
            zoneId: zoneId,
            ipfsCid: ipfsCid,
            dataHash: dataHash,
            timestamp: block.timestamp,
            submittedBy: msg.sender,
            verified: false
        });

        patrols[patrolCounter] = record;

        dronePatrolIds[droneId].push(patrolCounter);
        zonePatrolIds[zoneId].push(patrolCounter);

        emit PatrolSubmitted(
            patrolCounter,
            droneId,
            zoneId,
            ipfsCid,
            block.timestamp
        );

        return patrolCounter;
    }

    function recordBoundaryBreach(
        uint256 patrolId,
        string memory droneId,
        string memory zoneId,
        int256 latitude,
        int256 longitude
    ) external {

        alerts.push(
            BoundaryAlert({
                patrolId: patrolId,
                droneId: droneId,
                zoneId: zoneId,
                latitude: latitude,
                longitude: longitude,
                timestamp: block.timestamp
            })
        );

        emit BoundaryBreachDetected(
            patrolId,
            droneId,
            zoneId,
            latitude,
            longitude,
            block.timestamp
        );
    }

    function verifyPatrol(uint256 patrolId) external {

        require(patrols[patrolId].patrolId != 0, "Patrol not found");

        patrols[patrolId].verified = true;

        emit PatrolVerified(patrolId);
    }

    function getDronePatrols(string memory droneId)
        external
        view
        returns (uint256[] memory)
    {
        return dronePatrolIds[droneId];
    }

    function getZonePatrols(string memory zoneId)
        external
        view
        returns (uint256[] memory)
    {
        return zonePatrolIds[zoneId];
    }

    function getPatrol(uint256 patrolId)
        external
        view
        returns (PatrolRecord memory)
    {
        return patrols[patrolId];
    }

    function getTotalPatrols()
        external
        view
        returns (uint256)
    {
        return patrolCounter;
    }

    function getTotalAlerts()
        external
        view
        returns (uint256)
    {
        return alerts.length;
    }

    function getAlert(uint256 index)
        external
        view
        returns (BoundaryAlert memory)
    {
        return alerts[index];
    }
}