# Smart Real Estate Sensor Platform - Frontend

A modern React-based web application for displaying real estate properties with live sensor data and comfort analysis.

## 🎯 Features

- **Property Catalog**: Browse properties with real-time comfort scores
- **Room-by-Room Analysis**: Detailed sensor readings for each room
- **Customer Profiles**: Personalized recommendations based on customer preferences
  - Working Adult profile
  - Stay-home Elderly profile
- **Real-Time Data**: Live sensor updates every 15-30 seconds
- **Historical Charts**: 2-hour trend visualization for all sensors
- **Comfort Scoring**: Intelligent algorithm evaluates property suitability
- **Insights**: Natural language explanations for property recommendations
- **Camera Demo**: Simulated customer recognition system

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── PropertyList.jsx        # Property catalog grid
│   │   ├── PropertyDetail.jsx      # Property details container
│   │   ├── RoomComfort.jsx         # Room comfort analysis
│   │   ├── HistoricalCharts.jsx    # Sensor data visualization
│   │   └── CameraDemo.jsx          # Customer recognition demo
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── api.js               # Backend API client
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

## 🎨 Components Overview

### PropertyList
Displays all properties in a card-based grid with:
- Property images
- Overall comfort scores
- Comfort level badges (Excellent/Good/Fair/Poor)
- Selection state

### PropertyDetail
Main container for property information:
- Property description
- Room selection tabs
- Integrates RoomComfort and HistoricalCharts
- Camera recognition demo

### RoomComfort
Shows detailed comfort analysis:
- Overall room comfort score
- Individual sensor readings (Temperature, Humidity, Light, Sound, Air Quality)
- Status indicators (color-coded)
- Personalized insights

### HistoricalCharts
Visualizes sensor data over time:
- Multi-line chart showing 2-hour history
- Real-time updates
- Current readings dashboard
- Color-coded sensors

### CameraDemo
Customer profile switcher:
- Simulated camera preview
- Profile selection buttons
- Optional webcam integration

## 📡 API Integration

The frontend connects to the backend API at `http://localhost:8000`:

### Endpoints Used:
- `GET /properties` - Fetch all properties with comfort scores
- `GET /properties/{id}` - Get property details
- `GET /properties/{id}/rooms/{roomId}/comfort` - Room comfort analysis
- `GET /properties/{id}/rooms/{roomId}/history` - Historical sensor data
- `GET /properties/{id}/rooms/{roomId}/latest` - Latest sensor readings

## 🎭 Customer Profiles

### Working Adult
- Preferences: Cooler temperatures, bright light, quiet evenings
- Ideal for: Active professionals who work outside home
- Time-based adjustments: Cooler at night, brighter during day

### Stay-home Elderly
- Preferences: Warmer temperatures, softer light, quieter overall
- Ideal for: Seniors who spend most time at home
- Higher importance on air quality and temperature

## 🎨 Design System

### Colors
- Primary: Blue (#2563eb)
- Secondary: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)

### Comfort Levels
- **Excellent** (85-100): Green
- **Good** (70-84): Blue
- **Fair** (50-69): Orange
- **Poor** (0-49): Red

### Typography
- Font: Inter, system fonts fallback
- Headers: Bold 700
- Body: Regular 400

## ⚡ Performance

- Real-time updates: 15-30 second intervals
- Automatic polling for sensor data
- Responsive design for all screen sizes
- Optimized chart rendering
- Image lazy loading with fallbacks

## 🔧 Configuration

### API Base URL
Update in `src/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### Polling Intervals
- Room comfort: 30 seconds
- Historical charts: 15 seconds
- Property list: On profile change

### Chart Settings
- Time window: 2 hours (configurable in HistoricalCharts.jsx)
- Refresh rate: 15 seconds

## 🛠️ Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Output will be in `dist/` directory.

### Preview Build
```bash
npm run preview
```

## 📦 Dependencies

### Core
- **React** (^18.3.1) - UI framework
- **React-DOM** (^18.3.1) - DOM rendering

### Libraries
- **Axios** (^1.7.7) - HTTP client
- **Recharts** (^2.13.3) - Data visualization

### Dev Dependencies
- **Vite** (^7.2.2) - Build tool
- **@vitejs/plugin-react** (^5.1.1) - React plugin for Vite

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in backend
- Verify network connectivity

### No Data Displayed
- Wait for sensor simulator to generate data (15-second intervals)
- Check browser console for errors
- Verify API responses in Network tab

### Charts Not Updating
- Check that historical data exists (may take 2-5 minutes after startup)
- Verify polling intervals are active
- Check browser console for errors

### Webcam Not Working
- Grant camera permissions in browser
- HTTPS may be required in production
- Fallback to profile buttons if camera fails

## 🎯 User Flow

1. **Landing**: See all properties sorted by comfort score
2. **Select**: Click a property to view details
3. **Explore**: Switch between rooms to see sensor data
4. **Analyze**: Review comfort scores and insights
5. **Compare**: View historical trends in charts
6. **Profile**: Switch customer type to see personalized scores

## 🚀 Future Enhancements

- [ ] Property comparison tool
- [ ] Favorite/bookmark properties
- [ ] Email notifications for ideal matches
- [ ] Advanced filtering and search
- [ ] Mobile app version
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Export reports as PDF

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Support

For issues or questions:
1. Check backend logs
2. Review browser console errors
3. Verify API connectivity
4. Consult project documentation

---

**Built with React + Vite for optimal performance** ⚡
