// ServeFlow — Express Server
// ============================================
'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Static Files (serve entire project directory) ----
app.use(express.static(path.join(__dirname)));

// ---- API Routes ----
app.use('/api/workers',       require('./routes/api.workers'));
app.use('/api/attendance',    require('./routes/api.attendance'));
app.use('/api/replacements',  require('./routes/api.replacements'));
app.use('/api/reminders',     require('./routes/api.reminders'));
app.use('/api/schedule',      require('./routes/api.schedule'));
app.use('/api/orders',        require('./routes/api.orders'));
app.use('/api/overview',      require('./routes/api.overview'));
app.use('/api/notifications', require('./routes/api.notifications'));

// ---- Catch-all: serve index.html for any unmatched routes ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- Start ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │                                             │');
  console.log('  │   ⛪  ServeFlow Server is running!          │');
  console.log(`  │   🌐  http://localhost:${PORT}               │`);
  console.log('  │                                             │');
  console.log('  │   Pages:                                    │');
  console.log(`  │   → Landing:  http://localhost:${PORT}/        │`);
  console.log(`  │   → Pricing:  http://localhost:${PORT}/pricing.html │`);
  console.log(`  │   → Dashboard:http://localhost:${PORT}/dashboard.html │`);
  console.log(`  │   → Checkout: http://localhost:${PORT}/checkout.html  │`);
  console.log('  │                                             │');
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
});
