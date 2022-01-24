const axios = require('axios');

const launchesDatabase = require('./launches.mongo').launches;
const launchesSpaceXDatabase = require('./launches.mongo').spaceXLaunches;
const planets = require('../planets/planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

async function launchWithIdExists(launchId) {
    return await launchesDatabase.findOne({
        flightNumber: launchId,
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches({ skip, limit }) {
    return await launchesDatabase
        .find({}, { '_id': 0, '__v': 0 })
        .sort({
            flightNumber: 1
        })
        .skip(skip)
        .limit(limit);
}

async function getAllSpaceXLaunches({ skip, limit }) {
    return await launchesSpaceXDatabase
        .find({}, { '_id': 0, '__v': 0 })
        .sort({
            flightNumber: 1
        })
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch, isForSpaceX) {
    const database = isForSpaceX ? launchesSpaceXDatabase : launchesDatabase;
    await database.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planets where found!');
    }
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero to Mastery', 'NASA'],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });
    return aborted.modifiedCount === 1;
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateSpaceXLaunches() {
    console.log("Fetching SpaceX launches...");
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading data!');
        throw new Error('Launch Data failed to respond');
    }

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payLoads = launchDoc['payloads'];
        const customers = payLoads.flatMap((payload) => payload.customers);
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        }
        await saveLaunch(launch, true);
    }
}

async function loadLaunchesSpaceXData() {
    const firstLaunch = await launchesSpaceXDatabase.findOne({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if (firstLaunch) {
        console.log('Launch data already loaded');
        return;
    } else {
        populateSpaceXLaunches();
    }

}

module.exports = {
    abortLaunchById,
    getAllLaunches,
    getAllSpaceXLaunches,
    launchWithIdExists,
    loadLaunchesSpaceXData,
    scheduleNewLaunch,
}