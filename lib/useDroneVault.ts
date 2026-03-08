// lib/useDroneVault.ts
import { ethers } from "ethers";
import { DRONE_EVIDENCE_VAULT_ADDRESS, DRONE_EVIDENCE_VAULT_ABI } from "./contracts";
import { useWalletStore } from "@/stores/walletStore";
import { getConnector } from "./hedera-connector";
import { AccountId, ContractId, ContractExecuteTransaction, ContractFunctionParameters, Client } from "@hiero-ledger/sdk";

const getReadProvider = () =>
  new ethers.JsonRpcProvider("https://testnet.hashio.io/api");

const getReadContract = () =>
  new ethers.Contract(DRONE_EVIDENCE_VAULT_ADDRESS, DRONE_EVIDENCE_VAULT_ABI as ethers.InterfaceAbi, getReadProvider());

// Helper to execute contract calls via HashPack  
const executeContractCall = async (functionName: string, functionParameters: ContractFunctionParameters, gas: number = 100000) => {
  const connector = getConnector();
  const { selectedAccount } = useWalletStore.getState();
  
  if (!connector || !selectedAccount) {
    throw new Error("HashPack wallet not connected");
  }

  const accountId = AccountId.fromString(selectedAccount.id);
  
  // Convert EVM address to ContractId
  const contractId = ContractId.fromEvmAddress(0, 0, DRONE_EVIDENCE_VAULT_ADDRESS);
  
  // Create the transaction
  const transaction = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(gas)
    .setFunction(functionName, functionParameters);
  
  // Create a client and freeze the transaction
  const client = Client.forTestnet();
  client.setOperator(
    accountId,
    "0000000000000000000000000000000000000000000000000000000000000000" // Dummy key for freezing
  );
  
  await transaction.freezeWith(client);
  
  // Sign and execute with HashPack
  const signer = connector.getSigner(accountId);
  const result = await signer.call(transaction);
  
  return result;
};

export function useDroneVault() {

  const registerDrone = async (droneId: string) => {
    console.log("📝 Registering drone via HashPack:", droneId);
    
    const params = new ContractFunctionParameters()
      .addString(droneId);
    
    const result = await executeContractCall("registerDrone", params);
    console.log("✅ Drone registered:", result.transactionId.toString());
    return result;
  };

  const submitPatrol = async (
    droneId: string,
    zoneId: string,
    ipfsCid: string,
    dataHash: string
  ) => {
    console.log("📤 Submitting patrol via HashPack:", droneId, zoneId);
    
    // dataHash is already a 0x-prefixed 32-byte hex string, so just convert to bytes
    const params = new ContractFunctionParameters()
      .addString(droneId)
      .addString(zoneId)
      .addString(ipfsCid)
      .addBytes32(ethers.getBytes(dataHash) as Uint8Array);
    
    const result = await executeContractCall("submitPatrol", params, 500000);
    console.log("✅ Patrol submitted:", result.transactionId.toString());
    return result;
  };

  const recordBreach = async (
    patrolId: number,
    droneId: string,
    zoneId: string,
    lat: number,
    lng: number
  ) => {
    console.log("🚨 Recording breach via HashPack:", droneId, zoneId);
    
    const params = new ContractFunctionParameters()
      .addUint256(patrolId)
      .addString(droneId)
      .addString(zoneId)
      .addInt256(Math.round(lat * 1e6))
      .addInt256(Math.round(lng * 1e6));
    
    const result = await executeContractCall("recordBoundaryBreach", params, 500000);
    console.log("✅ Breach recorded:", result.transactionId.toString());
    return result;
  };

  const verifyPatrol = async (patrolId: number) => {
    const params = new ContractFunctionParameters()
      .addUint256(patrolId);
    
    const result = await executeContractCall("verifyPatrol", params);
    return result;
  };

  const getPatrol = async (patrolId: number) => {
    return await getReadContract().getPatrol(patrolId);
  };

  const getDronePatrols = async (droneId: string) => {
    return await getReadContract().getDronePatrols(droneId);
  };

  const getZonePatrols = async (zoneId: string) => {
    return await getReadContract().getZonePatrols(zoneId);
  };

  const getTotalPatrols = async () => {
    return await getReadContract().getTotalPatrols();
  };

  const getTotalAlerts = async () => {
    return await getReadContract().getTotalAlerts();
  };

  const getAlert = async (index: number) => {
    return await getReadContract().getAlert(index);
  };

  return {
    registerDrone,
    submitPatrol,
    recordBreach,
    verifyPatrol,
    getPatrol,
    getDronePatrols,
    getZonePatrols,
    getTotalPatrols,
    getTotalAlerts,
    getAlert,
  };
}

