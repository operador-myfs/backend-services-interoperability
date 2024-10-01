import { Router } from 'express';
import documentController from './controllers/index.controller';

const router = Router();

router.get('/actuator/health', documentController.healthcheck);
router.post('/transferCitizen', documentController.transferCitizen);

export default router;
