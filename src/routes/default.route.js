import { Router } from 'express';
import defaultRoute from '../controllers/test.controller';

const router = Router();

router.route('/').get((req, res) => {
  defaultRoute.test(res);
});

export default router;
