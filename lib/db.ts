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
    registrationLat: number;
    registrationLng: number;
}

interface Zone {
    id: string;
    zoneId: string;
    name: string;
    coordinates: { lat: number; lng: number }[];
    createdAt: Date;
    assignedDrones: string[];
}

declare global {
    var prismaMock: { 
        drones: Drone[];
        zones: Zone[];
    } | undefined;
}

const memoryDb = global.prismaMock || { drones: [], zones: [] };
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
        findByCairnId: async (cairnId: string) => {
            return memoryDb.drones.find((d) => d.cairnDroneId === cairnId);
        },
        findByEvmAddress: async (evmAddress: string) => {
            return memoryDb.drones.find((d) => d.evmAddress.toLowerCase() === evmAddress.toLowerCase());
        },
        update: async (id: string, data: any) => {
            const index = memoryDb.drones.findIndex((d) => d.id === id || d.cairnDroneId === id);
            if (index !== -1) {
                memoryDb.drones[index] = { ...memoryDb.drones[index], ...data };
                return memoryDb.drones[index];
            }
            return null;
        },
    },
    zones: {
        create: async (data: any) => {
            const newZone = {
                id: Math.random().toString(36).substring(7),
                assignedDrones: [],
                createdAt: new Date(),
                ...data,
            };
            memoryDb.zones.push(newZone);
            return newZone;
        },
        findByZoneId: async (zoneId: string) => {
            return memoryDb.zones.find((z) => z.zoneId === zoneId);
        },
        update: async (zoneId: string, data: any) => {
            const index = memoryDb.zones.findIndex((z) => z.zoneId === zoneId);
            if (index !== -1) {
                memoryDb.zones[index] = { ...memoryDb.zones[index], ...data };
                return memoryDb.zones[index];
            }
            return null;
        },
        findMany: async () => {
            return memoryDb.zones;
        },
        upsert: async (zoneId: string, data: any) => {
            const index = memoryDb.zones.findIndex((z) => z.zoneId === zoneId);
            if (index !== -1) {
                // Preserve existing assignedDrones if not provided
                const existing = memoryDb.zones[index];
                memoryDb.zones[index] = {
                    ...existing,
                    ...data,
                    assignedDrones: data.assignedDrones ?? existing.assignedDrones,
                };
                return memoryDb.zones[index];
            }
            const newZone = {
                id: Math.random().toString(36).substring(7),
                assignedDrones: [],
                createdAt: new Date(),
                ...data,
            };
            memoryDb.zones.push(newZone);
            return newZone;
        },
    },
};
