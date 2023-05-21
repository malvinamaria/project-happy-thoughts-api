import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

mongoose.set('strictQuery', true); // To avoid deprecation warning

const mongoUrl =
  process.env.MONGO_URL || 'mongodb://localhost:27017/project-happy';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 7080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello Technigo API!');
});

// define schema for thoughts
const { Schema } = mongoose;
const ThoughtSchema = new Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true,
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

// Create a model using the schema
const Thought = mongoose.model('Thought', ThoughtSchema);

// Start defining your routes here
app.get('/thoughts', async (req, res) => {
  try {
    const thoughts = await Thought.find()
      .sort({ createdAt: 'desc' })
      .limit(20)
      .exec();
    res.status(200).json(thoughts);
  } catch (err) {
    res.status(400).json({ message: 'Error', error: err.errors });
  }
});

// Post a new thought
app.post('/thoughts', async (req, res) => {
  try {
    const newThought = await new Thought(req.body).save();
    res.status(200).json(newThought);
  } catch (err) {
    res.status(400).json({ message: 'Error', error: err.errors });
  }
});

// Get a specific thought and update the hearts
// app.post('/thoughts/:thoughtId/like', async (req, res) => {
//   try {
//     const updatedThought = await Thought.findOneAndUpdate(
//       { _id: req.params.id },

//       { $inc: { hearts: 1 } },
//       { new: true }
//     );
//     res.status(200).json(updatedThought);
//   } catch (err) {
//     res.status(400).json({ message: 'Error', error: err.errors });
//   }
// });

app.post('/thoughts/:thoughtId/like', async (req, res) => {
  const { thoughtId } = req.params;
  try {
    const updatedThought = await Thought.findByIdAndUpdate(thoughtId, {
      $inc: { likes: 1 },
    });
    res.status(201).json({
      success: true,
      response: `Happy thought: ${updatedThought.message} has been updated`,
    });
  } catch (e) {
    res.status(400).json({ message: 'Error', error: err.errors });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
