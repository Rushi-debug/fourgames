import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/joyverse', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schemas
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  isSuperAdmin: Boolean,
});

const childSchema = new mongoose.Schema({
  username: String,
  password: String,
  hint: String,
  adminId: String,
});

const feedbackSchema = new mongoose.Schema({
  adminId: String,
  childId: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const gameDataSchema = new mongoose.Schema({
  username: { type: String, required: true },
  wordsFound: { type: Number, required: true },
  emotion: { type: String, required: true },
  timestamp: { type: Date, required: true },
  adminId: { type: String, required: true },
});

// Models
const Admin = mongoose.model('Admin', adminSchema);
const Child = mongoose.model('Child', childSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Scores = mongoose.model('Scores', gameDataSchema);

// Routes

// Admin Routes
app.get('/api/admins', async (req, res) => {
  const admins = await Admin.find({}, '-password');
  res.json(admins);
});

app.post('/api/admins', async (req, res) => {
  const { username, password } = req.body;
  const exists = await Admin.findOne({ username });
  if (exists) return res.status(400).json({ error: 'Username already exists' });

  const newAdmin = new Admin({ username, password, isSuperAdmin: false });
  await newAdmin.save();
  res.json({ id: newAdmin._id, username, isSuperAdmin: false });
});

app.post('/api/admins/delete', async (req, res) => {
  const { username } = req.body;
  console.log(`🔁 POST delete request received for admin: ${username}`);

  try {
    const deletedAdmin = await Admin.findOneAndDelete({ username });
    if (!deletedAdmin) {
      console.log(`❌ No admin found with username: ${username}`);
      return res.status(404).json({ error: 'Admin not found' });
    }

    console.log(`✅ Deleted admin: ${username}`);
    res.json({ success: true });
  } catch (err) {
    console.error(`🔥 Error deleting admin (${username}):, err`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auth Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username, password });
    if (admin) return res.json({ role: 'admin' });

    const child = await Child.findOne({ username, password });
    if (child) return res.json({ role: 'user' });

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Children Routes
app.get('/api/children', async (req, res) => {
  const { adminId } = req.query;
  let query = {};
  if (adminId) query.adminId = adminId;

  const children = await Child.find(query, '-password');
  res.json(children);
});

app.post('/api/children', async (req, res) => {
  const { username, password, hint, adminId } = req.body;
  const exists = await Child.findOne({ username });
  if (exists) return res.status(400).json({ error: 'Username already exists' });

  const newChild = new Child({ username, password, hint, adminId });
  await newChild.save();
  res.json({ id: newChild._id, username, hint, adminId });
});

// Game Scores
app.post('/save_game_data', async (req, res) => {
  try {
    const { username, age, gender, wordsFound, emotion, timestamp, adminId } = req.body;

    // Validate required fields
    if (!username || !wordsFound || !emotion || !timestamp || !adminId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new game data entry
    const gameData = new Scores({
      username,
      wordsFound,
      emotion,
      timestamp: new Date(timestamp),
      adminId,
    });

    // Save to MongoDB
    await gameData.save();
    console.log('Game data saved:', { username, wordsFound, emotion, timestamp, adminId });

    res.status(200).json({ message: 'Game data saved successfully' });
  } catch (err) {
    console.error('Error saving game data:', err);
    res.status(500).json({ error: 'Failed to save game data' });
  }
});

// Get game data for all children of an admin
app.get('/api/game_data', async (req, res) => {
  const { admin } = req.query;
  try {
    // Find all children for the admin
    const children = await Child.find({ adminId: admin }, 'username');
    const usernames = children.map(child => child.username);

    // Fetch game data for those children
    const gameData = await Scores.find({ username: { $in: usernames } }).sort({ timestamp: -1 });
    res.json(gameData);
  } catch (err) {
    console.error('Error fetching game data:', err);
    res.status(500).json({ error: 'Failed to fetch game data' });
  }
});

// Feedback
app.post('/api/feedback', async (req, res) => {
  const { adminId, childId, message } = req.body;
  const newFeedback = new Feedback({ adminId, childId, message });
  await newFeedback.save();
  res.json(newFeedback);
});

app.get('/api/feedback', async (req, res) => {
  const feedbacks = await Feedback.find();
  res.json(feedbacks);
});

// Server Listen
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});