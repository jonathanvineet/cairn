// Mock Database Implementation
// In a real app, this would be Prisma or Supabase client

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

// In-memory store (volatile)
let drones: Drone[] = [];

export const db = {
    drones: {
        count: async () => {
            return drones.length;
        },
        create: async (data: any) => {
            const newDrone = {
                id: Math.random().toString(36).substring(7),
                ...data,
            };
            drones.push(newDrone);
            return newDrone;
        },
        findMany: async () => {
            return drones;
        },
        findByAccountId: async (accountId: string) => {
            return drones.find((d) => d.hederaAccountId === accountId);
        },
    },
};
