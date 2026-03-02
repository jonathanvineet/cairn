# Quick Start - Complete Flow

## 🚀 From Registration to Deployment

### Step 1: Register Drones with Zone ID ✈️

**Location**: `/register`

1. **Connect Wallet** (MetaMask or HashPack)
2. **Select Drone Model** from 3D viewer (automatic)
3. **Fill Form**:
   - Serial Number: `DJI-M30T-001`
   - DGCA Certificate: `DGCA-UAS-2024-001`
   - Certificate Expiry: Select date
   - **Assigned Zone**: `Wayanad-11` ⚠️ (Remember this!)
   - Sensor Type: Auto-selected
   - Max Flight Time: `35`
4. **Register Drone**
5. ✅ Drone created: `CAIRN-01`

Repeat for more drones (all with same zone ID):
- `CAIRN-02` → Zone: `Wayanad-11`
- `CAIRN-03` → Zone: `Wayanad-11`

---

### Step 2: Create Boundary with Payment 🗺️

**Location**: `/deploy`

1. **Connect MetaMask Wallet** (top right)
2. **Draw Boundary**:
   - Click "Create Boundary" on map
   - Click map to add points
   - Close the polygon
   - Click "Complete Boundary" button
3. **Enter Zone ID**: `Wayanad-11` ⚠️ (Must match!)
4. **Pay & Save**:
   - Click "Pay & Save Boundary"
   - Approve 0.01 ETH payment in MetaMask
   - Wait for transaction

5. ✅ **Result**:
   ```
   ✅ Boundary created for Wayanad-11
   ✅ Zone saved on blockchain
   ✅ 3 drones automatically assigned:
      - CAIRN-01 (DJI Matrice 30T)
      - CAIRN-02 (DJI Mavic 3E)
      - CAIRN-03 (Autel Evo II)
   ```

---

### Step 3: View Auto-Assigned Drones 👀

After boundary creation, you'll see:

**"Auto-Assigned Drones" Section**:
- Green cards showing all assigned drones
- Checkmarks ✓ next to each drone
- Count of assigned drones
- Zone confirmation

---

## 🎯 Key Points

### Zone ID Matching
```
Registration:  Assigned Zone = "Wayanad-11"
                       ↓
Boundary:      Zone ID = "Wayanad-11"
                       ↓
Result:        AUTO-ASSIGNMENT ✅
```

### If Zone IDs Don't Match
```
Registration:  Assigned Zone = "Wayanad-11"
                       ↓
Boundary:      Zone ID = "Nilgiris-04"
                       ↓
Result:        No drones assigned ⚠️
```

---

## 📋 Complete Example Workflow

### Scenario: Forest Monitoring in Wayanad

**Day 1: Register Fleet**
```bash
✈️ Register CAIRN-01 (DJI Matrice 30T)
   → Assigned Zone: "Wayanad-11"
   
✈️ Register CAIRN-02 (DJI Mavic 3E)
   → Assigned Zone: "Wayanad-11"
   
✈️ Register CAIRN-03 (Autel Evo II)
   → Assigned Zone: "Wayanad-11"
```

**Day 2: Create Operational Zone**
```bash
🗺️ Draw boundary on map
💰 Pay 0.01 ETH
📝 Enter Zone ID: "Wayanad-11"
✅ Submit

Result:
└─ Zone "Wayanad-11" created
   ├─ CAIRN-01 → AUTO-ASSIGNED ✓
   ├─ CAIRN-02 → AUTO-ASSIGNED ✓
   └─ CAIRN-03 → AUTO-ASSIGNED ✓
```

**Day 3: Expand Fleet**
```bash
✈️ Register CAIRN-04 (Skydio X10)
   → Assigned Zone: "Wayanad-11"

🔄 Update boundary (redraw + pay again)
   → Zone ID: "Wayanad-11"

Result:
└─ Zone "Wayanad-11" updated
   ├─ CAIRN-01 → AUTO-ASSIGNED ✓
   ├─ CAIRN-02 → AUTO-ASSIGNED ✓
   ├─ CAIRN-03 → AUTO-ASSIGNED ✓
   └─ CAIRN-04 → AUTO-ASSIGNED ✓ (NEW!)
```

---

## ⚡ Quick Reference

| Action | Location | Key Input | Result |
|--------|----------|-----------|--------|
| Register Drone | `/register` | Assigned Zone ID | Drone stored with zone |
| Create Boundary | `/deploy` | Same Zone ID + 0.01 ETH | Auto-assignment |
| View Drones | `/deploy` | After saving | Green cards show assigned |

---

## 🔧 Troubleshooting

### "No drones registered for this zone"

**Problem**: Boundary created but no drones assigned

**Fix**: 
1. Check zone ID spelling (case-sensitive!)
2. Register drones first with exact zone ID
3. Recreate boundary (you'll pay again)

### "Payment failed"

**Problem**: MetaMask transaction rejected

**Fix**:
1. Check you have enough ETH (need > 0.01)
2. Check you're on correct network
3. Try again with higher gas

### "Zone already exists"

**Problem**: Trying to create duplicate zone

**Fix**:
- This is expected if updating/redrawing
- Just pay again to update
- All drones will be reassigned

---

## 💡 Pro Tips

1. **Use consistent zone names**: "Wayanad-11" not "wayanad 11"
2. **Register drones first**: Then create boundaries
3. **Multiple zones**: Each gets its own drones
4. **Adding drones later**: Just redraw + pay to update
5. **Check before paying**: Verify zone ID matches!

---

## 🎬 Video Guide Outline

1. **Intro** (0:00-0:30)
   - Show dashboard
   - Explain automatic assignment

2. **Register Drones** (0:30-2:00)
   - Navigate to /register
   - Select model
   - Fill form with zone ID
   - Submit

3. **Create Boundary** (2:00-4:00)
   - Navigate to /deploy
   - Connect wallet
   - Draw boundary
   - Enter zone ID
   - Pay & save

4. **See Results** (4:00-5:00)
   - Auto-assigned drones section
   - Green confirmations
   - Success!

---

## 📱 What You'll See

### Before Creating Boundary:
```
┌─────────────────────────┐
│  HOW TO USE            │
│  1. Draw boundary      │
│  2. Click complete     │
│  3. Enter zone ID      │
│  4. Pay & save         │
└─────────────────────────┘
```

### After Creating Boundary:
```
┌─────────────────────────────────┐
│  ✅ Auto-Assigned Drones        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  3 drones automatically         │
│  assigned to this zone          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ✓ CAIRN-01              │   │
│  │   DJI Matrice 30T       │   │
│  │   Assigned to Wayanad-11│   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ✓ CAIRN-02              │   │
│  │   DJI Mavic 3E          │   │
│  │   Assigned to Wayanad-11│   │
│  └─────────────────────────┘   │
│                                 │
│  💡 New drones registered       │
│     with this zone will be      │
│     auto-assigned               │
└─────────────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Contract deployed in Remix IDE
- [ ] Contract address updated in `lib/contracts.ts`
- [ ] Registered at least one drone with zone ID
- [ ] Created boundary with matching zone ID
- [ ] Paid 0.01 ETH successfully
- [ ] Saw auto-assigned drones in UI
- [ ] Verified drones show green checkmarks

---

## 🎯 You're Done!

Your drones are now automatically assigned to zones based on registration. No manual work needed! 🎉
