const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// --- Environment loading (attempt root .env -> admin-backend/.env) ---
(() => {
  const tried = [];
  const candidates = [
    path.resolve(__dirname, '..', '.env'), // project root
    path.resolve(__dirname, '.env'), // local admin-backend
  ];
  for (const p of candidates) {
    tried.push(p);
    if (fs.existsSync(p)) {
      try {
        require('dotenv').config({ path: p });
        // eslint-disable-next-line no-console
        console.log(`[env] Loaded environment variables from: ${p}`);
        break;
      } catch (e) {
        console.warn(`[env] Failed loading ${p}:`, e.message);
      }
    }
  }
})();

const balancesRouter = require('./routes/balances');
const usersRouter = require('./routes/users');
const translationsRouter = require('./routes/translations');
const adminRouter = require('./routes/admin');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
// Use a dedicated port variable to avoid clashing with root app's PORT (e.g., 3080)
const PORT = process.env.ADMIN_BACKEND_PORT || process.env.ADMIN_PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/LibreChat';

app.use(express.json());
app.use(cors({
  origin: (origin, cb) => cb(null, origin || '*'),
  credentials: true,
}));

mongoose.connect(MONGO_URI)
  .then(() => console.log('Admin Backend Connected to MongoDB'))
  .catch(err => console.error('Admin Backend MongoDB connection error:', err));

// Use the routes
app.use('/api/balances', balancesRouter);
app.use('/api/users', usersRouter);
app.use('/api/translations', translationsRouter);
app.use('/api/admin', adminRouter);

// Simple auth login (email/password) -> JWT (for dashboard placeholder)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: 'invalid credentials' });
    const bcrypt = require('bcryptjs');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'invalid credentials' });
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ sub: user._id, email: user.email }, secret, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Admin Backend listening on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set ADMIN_BACKEND_PORT to a free port (e.g. 3002) in admin-backend/.env`);
  } else {
    console.error('Server error:', err);
  }
});

// Export for tests / scripts
module.exports = app;