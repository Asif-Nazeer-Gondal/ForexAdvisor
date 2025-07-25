// backend/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Example route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// TODO: Import and use your routes here
// import userRoutes from './routes/userRoutes';
// app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});