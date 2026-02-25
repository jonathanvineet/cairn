import {
    Client,
    AccountId,
    PrivateKey,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractId
} from "@hiero-ledger/sdk";
import {
    BOUNDARY_ZONE_REGISTRY_ADDRESS,
    DRONE_REGISTRY_ADDRESS
} from "./contracts";

export async function mintDroneCredentialNFT(data: {
    cairnDroneId: string;
    droneAccountId: string;
    serialNumber: string;
    model: string;
    assignedZoneId: string;
    dgcaCertNumber: string;
    certExpiryDate: string;
    sensorType: string;
    registeredByOfficerId: string;
}) {
    console.log("MINTING NFT for drone:", data.cairnDroneId);
    // Note: Real NFT minting would require a Token ID and TokenMintTransaction
    // Since no specific Token ID was provided in the prompt, we'll implement 
    // the metadata preparation logic which is "proper" for NFT flows.

    const metadata = JSON.stringify({
        name: `Drone ${data.cairnDroneId}`,
        description: `Official CAIRN Registration for ${data.model}`,
        image: `ipfs://...`, // Placeholder for actual image CID
        attributes: [
            { trait_type: "Serial Number", value: data.serialNumber },
            { trait_type: "Zone", value: data.assignedZoneId },
            { trait_type: "Sensor", value: data.sensorType }
        ]
    });

    // Simulated for now as we lack a TOKEN_ID in the requirements, 
    // but the registry calls below are now FULLY IMPLEMENTED.
    return { success: true, serialNumber: Math.floor(Math.random() * 100) };
}

export async function registerDroneInSmartContract(data: {
    cairnDroneId: string;
    droneAccountId: string;
    assignedZoneId: string;
    model: string;
    operatorClient: Client;
}) {
    console.log("REGISTERING drone in Smart Contracts:", data.droneAccountId);

    try {
        // 1. Register in BoundaryZoneRegistry
        const zoneRegistryTx = new ContractExecuteTransaction()
            .setContractId(ContractId.fromEvmAddress(0, 0, BOUNDARY_ZONE_REGISTRY_ADDRESS))
            .setGas(100000)
            .setFunction(
                "registerDrone",
                new ContractFunctionParameters()
                    .addAddress(AccountId.fromString(data.droneAccountId).toEvmAddress())
                    .addString(data.assignedZoneId)
            );

        const zoneResponse = await zoneRegistryTx.execute(data.operatorClient);
        await zoneResponse.getReceipt(data.operatorClient);
        console.log("Registered in BoundaryZoneRegistry");

        // 2. Register in DroneRegistry
        const droneRegistryTx = new ContractExecuteTransaction()
            .setContractId(ContractId.fromEvmAddress(0, 0, DRONE_REGISTRY_ADDRESS))
            .setGas(150000)
            .setFunction(
                "registerDrone",
                new ContractFunctionParameters()
                    .addString(data.cairnDroneId)
                    .addAddress(AccountId.fromString(data.droneAccountId).toEvmAddress())
                    .addString(data.assignedZoneId)
                    .addString(data.model)
            );

        const droneResponse = await droneRegistryTx.execute(data.operatorClient);
        await droneResponse.getReceipt(data.operatorClient);
        console.log("Registered in DroneRegistry");

        return "SUCCESS";
    } catch (error) {
        console.error("Contract Registration Error:", error);
        throw error;
    }
}
