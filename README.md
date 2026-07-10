# AfriLogistics - Logistics Platform for Africa

A complete logistics management platform built for the African market. Includes route optimization, warehouse management, fleet tracking, fuel optimization, delivery prediction, mobile money integration, SMS notifications, and multi-language support.

## Architecture

```
packages/
├── shared/          # Types, utilities, shared logic
├── api/             # Express.js backend API with Socket.IO
├── web/             # Next.js dashboard (React + Tailwind)
├── mobile/          # React Native Expo driver app
└── ml/              # Python ML prediction engine
```

## Features

### Route Optimization
- Nearest-neighbor + 2-opt algorithm for multi-stop routes
- African road condition modeling (tarmac, gravel, dirt)
- Weather and traffic adjustment
- Batch splitting for large deliveries
- Real-time route recalculation

### Warehouse Management
- Zone-based warehouse layout (Receiving, Storage, Picking, Packing, Dispatch, Returns)
- Auto bin assignment with capacity tracking
- Item movement tracking with audit trail
- Low stock and expiry alerts
- Barcode scanning support (mobile app)

### Fleet Tracking
- Real-time GPS tracking via WebSocket
- Geofencing with entry/exit alerts
- Speed monitoring and overspeed alerts
- Trip summaries with distance, time, idle analysis
- Vehicle health scoring
- Driver performance metrics

### Fuel Optimization
- Per-vehicle consumption tracking
- Cost analysis with African fuel prices (NGN, KES, ZAR, GHS, TZS, etc.)
- Efficiency scoring and trend analysis
- Refueling alerts based on estimated range
- Savings opportunity reports

### Delivery Prediction
- ML-based ETA prediction
- Weather, traffic, time-of-day, and day-of-week factors
- African seasonal modeling (rainy seasons, holidays)
- Delay probability estimation
- Alternative time slot suggestions
- Self-learning from historical data

### African Market Features
- **Mobile Money**: MTN MoMo, M-Pesa, Airtel Money, Tigo Pesa, Vodacom M-Pesa
- **Multi-Language**: English, French, Swahili, Hausa, Yoruba, Zulu, Amharic, Arabic, Portuguese
- **SMS Notifications**: Order confirmations, status updates, delivery alerts, OTP
- **Offline-First**: Driver app queues actions when offline, syncs when connected
- **Motorbike Support**: Boda-boda/okada delivery tracking
- **Country-Specific**: Fuel prices, holidays, road conditions for 12+ African countries
- **Low-Bandwidth**: Optimized for 2G/3G networks

## Supported Countries

Nigeria, Kenya, South Africa, Ghana, Tanzania, Uganda, Ethiopia, Senegal, Morocco, Cameroon, Zambia, Rwanda, Cote d'Ivoire

## Supported Currencies

NGN, KES, ZAR, GHS, TZS, UGX, EGP, XOF, XAF, ETB, MAD, USD

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL with PostGIS
- Redis (optional, for production)

### Installation

```bash
npm install
```

### Development

```bash
# API Server
npm run dev:api

# Web Dashboard
npm run dev:web

# Mobile App
npm run dev:mobile

# ML Engine
cd packages/ml && python predict.py
```

### Environment Variables

Copy `.env.example` to `.env` in `packages/api/` and configure:
- Database connection
- SMS provider API key
- Mobile Money API keys
- Google Maps / Mapbox token
- Weather API key

### Database Setup

```bash
psql -U postgres -d afrilogistics -f packages/api/src/utils/database-schema.sql
```

## API Endpoints

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order
- `PATCH /api/orders/:id/status` - Update status
- `GET /api/orders/:id/track` - Track with prediction

### Routes
- `POST /api/routes/optimize` - Optimize multi-stop route
- `POST /api/routes/split-batches` - Split into batches

### Warehouse
- `POST /api/warehouses` - Create warehouse
- `GET /api/warehouses/:id/stats` - Get stats
- `POST /api/warehouses/:id/receive` - Receive item
- `POST /api/warehouses/:id/move` - Move item between zones
- `POST /api/warehouses/:id/dispatch` - Dispatch item

### Fleet
- `POST /api/fleet/vehicles` - Register vehicle
- `GET /api/fleet/locations` - All vehicle locations
- `POST /api/fleet/trips/start` - Start trip
- `POST /api/fleet/trips/end` - End trip

### Fuel
- `POST /api/fuel/records` - Add fuel record
- `GET /api/fuel/analytics/:orgId` - Fuel analytics
- `GET /api/fuel/savings/:orgId` - Savings report

### Predictions
- `POST /api/predictions/delivery` - Predict delivery time
- `GET /api/predictions/delay-patterns` - Delay patterns

### Mobile Money
- `POST /api/momo/collect` - Initiate collection
- `POST /api/momo/disburse` - Initiate disbursement
- `GET /api/momo/status/:id` - Check status

## WebSocket Events

```javascript
// Client subscribes to vehicle updates
socket.emit("subscribe:vehicle", vehicleId);

// Client sends location update
socket.emit("location:update", { vehicleId, lat, lng, speed, heading });

// Server broadcasts location change
socket.on("location:changed", (update) => { });

// Server broadcasts fleet update
socket.on("fleet:update", (data) => { });
```

## Mobile App (Driver)

The React Native Expo app provides:
- Phone-based OTP authentication
- Delivery list with navigation
- Proof of delivery (photo + signature)
- Cash on delivery collection
- Warehouse barcode scanning
- Offline mode with action queue
- Multi-language support
- Profile and performance stats

## Web Dashboard

The Next.js dashboard provides:
- Real-time fleet tracking map
- Order management with status tracking
- Warehouse zone utilization overview
- Fuel analytics and cost trends
- Delivery prediction insights
- Alert management
- Responsive design (mobile + desktop)

## License

MIT
