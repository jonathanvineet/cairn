import type {
  Zone, Checkpoint, Mission, InspectionRecord,
  Incident, Alert, User
} from '@/types'

// ── USERS ──────────────────────────────────────────────────────────────────
export const DEMO_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Arjun Nair',
    email: 'arjun@cairn.app',
    role: 'SUPER_ADMIN',
    hederaAccountId: '0.0.3456789',
    assignedZoneIds: [],
  },
  {
    id: 'user-002',
    name: 'Priya Krishnan',
    email: 'priya@cairn.app',
    role: 'ADMIN',
    hederaAccountId: '0.0.3456790',
    assignedZoneIds: ['zone-001', 'zone-002', 'zone-003', 'zone-004'],
  },
  {
    id: 'user-003',
    name: 'Rajan Pillai',
    email: 'rajan@cairn.app',
    role: 'OPERATOR',
    hederaAccountId: '0.0.3456791',
    assignedZoneIds: ['zone-001', 'zone-002'],
  },
  {
    id: 'user-004',
    name: 'Deepa Menon',
    email: 'deepa@cairn.app',
    role: 'OPERATOR',
    hederaAccountId: '0.0.3456792',
    assignedZoneIds: ['zone-003', 'zone-004'],
  },
  {
    id: 'user-005',
    name: 'Suresh Babu',
    email: 'suresh@cairn.app',
    role: 'STAKEHOLDER',
    assignedZoneIds: ['zone-001'],
  },
]

// ── CHECKPOINTS ───────────────────────────────────────────────────────────

const zone1Checkpoints: Checkpoint[] = [
  { id: 'cp-101', zoneId: 'zone-001', name: 'CP-01 Forest Edge North', sequenceNumber: 1, latitude: 11.4102, longitude: 76.6950, lastCondition: 'INTACT', lastInspectedAt: '2024-02-18T08:30:00Z' },
  { id: 'cp-102', zoneId: 'zone-001', name: 'CP-02 Ridge Marker', sequenceNumber: 2, latitude: 11.4155, longitude: 76.6978, lastCondition: 'INTACT', lastInspectedAt: '2024-02-18T08:45:00Z' },
  { id: 'cp-103', zoneId: 'zone-001', name: 'CP-03 Stream Crossing', sequenceNumber: 3, latitude: 11.4199, longitude: 76.7012, lastCondition: 'ANOMALY', lastInspectedAt: '2024-02-17T09:15:00Z' },
  { id: 'cp-104', zoneId: 'zone-001', name: 'CP-04 Tea Estate Boundary', sequenceNumber: 4, latitude: 11.4243, longitude: 76.7045, lastCondition: 'BREACH', lastInspectedAt: '2024-02-16T10:00:00Z' },
  { id: 'cp-105', zoneId: 'zone-001', name: 'CP-05 South Pillar', sequenceNumber: 5, latitude: 11.4210, longitude: 76.7090, lastCondition: 'BREACH', lastInspectedAt: '2024-02-16T10:20:00Z' },
  { id: 'cp-106', zoneId: 'zone-001', name: 'CP-06 Western Marker', sequenceNumber: 6, latitude: 11.4180, longitude: 76.7120, lastCondition: 'INTACT', lastInspectedAt: '2024-02-18T11:00:00Z' },
  { id: 'cp-107', zoneId: 'zone-001', name: 'CP-07 Lower Ridge', sequenceNumber: 7, latitude: 11.4140, longitude: 76.7088, lastCondition: 'BREACH', lastInspectedAt: '2024-02-16T11:30:00Z' },
  { id: 'cp-108', zoneId: 'zone-001', name: 'CP-08 North Return', sequenceNumber: 8, latitude: 11.4115, longitude: 76.7040, lastCondition: 'INTACT', lastInspectedAt: '2024-02-18T12:00:00Z' },
]

const zone2Checkpoints: Checkpoint[] = [
  { id: 'cp-201', zoneId: 'zone-002', name: 'CP-01 Corridor Entry', sequenceNumber: 1, latitude: 11.6850, longitude: 76.1320, lastCondition: 'INTACT', lastInspectedAt: '2024-02-19T07:00:00Z' },
  { id: 'cp-202', zoneId: 'zone-002', name: 'CP-02 Wildlife Crossing', sequenceNumber: 2, latitude: 11.6892, longitude: 76.1365, lastCondition: 'ANOMALY', lastInspectedAt: '2024-02-19T07:30:00Z' },
  { id: 'cp-203', zoneId: 'zone-002', name: 'CP-03 River Bend', sequenceNumber: 3, latitude: 11.6935, longitude: 76.1410, lastCondition: 'ANOMALY', lastInspectedAt: '2024-02-19T08:00:00Z' },
  { id: 'cp-204', zoneId: 'zone-002', name: 'CP-04 Coffee Estate Edge', sequenceNumber: 4, latitude: 11.6978, longitude: 76.1450, lastCondition: 'INTACT', lastInspectedAt: '2024-02-19T08:30:00Z' },
  { id: 'cp-205', zoneId: 'zone-002', name: 'CP-05 Hill Crest', sequenceNumber: 5, latitude: 11.7020, longitude: 76.1490, lastCondition: 'INTACT', lastInspectedAt: '2024-02-19T09:00:00Z' },
  { id: 'cp-206', zoneId: 'zone-002', name: 'CP-06 South Boundary', sequenceNumber: 6, latitude: 11.6990, longitude: 76.1535, lastCondition: 'ANOMALY', lastInspectedAt: '2024-02-18T14:00:00Z' },
  { id: 'cp-207', zoneId: 'zone-002', name: 'CP-07 Plantation Edge', sequenceNumber: 7, latitude: 11.6952, longitude: 76.1570, lastCondition: 'INTACT', lastInspectedAt: '2024-02-19T09:45:00Z' },
  { id: 'cp-208', zoneId: 'zone-002', name: 'CP-08 Valley View', sequenceNumber: 8, latitude: 11.6910, longitude: 76.1545, lastCondition: 'INTACT', lastInspectedAt: '2024-02-19T10:15:00Z' },
  { id: 'cp-209', zoneId: 'zone-002', name: 'CP-09 North Marker', sequenceNumber: 9, latitude: 11.6875, longitude: 76.1500, lastCondition: 'INTACT', lastInspectedAt: '2024-02-19T10:45:00Z' },
  { id: 'cp-210', zoneId: 'zone-002', name: 'CP-10 Entry Return', sequenceNumber: 10, latitude: 11.6860, longitude: 76.1460, lastCondition: 'INTACT', lastInspectedAt: '2024-02-19T11:15:00Z' },
]

const zone3Checkpoints: Checkpoint[] = [
  { id: 'cp-301', zoneId: 'zone-003', name: 'CP-01 Plantation North', sequenceNumber: 1, latitude: 12.4218, longitude: 75.7382, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T06:30:00Z' },
  { id: 'cp-302', zoneId: 'zone-003', name: 'CP-02 Eastern Boundary', sequenceNumber: 2, latitude: 12.4260, longitude: 75.7425, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T07:00:00Z' },
  { id: 'cp-303', zoneId: 'zone-003', name: 'CP-03 Forest Fringe', sequenceNumber: 3, latitude: 12.4302, longitude: 75.7465, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T07:30:00Z' },
  { id: 'cp-304', zoneId: 'zone-003', name: 'CP-04 Southern Gate', sequenceNumber: 4, latitude: 12.4285, longitude: 75.7510, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T08:00:00Z' },
  { id: 'cp-305', zoneId: 'zone-003', name: 'CP-05 West Marker', sequenceNumber: 5, latitude: 12.4243, longitude: 75.7545, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T08:30:00Z' },
  { id: 'cp-306', zoneId: 'zone-003', name: 'CP-06 Central Path', sequenceNumber: 6, latitude: 12.4200, longitude: 75.7512, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T09:00:00Z' },
]

const zone4Checkpoints: Checkpoint[] = [
  { id: 'cp-401', zoneId: 'zone-004', name: 'CP-01 Reserve Edge', sequenceNumber: 1, latitude: 10.4582, longitude: 77.0450, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T07:00:00Z' },
  { id: 'cp-402', zoneId: 'zone-004', name: 'CP-02 Tiger Corridor', sequenceNumber: 2, latitude: 10.4620, longitude: 77.0490, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T07:30:00Z' },
  { id: 'cp-403', zoneId: 'zone-004', name: 'CP-03 Elephant Path', sequenceNumber: 3, latitude: 10.4658, longitude: 77.0530, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T08:00:00Z' },
  { id: 'cp-404', zoneId: 'zone-004', name: 'CP-04 Water Source', sequenceNumber: 4, latitude: 10.4695, longitude: 77.0568, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T08:30:00Z' },
  { id: 'cp-405', zoneId: 'zone-004', name: 'CP-05 South Pillar', sequenceNumber: 5, latitude: 10.4730, longitude: 77.0605, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T09:00:00Z' },
  { id: 'cp-406', zoneId: 'zone-004', name: 'CP-06 Western Fringe', sequenceNumber: 6, latitude: 10.4715, longitude: 77.0650, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T09:30:00Z' },
  { id: 'cp-407', zoneId: 'zone-004', name: 'CP-07 Farm Boundary', sequenceNumber: 7, latitude: 10.4680, longitude: 77.0688, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T10:00:00Z' },
  { id: 'cp-408', zoneId: 'zone-004', name: 'CP-08 North Return', sequenceNumber: 8, latitude: 10.4645, longitude: 77.0652, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T10:30:00Z' },
  { id: 'cp-409', zoneId: 'zone-004', name: 'CP-09 Entry Marker', sequenceNumber: 9, latitude: 10.4608, longitude: 77.0618, lastCondition: 'INTACT', lastInspectedAt: '2024-02-20T11:00:00Z' },
]

// ── ZONES ─────────────────────────────────────────────────────────────────

export const DEMO_ZONES: Zone[] = [
  {
    id: 'zone-001',
    name: 'Nilgiris Forest Edge - Zone 04',
    region: 'Nilgiris',
    state: 'Tamil Nadu',
    status: 'BREACH',
    riskScore: 87,
    lengthKm: 8.4,
    checkpointCount: 8,
    lastInspectedAt: '2024-02-18T12:00:00Z',
    boundaryCoordinates: [
      [11.4102, 76.6950], [11.4155, 76.6978], [11.4199, 76.7012],
      [11.4243, 76.7045], [11.4210, 76.7090], [11.4180, 76.7120],
      [11.4140, 76.7088], [11.4115, 76.7040], [11.4102, 76.6950],
    ],
    checkpoints: zone1Checkpoints,
    stakeholderIds: ['user-005'],
    assignedOperatorIds: ['user-003'],
    patrolsThisWeek: 3,
    openAlerts: 4,
  },
  {
    id: 'zone-002',
    name: 'Wayanad Corridor - Zone 02',
    region: 'Wayanad',
    state: 'Kerala',
    status: 'ALERT',
    riskScore: 62,
    lengthKm: 12.1,
    checkpointCount: 10,
    lastInspectedAt: '2024-02-19T11:15:00Z',
    boundaryCoordinates: [
      [11.6850, 76.1320], [11.6892, 76.1365], [11.6935, 76.1410],
      [11.6978, 76.1450], [11.7020, 76.1490], [11.6990, 76.1535],
      [11.6952, 76.1570], [11.6910, 76.1545], [11.6875, 76.1500],
      [11.6860, 76.1460], [11.6850, 76.1320],
    ],
    checkpoints: zone2Checkpoints,
    stakeholderIds: [],
    assignedOperatorIds: ['user-003'],
    patrolsThisWeek: 5,
    openAlerts: 2,
  },
  {
    id: 'zone-003',
    name: 'Coorg Plantation Belt - Zone 01',
    region: 'Kodagu',
    state: 'Karnataka',
    status: 'ACTIVE',
    riskScore: 24,
    lengthKm: 6.8,
    checkpointCount: 6,
    lastInspectedAt: '2024-02-20T09:00:00Z',
    boundaryCoordinates: [
      [12.4218, 75.7382], [12.4260, 75.7425], [12.4302, 75.7465],
      [12.4285, 75.7510], [12.4243, 75.7545], [12.4200, 75.7512],
      [12.4218, 75.7382],
    ],
    checkpoints: zone3Checkpoints,
    stakeholderIds: [],
    assignedOperatorIds: ['user-004'],
    patrolsThisWeek: 7,
    openAlerts: 0,
  },
  {
    id: 'zone-004',
    name: 'Anamalai Tiger Reserve Edge',
    region: 'Pollachi',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    riskScore: 15,
    lengthKm: 9.2,
    checkpointCount: 9,
    lastInspectedAt: '2024-02-20T11:00:00Z',
    boundaryCoordinates: [
      [10.4582, 77.0450], [10.4620, 77.0490], [10.4658, 77.0530],
      [10.4695, 77.0568], [10.4730, 77.0605], [10.4715, 77.0650],
      [10.4680, 77.0688], [10.4645, 77.0652], [10.4608, 77.0618],
      [10.4582, 77.0450],
    ],
    checkpoints: zone4Checkpoints,
    stakeholderIds: [],
    assignedOperatorIds: ['user-004'],
    patrolsThisWeek: 6,
    openAlerts: 0,
  },
]

// ── MISSIONS ─────────────────────────────────────────────────────────────

export const DEMO_MISSIONS: Mission[] = [
  {
    id: 'mission-001',
    zoneId: 'zone-001',
    operatorId: 'user-003',
    status: 'COMPLETED',
    startedAt: '2024-02-18T08:00:00Z',
    completedAt: '2024-02-18T12:00:00Z',
    checkpointCount: 8,
    completedCheckpoints: 8,
    records: ['rec-001', 'rec-002', 'rec-003', 'rec-004', 'rec-005', 'rec-006', 'rec-007', 'rec-008'],
  },
  {
    id: 'mission-002',
    zoneId: 'zone-001',
    operatorId: 'user-003',
    status: 'COMPLETED',
    startedAt: '2024-02-17T09:00:00Z',
    completedAt: '2024-02-17T11:30:00Z',
    checkpointCount: 8,
    completedCheckpoints: 5,
    records: ['rec-009', 'rec-010', 'rec-011', 'rec-012', 'rec-013'],
  },
  {
    id: 'mission-003',
    zoneId: 'zone-001',
    operatorId: 'user-003',
    status: 'COMPLETED',
    startedAt: '2024-02-16T09:30:00Z',
    completedAt: '2024-02-16T12:00:00Z',
    checkpointCount: 8,
    completedCheckpoints: 8,
    records: ['rec-014', 'rec-015', 'rec-016', 'rec-017', 'rec-018', 'rec-019', 'rec-020', 'rec-021'],
  },
  {
    id: 'mission-004',
    zoneId: 'zone-002',
    operatorId: 'user-003',
    status: 'COMPLETED',
    startedAt: '2024-02-19T07:00:00Z',
    completedAt: '2024-02-19T11:30:00Z',
    checkpointCount: 10,
    completedCheckpoints: 10,
    records: ['rec-022', 'rec-023', 'rec-024', 'rec-025', 'rec-026', 'rec-027', 'rec-028', 'rec-029', 'rec-030', 'rec-031'],
  },
  {
    id: 'mission-005',
    zoneId: 'zone-003',
    operatorId: 'user-004',
    status: 'IN_PROGRESS',
    startedAt: '2024-02-20T06:30:00Z',
    checkpointCount: 6,
    completedCheckpoints: 4,
    currentCheckpointIndex: 4,
    records: ['rec-032', 'rec-033', 'rec-034', 'rec-035'],
  },
  {
    id: 'mission-006',
    zoneId: 'zone-004',
    operatorId: 'user-004',
    status: 'COMPLETED',
    startedAt: '2024-02-20T07:00:00Z',
    completedAt: '2024-02-20T11:15:00Z',
    checkpointCount: 9,
    completedCheckpoints: 9,
    records: ['rec-036', 'rec-037', 'rec-038', 'rec-039', 'rec-040', 'rec-041', 'rec-042', 'rec-043', 'rec-044'],
  },
]

// ── INSPECTION RECORDS ──────────────────────────────────────────────────

export const DEMO_RECORDS: InspectionRecord[] = [
  // Mission 001 — Zone 01 — Feb 18 (latest)
  { id: 'rec-001', missionId: 'mission-001', zoneId: 'zone-001', checkpointId: 'cp-101', operatorId: 'user-003', capturedAt: '2024-02-18T08:30:00Z', latitude: 11.4102, longitude: 76.6950, gpsAccuracy: 2.1, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', evidenceHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708245000.000', hederaConsensusTimestamp: '2024-02-18T08:31:22Z', hederaSequenceNumber: 841 },
  { id: 'rec-002', missionId: 'mission-001', zoneId: 'zone-001', checkpointId: 'cp-102', operatorId: 'user-003', capturedAt: '2024-02-18T08:45:00Z', latitude: 11.4155, longitude: 76.6978, gpsAccuracy: 1.8, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', evidenceHash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708245900.000', hederaConsensusTimestamp: '2024-02-18T08:46:15Z', hederaSequenceNumber: 842 },
  { id: 'rec-003', missionId: 'mission-001', zoneId: 'zone-001', checkpointId: 'cp-103', operatorId: 'user-003', capturedAt: '2024-02-18T09:10:00Z', latitude: 11.4199, longitude: 76.7012, gpsAccuracy: 3.2, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', evidenceHash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708247400.000', hederaConsensusTimestamp: '2024-02-18T09:11:08Z', hederaSequenceNumber: 843 },
  { id: 'rec-004', missionId: 'mission-001', zoneId: 'zone-001', checkpointId: 'cp-104', operatorId: 'user-003', capturedAt: '2024-02-18T09:35:00Z', latitude: 11.4243, longitude: 76.7045, gpsAccuracy: 2.5, condition: 'INTACT', notes: 'Minor vegetation growth noted near pillar', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8', evidenceHash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708248900.000', hederaConsensusTimestamp: '2024-02-18T09:36:45Z', hederaSequenceNumber: 844 },
  { id: 'rec-005', missionId: 'mission-001', zoneId: 'zone-001', checkpointId: 'cp-105', operatorId: 'user-003', capturedAt: '2024-02-18T10:00:00Z', latitude: 11.4210, longitude: 76.7090, gpsAccuracy: 2.8, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0', evidenceHash: 'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708250400.000', hederaConsensusTimestamp: '2024-02-18T10:01:30Z', hederaSequenceNumber: 845 },
  { id: 'rec-006', missionId: 'mission-001', zoneId: 'zone-001', checkpointId: 'cp-106', operatorId: 'user-003', capturedAt: '2024-02-18T10:25:00Z', latitude: 11.4180, longitude: 76.7120, gpsAccuracy: 1.9, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2', evidenceHash: 'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708251900.000', hederaConsensusTimestamp: '2024-02-18T10:26:10Z', hederaSequenceNumber: 846 },
  { id: 'rec-007', missionId: 'mission-001', zoneId: 'zone-001', checkpointId: 'cp-107', operatorId: 'user-003', capturedAt: '2024-02-18T11:00:00Z', latitude: 11.4140, longitude: 76.7088, gpsAccuracy: 2.2, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4', evidenceHash: 'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708254000.000', hederaConsensusTimestamp: '2024-02-18T11:01:55Z', hederaSequenceNumber: 847 },
  { id: 'rec-008', missionId: 'mission-001', zoneId: 'zone-001', checkpointId: 'cp-108', operatorId: 'user-003', capturedAt: '2024-02-18T12:00:00Z', latitude: 11.4115, longitude: 76.7040, gpsAccuracy: 2.0, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', evidenceHash: 'd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708257600.000', hederaConsensusTimestamp: '2024-02-18T12:01:20Z', hederaSequenceNumber: 848 },

  // Mission 002 — Zone 01 — Feb 17 (anomaly leading to breach evidence chain)
  { id: 'rec-009', missionId: 'mission-002', zoneId: 'zone-001', checkpointId: 'cp-101', operatorId: 'user-003', capturedAt: '2024-02-17T09:00:00Z', latitude: 11.4102, longitude: 76.6950, gpsAccuracy: 2.4, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', evidenceHash: 'f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708160400.000', hederaConsensusTimestamp: '2024-02-17T09:01:18Z', hederaSequenceNumber: 835 },
  { id: 'rec-010', missionId: 'mission-002', zoneId: 'zone-001', checkpointId: 'cp-103', operatorId: 'user-003', capturedAt: '2024-02-17T09:15:00Z', latitude: 11.4199, longitude: 76.7012, gpsAccuracy: 2.6, condition: 'ANOMALY', notes: 'Boundary marker leaning, possible animal disturbance', imageUrl: '/images/placeholder-anomaly.jpg', imageHash: 'a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', evidenceHash: 'b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708161300.000', hederaConsensusTimestamp: '2024-02-17T09:16:05Z', hederaSequenceNumber: 836 },
  { id: 'rec-011', missionId: 'mission-002', zoneId: 'zone-001', checkpointId: 'cp-104', operatorId: 'user-003', capturedAt: '2024-02-17T09:45:00Z', latitude: 11.4243, longitude: 76.7045, gpsAccuracy: 3.1, condition: 'ANOMALY', notes: 'Fence posts displaced, possible human activity', imageUrl: '/images/placeholder-anomaly.jpg', imageHash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', evidenceHash: 'd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708163100.000', hederaConsensusTimestamp: '2024-02-17T09:46:22Z', hederaSequenceNumber: 837 },
  { id: 'rec-012', missionId: 'mission-002', zoneId: 'zone-001', checkpointId: 'cp-105', operatorId: 'user-003', capturedAt: '2024-02-17T10:10:00Z', latitude: 11.4210, longitude: 76.7090, gpsAccuracy: 2.9, condition: 'ANOMALY', notes: 'Multiple markers missing, possible encroachment', imageUrl: '/images/placeholder-anomaly.jpg', imageHash: 'e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4', evidenceHash: 'f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708164600.000', hederaConsensusTimestamp: '2024-02-17T10:11:15Z', hederaSequenceNumber: 838 },
  { id: 'rec-013', missionId: 'mission-002', zoneId: 'zone-001', checkpointId: 'cp-107', operatorId: 'user-003', capturedAt: '2024-02-17T11:00:00Z', latitude: 11.4140, longitude: 76.7088, gpsAccuracy: 2.3, condition: 'ANOMALY', notes: 'Boundary wire cut, needs urgent inspection', imageUrl: '/images/placeholder-anomaly.jpg', imageHash: 'a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6', evidenceHash: 'b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708167600.000', hederaConsensusTimestamp: '2024-02-17T11:01:42Z', hederaSequenceNumber: 839 },

  // Mission 003 — Zone 01 — Feb 16 (breach confirmed)
  { id: 'rec-014', missionId: 'mission-003', zoneId: 'zone-001', checkpointId: 'cp-101', operatorId: 'user-003', capturedAt: '2024-02-16T09:30:00Z', latitude: 11.4102, longitude: 76.6950, gpsAccuracy: 2.2, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', evidenceHash: 'd8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708075800.000', hederaConsensusTimestamp: '2024-02-16T09:31:10Z', hederaSequenceNumber: 825 },
  { id: 'rec-015', missionId: 'mission-003', zoneId: 'zone-001', checkpointId: 'cp-102', operatorId: 'user-003', capturedAt: '2024-02-16T09:45:00Z', latitude: 11.4155, longitude: 76.6978, gpsAccuracy: 2.0, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', evidenceHash: 'f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708076700.000', hederaConsensusTimestamp: '2024-02-16T09:46:05Z', hederaSequenceNumber: 826 },
  { id: 'rec-016', missionId: 'mission-003', zoneId: 'zone-001', checkpointId: 'cp-103', operatorId: 'user-003', capturedAt: '2024-02-16T10:00:00Z', latitude: 11.4199, longitude: 76.7012, gpsAccuracy: 2.7, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b3', evidenceHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c4', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708077600.000', hederaConsensusTimestamp: '2024-02-16T10:01:12Z', hederaSequenceNumber: 827 },
  { id: 'rec-017', missionId: 'mission-003', zoneId: 'zone-001', checkpointId: 'cp-104', operatorId: 'user-003', capturedAt: '2024-02-16T10:00:00Z', latitude: 11.4243, longitude: 76.7045, gpsAccuracy: 2.4, condition: 'BREACH', notes: 'Confirmed encroachment — cattle tracks and cleared vegetation found inside boundary', imageUrl: '/images/placeholder-breach.jpg', imageHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d5', evidenceHash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e6', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708077600.000', hederaConsensusTimestamp: '2024-02-16T10:01:45Z', hederaSequenceNumber: 828 },
  { id: 'rec-018', missionId: 'mission-003', zoneId: 'zone-001', checkpointId: 'cp-105', operatorId: 'user-003', capturedAt: '2024-02-16T10:20:00Z', latitude: 11.4210, longitude: 76.7090, gpsAccuracy: 3.0, condition: 'BREACH', notes: 'Fence completely removed over 30m stretch, active clearing in progress', imageUrl: '/images/placeholder-breach.jpg', imageHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f7', evidenceHash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a8', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708078800.000', hederaConsensusTimestamp: '2024-02-16T10:21:05Z', hederaSequenceNumber: 829 },
  { id: 'rec-019', missionId: 'mission-003', zoneId: 'zone-001', checkpointId: 'cp-106', operatorId: 'user-003', capturedAt: '2024-02-16T11:00:00Z', latitude: 11.4180, longitude: 76.7120, gpsAccuracy: 2.1, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b9', evidenceHash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8ca', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708081200.000', hederaConsensusTimestamp: '2024-02-16T11:01:30Z', hederaSequenceNumber: 830 },
  { id: 'rec-020', missionId: 'mission-003', zoneId: 'zone-001', checkpointId: 'cp-107', operatorId: 'user-003', capturedAt: '2024-02-16T11:30:00Z', latitude: 11.4140, longitude: 76.7088, gpsAccuracy: 2.6, condition: 'BREACH', notes: 'Clear evidence of boundary removal and structure construction inside protected zone', imageUrl: '/images/placeholder-breach.jpg', imageHash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9db', evidenceHash: 'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0ec', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708082800.000', hederaConsensusTimestamp: '2024-02-16T11:31:15Z', hederaSequenceNumber: 831 },
  { id: 'rec-021', missionId: 'mission-003', zoneId: 'zone-001', checkpointId: 'cp-108', operatorId: 'user-003', capturedAt: '2024-02-16T12:00:00Z', latitude: 11.4115, longitude: 76.7040, gpsAccuracy: 2.3, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1fd', evidenceHash: 'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2ae', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708084800.000', hederaConsensusTimestamp: '2024-02-16T12:01:05Z', hederaSequenceNumber: 832 },

  // Zone 2 records (mission-004)
  { id: 'rec-022', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-201', operatorId: 'user-003', capturedAt: '2024-02-19T07:00:00Z', latitude: 11.6850, longitude: 76.1320, gpsAccuracy: 2.0, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b5', evidenceHash: 'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c6', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708329600.000', hederaConsensusTimestamp: '2024-02-19T07:01:10Z', hederaSequenceNumber: 850 },
  { id: 'rec-023', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-202', operatorId: 'user-003', capturedAt: '2024-02-19T07:30:00Z', latitude: 11.6892, longitude: 76.1365, gpsAccuracy: 2.5, condition: 'ANOMALY', notes: 'Fresh elephant tracks crossing boundary', imageUrl: '/images/placeholder-anomaly.jpg', imageHash: 'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d7', evidenceHash: 'd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e8', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708331400.000', hederaConsensusTimestamp: '2024-02-19T07:31:05Z', hederaSequenceNumber: 851 },
  { id: 'rec-024', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-203', operatorId: 'user-003', capturedAt: '2024-02-19T08:00:00Z', latitude: 11.6935, longitude: 76.1410, gpsAccuracy: 3.0, condition: 'ANOMALY', notes: 'Damaged marker post, possibly recent', imageUrl: '/images/placeholder-anomaly.jpg', imageHash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f9', evidenceHash: 'f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8aa', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708333200.000', hederaConsensusTimestamp: '2024-02-19T08:01:20Z', hederaSequenceNumber: 852 },
  { id: 'rec-025', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-204', operatorId: 'user-003', capturedAt: '2024-02-19T08:30:00Z', latitude: 11.6978, longitude: 76.1450, gpsAccuracy: 2.2, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9bb', evidenceHash: 'b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0cc', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708335000.000', hederaConsensusTimestamp: '2024-02-19T08:31:10Z', hederaSequenceNumber: 853 },
  { id: 'rec-026', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-205', operatorId: 'user-003', capturedAt: '2024-02-19T09:00:00Z', latitude: 11.7020, longitude: 76.1490, gpsAccuracy: 1.8, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1dd', evidenceHash: 'd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2ee', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708336800.000', hederaConsensusTimestamp: '2024-02-19T09:01:05Z', hederaSequenceNumber: 854 },
  { id: 'rec-027', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-206', operatorId: 'user-003', capturedAt: '2024-02-19T09:30:00Z', latitude: 11.6990, longitude: 76.1535, gpsAccuracy: 2.8, condition: 'ANOMALY', notes: 'Boundary signage partially removed', imageUrl: '/images/placeholder-anomaly.jpg', imageHash: 'e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3ff', evidenceHash: 'f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a0', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708338600.000', hederaConsensusTimestamp: '2024-02-19T09:31:15Z', hederaSequenceNumber: 855 },
  { id: 'rec-028', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-207', operatorId: 'user-003', capturedAt: '2024-02-19T09:45:00Z', latitude: 11.6952, longitude: 76.1570, gpsAccuracy: 2.1, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b1', evidenceHash: 'b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c2', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708339500.000', hederaConsensusTimestamp: '2024-02-19T09:46:05Z', hederaSequenceNumber: 856 },
  { id: 'rec-029', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-208', operatorId: 'user-003', capturedAt: '2024-02-19T10:15:00Z', latitude: 11.6910, longitude: 76.1545, gpsAccuracy: 2.3, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d3', evidenceHash: 'd8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e4', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708341300.000', hederaConsensusTimestamp: '2024-02-19T10:16:10Z', hederaSequenceNumber: 857 },
  { id: 'rec-030', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-209', operatorId: 'user-003', capturedAt: '2024-02-19T10:45:00Z', latitude: 11.6875, longitude: 76.1500, gpsAccuracy: 2.0, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f5', evidenceHash: 'f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a6', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708343100.000', hederaConsensusTimestamp: '2024-02-19T10:46:05Z', hederaSequenceNumber: 858 },
  { id: 'rec-031', missionId: 'mission-004', zoneId: 'zone-002', checkpointId: 'cp-210', operatorId: 'user-003', capturedAt: '2024-02-19T11:15:00Z', latitude: 11.6860, longitude: 76.1460, gpsAccuracy: 1.9, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b7', evidenceHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c8', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708344900.000', hederaConsensusTimestamp: '2024-02-19T11:16:05Z', hederaSequenceNumber: 859 },

  // Zone 3 records (mission-005 - in progress)
  { id: 'rec-032', missionId: 'mission-005', zoneId: 'zone-003', checkpointId: 'cp-301', operatorId: 'user-004', capturedAt: '2024-02-20T06:30:00Z', latitude: 12.4218, longitude: 75.7382, gpsAccuracy: 2.1, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', anchorStatus: 'PENDING' },
  { id: 'rec-033', missionId: 'mission-005', zoneId: 'zone-003', checkpointId: 'cp-302', operatorId: 'user-004', capturedAt: '2024-02-20T07:00:00Z', latitude: 12.4260, longitude: 75.7425, gpsAccuracy: 2.4, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', anchorStatus: 'PENDING' },
  { id: 'rec-034', missionId: 'mission-005', zoneId: 'zone-003', checkpointId: 'cp-303', operatorId: 'user-004', capturedAt: '2024-02-20T07:30:00Z', latitude: 12.4302, longitude: 75.7465, gpsAccuracy: 1.8, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', anchorStatus: 'PENDING' },
  { id: 'rec-035', missionId: 'mission-005', zoneId: 'zone-003', checkpointId: 'cp-304', operatorId: 'user-004', capturedAt: '2024-02-20T08:00:00Z', latitude: 12.4285, longitude: 75.7510, gpsAccuracy: 2.6, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', anchorStatus: 'PENDING' },

  // Zone 4 records (mission-006)
  { id: 'rec-036', missionId: 'mission-006', zoneId: 'zone-004', checkpointId: 'cp-401', operatorId: 'user-004', capturedAt: '2024-02-20T07:00:00Z', latitude: 10.4582, longitude: 77.0450, gpsAccuracy: 2.0, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d9', evidenceHash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4ea', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708416000.000', hederaConsensusTimestamp: '2024-02-20T07:01:10Z', hederaSequenceNumber: 860 },
  { id: 'rec-037', missionId: 'mission-006', zoneId: 'zone-004', checkpointId: 'cp-402', operatorId: 'user-004', capturedAt: '2024-02-20T07:30:00Z', latitude: 10.4620, longitude: 77.0490, gpsAccuracy: 2.2, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5fb', evidenceHash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6ac', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708417800.000', hederaConsensusTimestamp: '2024-02-20T07:31:05Z', hederaSequenceNumber: 861 },
  { id: 'rec-038', missionId: 'mission-006', zoneId: 'zone-004', checkpointId: 'cp-403', operatorId: 'user-004', capturedAt: '2024-02-20T08:00:00Z', latitude: 10.4658, longitude: 77.0530, gpsAccuracy: 1.9, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7bd', evidenceHash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8ce', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708419600.000', hederaConsensusTimestamp: '2024-02-20T08:01:10Z', hederaSequenceNumber: 862 },
  { id: 'rec-039', missionId: 'mission-006', zoneId: 'zone-004', checkpointId: 'cp-404', operatorId: 'user-004', capturedAt: '2024-02-20T08:30:00Z', latitude: 10.4695, longitude: 77.0568, gpsAccuracy: 2.5, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9df', evidenceHash: 'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e0', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708421400.000', hederaConsensusTimestamp: '2024-02-20T08:31:05Z', hederaSequenceNumber: 863 },
  { id: 'rec-040', missionId: 'mission-006', zoneId: 'zone-004', checkpointId: 'cp-405', operatorId: 'user-004', capturedAt: '2024-02-20T09:00:00Z', latitude: 10.4730, longitude: 77.0605, gpsAccuracy: 2.1, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f1', evidenceHash: 'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a2', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708423200.000', hederaConsensusTimestamp: '2024-02-20T09:01:10Z', hederaSequenceNumber: 864 },
  { id: 'rec-041', missionId: 'mission-006', zoneId: 'zone-004', checkpointId: 'cp-406', operatorId: 'user-004', capturedAt: '2024-02-20T09:30:00Z', latitude: 10.4715, longitude: 77.0650, gpsAccuracy: 2.3, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b3', evidenceHash: 'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c4', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708425000.000', hederaConsensusTimestamp: '2024-02-20T09:31:05Z', hederaSequenceNumber: 865 },
  { id: 'rec-042', missionId: 'mission-006', zoneId: 'zone-004', checkpointId: 'cp-407', operatorId: 'user-004', capturedAt: '2024-02-20T10:00:00Z', latitude: 10.4680, longitude: 77.0688, gpsAccuracy: 2.0, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d5', evidenceHash: 'd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e6', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708426800.000', hederaConsensusTimestamp: '2024-02-20T10:01:10Z', hederaSequenceNumber: 866 },
  { id: 'rec-043', missionId: 'mission-006', zoneId: 'zone-004', checkpointId: 'cp-408', operatorId: 'user-004', capturedAt: '2024-02-20T10:30:00Z', latitude: 10.4645, longitude: 77.0652, gpsAccuracy: 2.4, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f7', evidenceHash: 'f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a8', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708428600.000', hederaConsensusTimestamp: '2024-02-20T10:31:05Z', hederaSequenceNumber: 867 },
  { id: 'rec-044', missionId: 'mission-006', zoneId: 'zone-004', checkpointId: 'cp-409', operatorId: 'user-004', capturedAt: '2024-02-20T11:00:00Z', latitude: 10.4608, longitude: 77.0618, gpsAccuracy: 1.8, condition: 'INTACT', imageUrl: '/images/placeholder-intact.jpg', imageHash: 'a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b9', evidenceHash: 'b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0ca', anchorStatus: 'ANCHORED', hederaTopicId: '0.0.4567890', hederaTransactionId: '0.0.4567890@1708430400.000', hederaConsensusTimestamp: '2024-02-20T11:01:10Z', hederaSequenceNumber: 868 },
]

// ── INCIDENTS ─────────────────────────────────────────────────────────────

export const DEMO_INCIDENTS: Incident[] = [
  {
    id: 'incident-001',
    zoneId: 'zone-001',
    type: 'ENCROACHMENT',
    status: 'OPEN',
    reportedAt: '2024-02-16T14:00:00Z',
    reportedBy: 'user-005',
    description: 'Active encroachment confirmed in Nilgiris Zone 04. Cattle grazing and partial fencing removal observed at checkpoints CP-04, CP-05, and CP-07. Evidence of cleared vegetation and construction materials inside protected zone.',
    damageEstimate: 250000,
    linkedRecordIds: ['rec-010', 'rec-011', 'rec-012', 'rec-013', 'rec-017', 'rec-018', 'rec-020'],
  },
  {
    id: 'incident-002',
    zoneId: 'zone-002',
    type: 'WILDLIFE_CROSSING',
    status: 'RESOLVED',
    reportedAt: '2024-02-15T10:30:00Z',
    reportedBy: 'user-003',
    description: 'Elephant herd crossing documented at Wayanad Corridor CP-02. Temporary boundary disruption recorded. Forest department notified, monitoring ongoing.',
    damageEstimate: 15000,
    linkedRecordIds: ['rec-023', 'rec-024', 'rec-027'],
    resolvedAt: '2024-02-17T16:00:00Z',
  },
]

// ── ALERTS ────────────────────────────────────────────────────────────────

export const DEMO_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    type: 'BREACH',
    zoneId: 'zone-001',
    checkpointId: 'cp-104',
    recordId: 'rec-017',
    message: 'Zone Nilgiris-04, Checkpoint CP-04: Breach confirmed — active encroachment',
    timestamp: '2024-02-16T10:01:45Z',
    acknowledged: false,
  },
  {
    id: 'alert-002',
    type: 'BREACH',
    zoneId: 'zone-001',
    checkpointId: 'cp-105',
    recordId: 'rec-018',
    message: 'Zone Nilgiris-04, Checkpoint CP-05: Breach confirmed — fence removal over 30m',
    timestamp: '2024-02-16T10:21:05Z',
    acknowledged: false,
  },
  {
    id: 'alert-003',
    type: 'BREACH',
    zoneId: 'zone-001',
    checkpointId: 'cp-107',
    recordId: 'rec-020',
    message: 'Zone Nilgiris-04, Checkpoint CP-07: Breach confirmed — structure construction inside zone',
    timestamp: '2024-02-16T11:31:15Z',
    acknowledged: false,
  },
  {
    id: 'alert-004',
    type: 'ANOMALY',
    zoneId: 'zone-002',
    checkpointId: 'cp-202',
    recordId: 'rec-023',
    message: 'Zone Wayanad-02, Checkpoint CP-02: Anomaly detected — elephant tracks crossing boundary',
    timestamp: '2024-02-19T07:31:05Z',
    acknowledged: false,
  },
  {
    id: 'alert-005',
    type: 'ANOMALY',
    zoneId: 'zone-002',
    checkpointId: 'cp-206',
    recordId: 'rec-027',
    message: 'Zone Wayanad-02, Checkpoint CP-06: Anomaly detected — boundary signage removed',
    timestamp: '2024-02-19T09:31:15Z',
    acknowledged: false,
  },
  {
    id: 'alert-006',
    type: 'HCS_PENDING',
    message: '4 inspection records from Zone Coorg-01 awaiting Hedera anchoring',
    timestamp: '2024-02-20T08:15:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-007',
    type: 'MISSED_PATROL',
    zoneId: 'zone-001',
    message: 'Zone Nilgiris-04: Patrol overdue by 18 hours — last patrol 2024-02-18',
    timestamp: '2024-02-20T06:00:00Z',
    acknowledged: true,
  },
]

// ── ANALYTICS DATA ────────────────────────────────────────────────────────

export const BREACH_TREND_DATA = [
  { week: 'Week 1', breaches: 0 },
  { week: 'Week 2', breaches: 1 },
  { week: 'Week 3', breaches: 0 },
  { week: 'Week 4', breaches: 2 },
  { week: 'Week 5', breaches: 1 },
  { week: 'Week 6', breaches: 0 },
  { week: 'Week 7', breaches: 3 },
  { week: 'Week 8', breaches: 2 },
  { week: 'Week 9', breaches: 1 },
  { week: 'Week 10', breaches: 4 },
  { week: 'Week 11', breaches: 2 },
  { week: 'Week 12', breaches: 3 },
]

export const PATROL_FREQUENCY_DATA = [
  { zone: 'Nilgiris-04', week1: 5, week2: 4, week3: 3, week4: 3 },
  { zone: 'Wayanad-02', week1: 6, week2: 7, week3: 5, week4: 5 },
  { zone: 'Coorg-01', week1: 7, week2: 8, week3: 7, week4: 7 },
  { zone: 'Anamalai', week1: 6, week2: 6, week3: 6, week4: 6 },
]

export const CONDITION_BREAKDOWN_DATA = [
  { name: 'INTACT', value: 72, color: '#478c48' },
  { name: 'ANOMALY', value: 18, color: '#c88c28' },
  { name: 'BREACH', value: 10, color: '#b83c28' },
]

// Helper lookups
export function getZoneById(id: string): Zone | undefined {
  return DEMO_ZONES.find(z => z.id === id)
}

export function getRecordById(id: string): InspectionRecord | undefined {
  return DEMO_RECORDS.find(r => r.id === id)
}

export function getMissionById(id: string): Mission | undefined {
  return DEMO_MISSIONS.find(m => m.id === id)
}

export function getIncidentById(id: string): Incident | undefined {
  return DEMO_INCIDENTS.find(i => i.id === id)
}

export function getRecordsByZone(zoneId: string): InspectionRecord[] {
  return DEMO_RECORDS.filter(r => r.zoneId === zoneId)
}

export function getRecordsByMission(missionId: string): InspectionRecord[] {
  return DEMO_RECORDS.filter(r => r.missionId === missionId)
}

export function getMissionsByZone(zoneId: string): Mission[] {
  return DEMO_MISSIONS.filter(m => m.zoneId === zoneId)
}

export function getCheckpointById(id: string): Checkpoint | undefined {
  for (const zone of DEMO_ZONES) {
    const cp = zone.checkpoints.find(c => c.id === id)
    if (cp) return cp
  }
  return undefined
}

export function getUserById(id: string): User | undefined {
  return DEMO_USERS.find(u => u.id === id)
}
