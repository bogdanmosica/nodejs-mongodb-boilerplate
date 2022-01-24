const express = require('express');


const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');

const a = 1;


const api = express.Router();

api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter);

module.exports = api;