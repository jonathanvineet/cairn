// Persistent Database Implementation using Global Singleton pattern for Next.js
// In production, this should be replaced with Prisma or Supabase

interface Drone {
    id: string;
    cairnDroneId: string;
    hederaAccountId: string;
    hederaPublicKey: string;
    hederaPrivateKeyEncrypted: string;
    evmAddress: string;
    serialNumber: string;
    model: string;
    dgcaCertNumber: string;
    certExpiryDate: Date;
    assignedZoneId: string;
    sensorType: string;
    maxFlightMinutes: number;
    registeredByOfficerId: string;
    status: string;
    missionCount: number;
    completionRate: number | null;
    registeredAt: Date;
    initialHBARBalance: number;
}

declare global {
    var prismaMock: { drones: Drone[] } | undefined;
}

const memoryDb = global.prismaMock || { drones: [] };
if (process.env.NODE_ENV !== 'production') global.prismaMock = memoryDb;

export const db = {
    drones: {
        count: async () => {
            return memoryDb.drones.length;
        },
        create: async (data: any) => {
            const newDrone = {
                id: Math.random().toString(36).substring(7),
                ...data,
            };
            memoryDb.drones.push(newDrone);
            return newDrone;
        },
        findMany: async () => {
            return memoryDb.drones;
        },
        findByAccountId: async (accountId: string) => {
            return memoryDb.drones.find((d) => d.hederaAccountId === accountId);
        },
    },
};
