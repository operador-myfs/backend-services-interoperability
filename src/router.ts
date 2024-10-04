import { Router } from 'express';
import documentController from './controllers/index.controller';

const router = Router();

router.get('/actuator/health', documentController.healthcheck);
router.post('/api/transferCitizen', documentController.transferCitizen);
router.post('/api/confirmTransfer', documentController.confirmTransfer);

export default router;
