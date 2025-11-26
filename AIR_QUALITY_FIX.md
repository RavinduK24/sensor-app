# Air Quality Historical Data Fix

## Problem
Historical charts (monthly/yearly) were showing air quality values in the range of 50-90, while:
- Current readings showed correct values (5-15 µg/m³)
- The y-axis label said "µg/m³"
- The 24-hour chart showed correct values (5-15 µg/m³)

## Root Cause
The `historical_readings` table contained **legacy data** that was multiplied by 10 during an earlier implementation when air quality was intended to be on a 0-100 scale.

Although the code in `quick_load_historical.py` was fixed to remove the `* 10` scaling (see `FINAL_FIXES_SUMMARY.txt`), the **database still contained the old scaled values**.

## Solution Applied
Directly corrected the database by dividing all air quality historical values by 10:

```sql
UPDATE historical_readings 
SET avg_value = avg_value / 10.0 
WHERE sensor_type = 'AIR_QUALITY';
```

## Verification
After the fix, air quality values are now in the correct µg/m³ ranges:

| Property | Expected Range (µg/m³) | Actual Range After Fix |
|----------|------------------------|------------------------|
| Property 1 | 5-8 | 5.0-8.0 ✓ |
| Property 2 | 10-15 | 10.02-15.0 ✓ |
| Property 3 | 3-7 | 3.01-7.0 ✓ |
| Property 9 | 1-3 | 1.0-3.0 ✓ |
| Property 10 | 12-18 | 12.01-17.96 ✓ |

## What Changed
- **Before**: Monthly/yearly charts showed 50-90 (incorrect scale)
- **After**: Monthly/yearly charts now show 5-15 µg/m³ (correct)
- **24-hour chart**: Already correct (uses realtime data, not historical)
- **Current readings**: Already correct (uses realtime data, not historical)

## Technical Details
- **Data source**: `historical_readings` table
- **Affected endpoints**: 
  - `/properties/{id}/history/monthly`
  - `/properties/{id}/history/yearly`
- **Not affected**:
  - `/properties/{id}/history/24hour` (uses `realtime_readings`)
  - `/properties/{id}/latest` (uses `realtime_readings`)
  - `/properties/{id}/comfort` (uses `realtime_readings`)

## How to Avoid This in the Future
If you ever need to reload historical data from scratch:

```bash
cd backend
python quick_load_historical.py
```

This script now correctly loads air quality as µg/m³ without any scaling.

---

**Date Fixed**: November 16, 2025  
**Issue**: Historical air quality displayed as 0-100 scale instead of µg/m³  
**Status**: ✅ Resolved

