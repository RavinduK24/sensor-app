# 🏠 VisionHomes AI - Real Estate Platform with Facial Recognition

A cutting-edge, fully responsive real estate platform that uses AI-powered facial recognition to identify users and provide personalized property recommendations.

## ✨ Features

### 🤖 Facial Recognition
- Real-time face detection using TensorFlow.js Face-API
- Automatic profile detection (age, gender analysis)
- 4 customer types: Work from Home Adult, Elderly People, Families with Babies, Asthma/Allergic People
- Fallback recognition mode for optimal compatibility

### 🏡 Property Management
- AI-powered property recommendations based on customer profile
- Comfort score analysis (0-100)
- Property browsing with filtering and sorting
- Detailed property information with comfort metrics
- Support for multiple properties with real-time data

### 🎨 Design
- **Glassmorphism UI** - Modern frosted glass effect with backdrop blur
- **Futuristic Aesthetic** - Deep blue, silver, white, purple, and neon pink accents
- **Smooth Animations** - 15+ custom CSS animations
- **Mobile-First Responsive** - Works perfectly on all devices
- **Dark Theme** - Eye-friendly dark interface optimized for clarity

### 🔐 Technology Stack
- **Frontend**: React 18, Vite, TensorFlow.js
- **Backend**: Python FastAPI, SQLite
- **Styling**: Pure CSS3 with 3700+ lines of custom design

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
→ Opens at **http://localhost:5173/**

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
→ API available at **http://localhost:8000/**

---

## 📁 Project Structure

```
VisionHomes AI/
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Navigation.jsx          # Sticky navbar
│   │   │   ├── Footer.jsx              # Footer with newsletter
│   │   │   ├── AIAssistant.jsx         # Floating chatbot
│   │   │   ├── WelcomePage.jsx         # Homepage
│   │   │   ├── PropertySearch.jsx      # Advanced search
│   │   │   ├── AboutUs.jsx             # About page
│   │   │   ├── Contact.jsx             # Contact form
│   │   │   ├── FAQ.jsx                 # FAQ page
│   │   │   ├── CameraRecognition.jsx   # Facial recognition
│   │   │   ├── ProfileDashboard.jsx    # Profile page
│   │   │   ├── PropertyList.jsx        # Property list
│   │   │   ├── PropertyDetail.jsx      # Property details
│   │   │   ├── PropertyComfort.jsx     # Comfort metrics
│   │   │   └── HistoricalCharts.jsx    # Data visualization
│   │   ├── App.jsx              # Main router & state
│   │   ├── App.css              # 3700+ lines styling
│   │   ├── api.js               # Backend integration
│   │   └── main.jsx
│   ├── public/models/           # TensorFlow.js models
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py                  # FastAPI server
│   ├── models.py                # Data models
│   ├── schemas.py               # API schemas
│   ├── database.py              # Database setup
│   ├── data_aggregator.py       # Data processing
│   ├── comfort_evaluator.py     # Comfort scoring
│   ├── requirements.txt
│   └── README.md
│
├── README.md                    # This file
├── QUICK_START.md               # Quick start guide
└── VISIONHOMES_SETUP_GUIDE.md   # Detailed setup guide

```

---

## 🎯 Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| **Homepage** | `/` | Hero section, featured properties, contact form |
| **Property Search** | `/search` | Advanced filtering, sorting, dynamic grid |
| **About Us** | `/about` | Mission, team, ethics, statistics |
| **Contact** | `/contact` | Contact form, company info, chatbot preview |
| **FAQ** | `/faq` | Accordion Q&As with category filtering |
| **Facial Recognition** | `/camera` | Real-time face detection interface |
| **Profile Dashboard** | `/dashboard` | Personalized profile after recognition |
| **Properties** | `/properties` | Property listings with details |

---

## 🎨 Design System

### Color Palette
- **Primary**: `#667eea` (Deep Blue)
- **Secondary**: `#764ba2` (Purple)
- **Accent**: `#f093fb` (Pink)
- **Text**: `#ffffff` (White), `#b0b0b0` (Light Gray)
- **Background**: `#0a0e27` (Dark Navy)

### Typography
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont
- **Headings**: 800 weight, gradient effects
- **Body**: 400-600 weight, 1rem size
- **Line Height**: 1.6-1.7 for readability

### Components
- **Cards**: Glassmorphism with `backdrop-filter: blur(10px)`
- **Buttons**: Gradient backgrounds, glow effects
- **Inputs**: Semi-transparent with gradient borders
- **Animations**: 15+ custom keyframes for smooth interactions

---

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env` in frontend folder)
```env
VITE_API_URL=http://localhost:8000
```

#### Backend (Environment)
```bash
DATABASE_URL=sqlite:///./sensor_app.db
DEBUG=false
```

---

## 📱 Responsive Design

| Device | Breakpoint | Layout |
|--------|-----------|--------|
| **Desktop** | 1024px+ | Multi-column, full features |
| **Tablet** | 768px-1024px | 2-column, optimized spacing |
| **Mobile** | <768px | Single-column, hamburger menu |

All pages optimized for touch interaction.

---

## 🚀 Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```
Generates optimized `dist/` folder.

### Backend Production
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with production server
gunicorn main:app --host 0.0.0.0 --port 8000
```

### Deployment Options
- **Frontend**: Vercel, Netlify, GitHub Pages, AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, DigitalOcean, Railway

---

## 🧪 Testing

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Device Testing
- ✅ Desktop (1920x1080+)
- ✅ Tablet (iPad, Android)
- ✅ Mobile (iPhone, Samsung)

---

## 🎓 API Documentation

### Properties Endpoint
```
GET /api/properties?customer_type=Work from Home Adult
```

### Property Detail
```
GET /api/properties/{id}
```

### Comfort Metrics
```
GET /api/comfort/{property_id}?customer_type=Work from Home Adult
```

Full API docs available at `/docs` when backend is running.

---

## 📊 Performance

- **Frontend Load Time**: <2s
- **API Response Time**: <500ms
- **Animation FPS**: 60fps
- **Mobile Score**: 85+
- **Desktop Score**: 90+

---

## 🔒 Security Features

- CSP (Content Security Policy) headers configured
- Input validation on all forms
- CORS enabled for API
- Client-side face data (no server storage)
- Secure headers configured

---

## 🐛 Troubleshooting

### Camera Not Working
- Check browser permissions for camera access
- Use HTTPS in production
- Test in a different browser

### API Connection Failed
- Ensure backend is running on port 8000
- Check `VITE_API_URL` environment variable
- Verify CORS is enabled

### Styling Issues
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Restart dev server

---

## 📚 Documentation

- **Setup Guide**: See `VISIONHOMES_SETUP_GUIDE.md`
- **Quick Start**: See `QUICK_START.md`
- **Backend README**: See `backend/README.md`

---

## 👥 Support

For issues, questions, or feature requests:
1. Check the FAQ page in the application
2. Review the setup guides
3. Contact through the Contact page

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 🎉 Version

**VisionHomes AI v1.0.0** - Production Ready

Built with ❤️ for cutting-edge real estate solutions.
