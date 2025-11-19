# ⚡ Quick Start - 5 Minutes to Running App

Get the Smart Real Estate Sensor Platform running in 5 minutes!

## 🚀 Step-by-Step Instructions

### Terminal 1: Start Backend

```bash
cd /Users/nurdauletnazarbay/Desktop/sensor_app/backend
pip install -r requirements.txt
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
Database seeded successfully!
INFO:     Application startup complete.
```

✅ **Backend is running on:** `http://localhost:8000`

---

### Terminal 2: Start Frontend

**Open a NEW terminal window**, then run:

```bash
cd /Users/nurdauletnazarbay/Desktop/sensor_app/frontend
npm install
npm run dev
```

**Expected Output:**
```
  VITE v7.2.2  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

✅ **Frontend is running on:** `http://localhost:5173`

Your browser should automatically open!

---

## ✅ Verify Everything Works

### 1. Check Backend API
Open in browser: `http://localhost:8000`

Should see: `{"message":"Real Estate Sensor API","version":"1.0.0"}`

### 2. Check Frontend
Open in browser: `http://localhost:5173`

Should see:
- Header: "🏠 Smart Real Estate Sensor Platform"
- 3 property cards on the left
- Property details on the right
- Customer profile selector in header

### 3. Test Features

**Property Selection:**
- [ ] Click different property cards
- [ ] Selected property should highlight with blue border
- [ ] Details should update on the right

**Room Navigation:**
- [ ] Click different room tabs (Bedroom, Living Room, etc.)
- [ ] Room details should update

**Sensor Data:**
- [ ] Wait 15-30 seconds
- [ ] Should see comfort score (e.g., "85.5")
- [ ] Should see 5 sensor cards with values
- [ ] Should see insights section

**Charts:**
- [ ] Wait 2-5 minutes for data to accumulate
- [ ] Scroll down to charts section
- [ ] Should see multi-line chart
- [ ] Green "Live updating" dot should pulse

**Customer Profiles:**
- [ ] Click dropdown in header
- [ ] Select "Stay-home Elderly"
- [ ] Property scores should change
- [ ] Properties should re-order

**Camera Demo:**
- [ ] Scroll to bottom
- [ ] Click profile buttons
- [ ] Customer type should switch
- [ ] Optional: Click "Start Camera" (requires webcam permission)

---

## 🐛 Quick Troubleshooting

### Backend Won't Start

**Error: "Port 8000 already in use"**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Error: "Module not found"**
```bash
pip install -r requirements.txt --force-reinstall
```

### Frontend Won't Start

**Error: "Cannot find module 'react'"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 5173 already in use"**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### No Data Displayed

**Solution:** Wait 15-30 seconds
- Sensor simulator generates data every 15 seconds
- First load may take a moment

**Still no data?**
1. Check backend terminal for errors
2. Check browser console (F12) for errors
3. Verify backend is responding: `http://localhost:8000/properties`

---

## 🎯 What You're Looking At

### Property Cards (Left Side)
- **Name**: Property name and address
- **Score**: Overall comfort score (0-100)
- **Badge**: Comfort level with color:
  - 🟢 Excellent (85-100)
  - 🔵 Good (70-84)
  - 🟠 Fair (50-69)
  - 🔴 Poor (0-49)

### Property Details (Right Side)
- **Header**: Property name, address, description
- **Room Tabs**: Switch between rooms
- **Comfort Score**: Large number showing room comfort
- **Sensor Grid**: 5 cards showing current readings
  - 🌡️ Temperature (°C)
  - 💧 Humidity (%)
  - 💡 Light (lux)
  - 🔊 Sound (dB)
  - 🌬️ Air Quality (/100)
- **Insights**: Why this property is right for you
- **Charts**: 2-hour sensor trends
- **Camera Demo**: Customer profile switcher

---

## 🎨 How to Use

### Find Best Property for You

1. **Select your profile** from dropdown (Working Adult or Stay-home Elderly)
2. **Properties auto-rank** based on your preferences
3. **Click top property** to see why it's best for you
4. **Read insights** to understand the match

### Explore Property Details

1. **Select a property** from the left
2. **Click room tabs** to see each room
3. **Check comfort score** - higher is better
4. **Review sensor readings** - color shows status
5. **Read insights** for explanations

### Compare Properties

1. **Click each property** to view details
2. **Note the comfort score**
3. **Read insights** for each
4. **Switch customer types** to see different scores

### View Historical Data

1. **Select a property and room**
2. **Scroll to charts section**
3. **Wait 2-5 minutes** for data to accumulate
4. **Watch trends** over 2 hours
5. **Green dot pulses** when updating live

---

## 📊 Understanding Scores

### Comfort Score (0-100)
- Based on 5 sensors: Temperature, Humidity, Light, Sound, Air Quality
- Weighted by customer preferences
- Higher score = better match for you

### Sensor Status
- **Excellent** 🟢: In ideal range
- **Good** 🔵: Acceptable, slightly off ideal
- **Fair** 🟠: Tolerable but not ideal
- **Poor** 🔴: Outside comfortable range

### Customer Profiles

**💼 Working Adult**
- Cooler temps (20-23°C)
- Bright light during day
- Quiet evenings
- Active lifestyle

**🏠 Stay-home Elderly**
- Warmer temps (22-25°C)
- Softer, dimmer light
- Very quiet overall
- Home-based lifestyle

---

## 🔧 Configuration

### Change API URL (for production)
**File:** `frontend/src/api.js`
```javascript
const API_BASE_URL = 'http://localhost:8000';
// Change to your production URL
```

### Adjust Update Intervals
**Room Comfort:** 30 seconds (in `RoomComfort.jsx`)
**Charts:** 15 seconds (in `HistoricalCharts.jsx`)

### Change Historical Window
**Default:** 2 hours
**Location:** `HistoricalCharts.jsx`, line 13
```javascript
getRoomHistory(propertyId, room.id, 24), // Change 2 to 24 for 24 hours
```

---

## 📚 More Documentation

- **SETUP_GUIDE.md**: Detailed setup with troubleshooting
- **FRONTEND_GUIDE.md**: Complete developer guide
- **FRONTEND_SUMMARY.md**: Technical implementation details
- **frontend/README.md**: Frontend feature documentation
- **backend/README.md**: Backend API documentation
- **PROJECT_SUMMARY.md**: Full project overview

---

## 🎉 You're All Set!

The application is now running and you can:
- ✅ Browse 3 properties
- ✅ See real-time sensor data
- ✅ View personalized comfort scores
- ✅ Explore historical trends
- ✅ Switch customer profiles
- ✅ Compare properties

**Enjoy exploring the Smart Real Estate Sensor Platform!** 🏠

---

## 💡 Next Steps

1. **Explore all 3 properties**
2. **Try both customer profiles**
3. **Watch data update in real-time**
4. **Check historical charts after a few minutes**
5. **Read insights to understand recommendations**

---

## 📞 Need Help?

- Check **SETUP_GUIDE.md** for detailed troubleshooting
- Review **FRONTEND_GUIDE.md** for customization
- Look at browser console (F12) for errors
- Verify both servers are running

**Both terminals should stay open while using the app!**

