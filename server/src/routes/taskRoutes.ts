import { Router } from 'express';
import {
  createTaskHandler,
  deleteTaskHandler,
  getTask,
  listTasks,
  toggleTaskHandler,
  updateTaskHandler,
} from '../controllers/taskController.js';

const router = Router();

router.get('/', listTasks);
router.get('/:id', getTask);
router.post('/', createTaskHandler);
router.put('/:id', updateTaskHandler);
router.patch('/:id/toggle', toggleTaskHandler);
router.delete('/:id', deleteTaskHandler);

export default router;
