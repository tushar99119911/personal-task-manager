import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes.js';
import { handleServiceError } from './controllers/taskController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173';

app.use(
  cors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', taskRoutes);

app.use(handleServiceError);
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
