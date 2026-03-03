export const BOUNDARY_ZONE_REGISTRY_ADDRESS = "0xeEFfE09953FDCB844Ff69B67e46E8474B70f0E69";
export const DRONE_REGISTRY_ADDRESS = "0x5CE1B45F7af14D864146C16D6E1b168Ae599cFCf";

export const BOUNDARY_ZONE_REGISTRY_ABI = [
	{
		"inputs": [
			{"internalType": "bytes32", "name": "id", "type": "bytes32"},
			{"internalType": "bytes", "name": "coords", "type": "bytes"}
		],
		"name": "createBoundaryZone",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllZoneIds",
		"outputs": [
			{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalZones",
		"outputs": [
			{"internalType": "uint256", "name": "", "type": "uint256"}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{"internalType": "bytes32", "name": "id", "type": "bytes32"}
		],
		"name": "getZone",
		"outputs": [
			{"internalType": "address", "name": "", "type": "address"},
			{"internalType": "uint256", "name": "", "type": "uint256"},
			{"internalType": "bytes", "name": "", "type": "bytes"}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export const DRONE_REGISTRY_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "cairnId",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "accountId",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "zoneId",
                "type": "string"
            }
        ],
        "name": "DroneRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "accountId",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            }
        ],
        "name": "DroneStatusUpdated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_cairnId",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "_accountId",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_zoneId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_model",
                "type": "string"
            }
        ],
        "name": "registerDrone",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "allDrones",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "cairnIdToAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "drones",
        "outputs": [
            {
                "internalType": "string",
                "name": "cairnId",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "accountId",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "zoneId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "model",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "registeredAt",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_accountId",
                "type": "address"
            }
        ],
        "name": "getDrone",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "cairnId",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "accountId",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "zoneId",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "model",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "registeredAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct DroneRegistry.Drone",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalDrones",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
