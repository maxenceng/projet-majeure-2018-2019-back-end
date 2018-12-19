import defaultRoute from '../controllers/testcontroller';

const express = require('express');

const router = express.Router();

router.route('/').get((req, res) => {
  defaultRoute.test(res);
});
