const express = require('express');
const examplesRouter = require('./examples/examples.router');

const api = express.Router();

api.use('/examples', examplesRouter);

module.exports = api;
