import { Router } from 'express';
import authController from '../controllers/authentification';

const router = Router();

router.route('/signIn').get((req, res) => {
  authController.signIn(req, res);
});

router.route('/signUp').get((req, res) => {
  authController.signUp(req, res);
});

export default router;
