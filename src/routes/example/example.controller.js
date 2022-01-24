const {
    abortLaunchById,
    getAllLaunches,
    getAllSpaceXLaunches,
    launchWithIdExists,
    scheduleNewLaunch,
} = require('../../models/launches/launches.model');
const {
    getPagination,
} = require('../../services/query');

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches({ skip, limit });

    return res.status(200).json(launches);
};

async function httpGetAllSpaceXLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllSpaceXLaunches({ skip, limit });

    return res.status(200).json(launches);
};

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    // Validation;
    const {
        launchDate,
        mission,
        rocket,
        target,
    } = launch;

    if (!launchDate ||
        !mission ||
        !rocket ||
        !target
    ) {
        return res.status(400).json({
            error: 'Missing required launch property'
        });
    }

    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid launch date',
        });
    }

    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
};

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);
    const existsLaunch = await launchWithIdExists(launchId);
    if (!existsLaunch) {
        return res.status(404).json({
            error: 'Launch not found!'
        });
    }
    const abortedLaunch = await abortLaunchById(launchId);

    if (!abortedLaunch) {
        return res.status(400).json({
            error: 'Launch not aborted!',
        })
    }
    return res.status(200).json({
        ok: true
    });
}

module.exports = {
    httpAbortLaunch,
    httpAddNewLaunch,
    httpGetAllLaunches,
    httpGetAllSpaceXLaunches,
}