// eslint-disable-next-line no-console
console.log(`Hello ${1 + 7}`);

const express = require('express');

const app = express();

const defaultRoute = require("./src/routes/default.route.js");

app.use(defaultRoute);
app.listen(3000);