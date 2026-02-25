import { BrowserProvider, JsonRpcSigner } from "ethers";

const HEDERA_TESTNET_PARAMS = {
    chainId: "0x128", // 296 in hex
    chainName: "Hedera Testnet",
    nativeCurrency: {
        name: "HBAR",
        symbol: "HBAR",
        decimals: 18,
    },
    rpcUrls: [process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api"],
    blockExplorerUrls: ["https://hashscan.io/testnet/"],
};

export async function connectMetaMask(): Promise<{
    address: string;
    provider: BrowserProvider;
    signer: JsonRpcSigner;
}> {
    if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed");
    }

    const provider = new BrowserProvider(window.ethereum);

    // Request account access
    const accounts = await provider.send("eth_requestAccounts", []);
    if (accounts.length === 0) {
        throw new Error("No accounts found in MetaMask");
    }

    // Switch to Hedera Testnet if needed
    try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: HEDERA_TESTNET_PARAMS.chainId }]);
    } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await provider.send("wallet_addEthereumChain", [HEDERA_TESTNET_PARAMS]);
            } catch (addError) {
                throw new Error("Could not add Hedera Testnet to MetaMask");
            }
        } else {
            throw switchError;
        }
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { address, provider, signer };
}

export function isMetaMaskInstalled(): boolean {
    return typeof window !== "undefined" && !!window.ethereum;
}
