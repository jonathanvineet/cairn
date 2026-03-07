import { NextRequest } from "next/server";

const MIRROR_NODE_BASE = "https://testnet.mirrornode.hedera.com/api/v1";

/**
 * GET /api/drones/balance?accountId=0.0.XXXX or ?evmAddress=0x...
 * Proxy to Hedera Mirror Node to fetch live HBAR balance for a drone account.
 * Supports both Hedera Account ID and EVM address lookup.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const evmAddress = searchParams.get("evmAddress");

    if (!accountId && !evmAddress) {
        return Response.json(
            { success: false, error: "Missing accountId or evmAddress query parameter" },
            { status: 400 }
        );
    }

    try {
        let url: string;
        
        // If we have an accountId, use it directly
        if (accountId) {
            url = `${MIRROR_NODE_BASE}/accounts/${encodeURIComponent(accountId)}`;
        } 
        // Otherwise, query by EVM address
        else if (evmAddress) {
            // Remove 0x prefix if present and convert to lowercase
            const cleanAddress = evmAddress.toLowerCase().replace(/^0x/, '');
            url = `${MIRROR_NODE_BASE}/accounts/${cleanAddress}`;
        } else {
            return Response.json(
                { success: false, error: "Invalid parameters" },
                { status: 400 }
            );
        }

        console.log(`[Balance API] Fetching balance from: ${url}`);
        
        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            // Revalidate every 30 seconds
            next: { revalidate: 30 },
        } as RequestInit);

        if (!res.ok) {
            if (res.status === 404) {
                console.error(`[Balance API] Account not found: ${accountId || evmAddress}`);
                return Response.json(
                    { success: false, error: "Account not found on Hedera testnet" },
                    { status: 404 }
                );
            }
            throw new Error(`Mirror Node responded with ${res.status}`);
        }

        const data = await res.json();

        // balances.balance is in tinybars; 1 HBAR = 100_000_000 tinybars
        const tinybars: number = data?.balance?.balance ?? 0;
        const hbar = tinybars / 100_000_000;

        console.log(`[Balance API] Success: ${hbar} HBAR for account ${data?.account}`);

        return Response.json({
            success: true,
            balance: hbar,
            unit: "HBAR",
            accountId: data?.account ?? accountId,
            evmAddress: data?.evm_address ?? evmAddress,
        });
    } catch (error: any) {
        console.error(`[/api/drones/balance] Error for ${accountId || evmAddress}:`, error.message);
        return Response.json(
            { success: false, error: error.message || "Failed to fetch HBAR balance" },
            { status: 500 }
        );
    }
}
