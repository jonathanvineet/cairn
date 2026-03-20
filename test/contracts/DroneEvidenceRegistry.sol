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

    struct EvidenceImage {
        uint256 evidenceId;
        string droneId;
        string zoneId;
        bytes32 imageHash;     // keccak256 hash of evidence image
        string ipfsCid;        // IPFS location of actual image
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
    uint256 private evidenceCounter;

    mapping(uint256 => PatrolRecord) public patrols;
    mapping(string => uint256[]) public dronePatrolIds;
    mapping(string => uint256[]) public zonePatrolIds;
    
    mapping(uint256 => EvidenceImage) public evidenceImages;
    mapping(string => uint256[]) public droneEvidenceIds;
    mapping(bytes32 => bool) public imageHashExists;

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

    event EvidenceImageSubmitted(
        uint256 indexed evidenceId,
        string droneId,
        string zoneId,
        bytes32 imageHash,
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

    /**
     * Submit evidence image directly to the blockchain
     * Can be called after or without patrol submission
     */
    function submitEvidenceImage(
        string memory droneId,
        string memory zoneId,
        bytes32 imageHash,
        string memory ipfsCid
    )
        external
        onlyRegisteredDrone(droneId)
        returns (uint256)
    {
        require(imageHash != bytes32(0), "Image hash cannot be empty");
        require(!imageHashExists[imageHash], "Evidence image already submitted");

        evidenceCounter++;

        EvidenceImage memory evidence = EvidenceImage({
            evidenceId: evidenceCounter,
            droneId: droneId,
            zoneId: zoneId,
            imageHash: imageHash,
            ipfsCid: ipfsCid,
            timestamp: block.timestamp,
            submittedBy: msg.sender,
            verified: false
        });

        evidenceImages[evidenceCounter] = evidence;
        droneEvidenceIds[droneId].push(evidenceCounter);
        imageHashExists[imageHash] = true;

        emit EvidenceImageSubmitted(
            evidenceCounter,
            droneId,
            zoneId,
            imageHash,
            ipfsCid,
            block.timestamp
        );

        return evidenceCounter;
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

    function getDroneEvidence(string memory droneId)
        external
        view
        returns (uint256[] memory)
    {
        return droneEvidenceIds[droneId];
    }

    function getEvidenceImage(uint256 evidenceId)
        external
        view
        returns (EvidenceImage memory)
    {
        return evidenceImages[evidenceId];
    }

    function getTotalEvidence()
        external
        view
        returns (uint256)
    {
        return evidenceCounter;
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