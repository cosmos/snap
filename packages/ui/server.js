import express from 'express';
import { handler } from './build/handler.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(handler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});