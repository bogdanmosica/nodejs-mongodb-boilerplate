const express = require('express');

const {
    httpAbortLaunch,
    httpAddNewLaunch,
    httpGetAllLaunches,
    httpGetAllSpaceXLaunches,
} = require('./launches.controller');

const launchesRouter = express.Router();

launchesRouter.delete('/:id', httpAbortLaunch);
launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.get('/spacex', httpGetAllSpaceXLaunches);

module.exports = launchesRouter;