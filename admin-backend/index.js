const path = require('path');
const express = require('express');
const mongoose = require(path.resolve(__dirname, '..', 'api', 'node_modules', 'mongoose'));
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const cors = require('cors');
const {
  User,
  Balance,
  Banner,
} = require('@librechat/data-schemas').createModels(mongoose);
const { createUser } = require('../config/modules/createUser');
const { banUser } = require('../config/modules/banUser');
const { updateBanner: updateBannerModule } = require('../config/modules/updateBanner');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/LibreChat';

app.use(express.json());
app.use(cors());

mongoose.connect(MONGO_URI)
  .then(() => console.log('Admin Backend Connected to MongoDB'))
  .catch(err => console.error('Admin Backend MongoDB connection error:', err));

// Helper function to get all balances
async function getAllBalances() {
  const users = await User.find({});
  const balances = [];
  for (const user of users) {
    const balance = await Balance.findOne({ user: user._id });
    if (balance) {
      balances.push({
        id: user._id,
        email: user.email,
        balance: balance.tokenCredits,
      });
    } else {
      balances.push({
        id: user._id,
        email: user.email,
        balance: 0, // Default to 0 if no balance found
      });
    }
  }
  return balances;
}

// Helper function to get user statistics
async function getUserStats() {
  const users = await User.find({});
  const stats = {
    totalUsers: users.length,
    activeUsers: 0, // This would require more complex logic to determine "active"
    newUsers24h: 0, // This would require more complex logic to determine "new"
    bannedUsers: 0,
    verifiedEmails: 0,
    unverifiedEmails: 0,
  };

  for (const user of users) {
    if (user.banned) {
      stats.bannedUsers++;
    }
    if (user.emailVerified) {
      stats.verifiedEmails++;
    } else {
      stats.unverifiedEmails++;
    }
  }
  return stats;
}

const TranslationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  en: { type: String, required: true },
  es: { type: String },
  fr: { type: String },
});
const Translation = mongoose.models.Translation || mongoose.model('Translation', TranslationSchema);

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credits: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
});
const Package = mongoose.models.Package || mongoose.model('Package', PackageSchema);

const InviteSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  token: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});
const Invite = mongoose.models.Invite || mongoose.model('Invite', InviteSchema);


// API endpoint for balances
app.get('/api/balances', async (req, res) => {
  try {
    const balances = await getAllBalances();
    res.json(balances);
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ message: 'Failed to fetch balances' });
  }
});

// API endpoint for user statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getUserStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics' });
  }
});

// API endpoint for translations
app.get('/api/translations', async (req, res) => {
  try {
    const translations = await Translation.find({});
    res.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ message: 'Failed to fetch translations' });
  }
});
app.put('/api/balances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tokenCredits } = req.body;
    if (typeof tokenCredits !== 'number') {
      return res.status(400).json({ message: 'tokenCredits must be a number' });
    }
    const updatedBalance = await Balance.findOneAndUpdate(
      { user: id },
      { tokenCredits },
      { upsert: true, new: true }
    );
    res.json(updatedBalance);
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ message: 'Failed to update balance' });
  }
});

app.post('/api/translations', async (req, res) => {
  try {
    const newTranslation = new Translation(req.body);
    await newTranslation.save();
    res.status(201).json(newTranslation);
  } catch (error) {
    console.error('Error creating translation:', error);
    res.status(500).json({ message: 'Failed to create translation' });
  }
});

app.put('/api/translations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTranslation = await Translation.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedTranslation);
  } catch (error) {
    console.error('Error updating translation:', error);
    res.status(500).json({ message: 'Failed to update translation' });
  }
});

app.delete('/api/translations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Translation.findByIdAndDelete(id);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Error deleting translation:', error);
    res.status(500).json({ message: 'Failed to delete translation' });
  }
});

// User Service
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});
app.post('/api/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's banned status
    user.banned = true;
    user.banDuration = duration || null; // Optional duration field
    await user.save();

    console.log(`User ${user.email} (ID: ${id}) has been banned.`);
    res.status(200).json({ message: `User ${user.email} has been banned.`, user: user });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Failed to ban user', error: error.message });
  }
});

app.post('/api/users/:id/unban', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { banned: false }, { new: true });
    res.json(user);
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ message: 'Failed to unban user' });
  }
});

// Banner Service
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
});

app.post('/api/banners', async (req, res) => {
  try {
    const newBanner = new Banner(req.body);
    await newBanner.save();
    res.status(201).json(newBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Failed to create banner' });
  }
});

app.put('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBanner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Failed to update banner' });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Failed to delete banner' });
  }
});

// Invite Service
app.post('/api/invite', async (req, res) => {
  try {
    const { email, role } = req.body;
    const newInvite = new Invite({ email, role, token: Math.random().toString(36).substring(2) });
    await newInvite.save();
    res.status(200).json({ message: `Invite sent to ${email}` });
  } catch (error) {
    console.error('Error sending invite:', error);
    res.status(500).json({ message: 'Failed to send invite' });
  }
});

// Package Service
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await Package.find({});
    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Failed to fetch packages' });
  }
});

app.post('/api/packages', async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ message: 'Failed to create package' });
  }
});

app.put('/api/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPackage = await Package.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedPackage);
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ message: 'Failed to update package' });
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Package.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ message: 'Failed to delete package' });
  }
});

// Password Service
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Password reset requested for: ${email}`);
    res.status(200).json({ message: `Password reset instructions sent to ${email}` });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Terms Service
app.post('/api/reset-terms', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Terms reset requested for: ${email}`);
    res.status(200).json({ message: `Terms reset for ${email}` });
  } catch (error) {
    console.error('Error resetting terms:', error);
    res.status(500).json({ message: 'Failed to reset terms' });
  }
});

// System Service (Placeholders)
app.post('/api/system/stop-backend', (req, res) => {
  console.log('System: Stop Backend requested.');
  res.status(200).json({ message: 'Backend stop command sent (placeholder).' });
});

app.post('/api/system/deployed-update', (req, res) => {
  console.log('System: Deployed Update requested.');
  res.status(200).json({ message: 'Deployed update command sent (placeholder).' });
});

app.post('/api/system/prepare-update', (req, res) => {
  console.log('System: Prepare Update requested.');
  res.status(200).json({ message: 'Prepare update command sent (placeholder).' });
});

// Admin Routes
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'dummy-admin-token') {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

const adminRouter = express.Router();
adminRouter.use(authenticate);

adminRouter.post('/create-user', async (req, res) => {
  const { email, password, name, username, emailVerified } = req.body;
  try {
    const user = await createUser({ email, password, name, username, emailVerified });
    res.status(200).json({ message: 'User created', user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message });
  }
});

adminRouter.post('/ban-user', async (req, res) => {
  const { email, duration } = req.body;
  try {
    await banUser(email, duration, req, res);
    res.status(200).json({ message: `User ${email} has been banned.` });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(400).json({ message: error.message });
  }
});

adminRouter.post('/update-banner', async (req, res) => {
  const { displayFrom, displayTo, message, isPublic } = req.body;
  try {
    const banner = await updateBannerModule({ displayFrom, displayTo, message, isPublic });
    res.status(200).json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(400).json({ message: error.message });
  }
});

app.use('/api/admin', adminRouter);

// Auth Service
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // In a real application, you would validate these credentials against a database
  // For now, we'll use hardcoded admin credentials
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@example.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sjj5BYQsHUJeeebEFhFhKjdRu3eyWSMj';

  if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // In a real application, generate a proper JWT
    const token = 'dummy-admin-token'; 
    res.status(200).json({ message: 'Login successful', token, user: { email: ADMIN_USERNAME, role: 'admin' } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`Admin Backend listening on port ${PORT}`);
});