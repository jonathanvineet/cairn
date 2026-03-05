import { NextRequest } from "next/server";

const MIRROR_NODE_BASE = "https://testnet.mirrornode.hedera.com/api/v1";

/**
 * GET /api/drones/balance?accountId=0.0.XXXX
 * Proxy to Hedera Mirror Node to fetch live HBAR balance for a drone account.
 * Avoids CORS issues on the browser side.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
        return Response.json(
            { success: false, error: "Missing accountId query parameter" },
            { status: 400 }
        );
    }

    try {
        const url = `${MIRROR_NODE_BASE}/accounts/${encodeURIComponent(accountId)}`;
        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            // Revalidate every 30 seconds
            next: { revalidate: 30 },
        } as RequestInit);

        if (!res.ok) {
            if (res.status === 404) {
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

        return Response.json({
            success: true,
            balance: hbar,
            unit: "HBAR",
            accountId: data?.account ?? accountId,
        });
    } catch (error: any) {
        console.error(`[/api/drones/balance] Error for ${accountId}:`, error.message);
        return Response.json(
            { success: false, error: error.message || "Failed to fetch HBAR balance" },
            { status: 500 }
        );
    }
}
