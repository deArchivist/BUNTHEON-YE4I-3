import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable compression for better performance
app.use(compression());

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// API routes can be added here if needed

// Handle any other requests by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});