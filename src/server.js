const http = require("http");

require('dotenv').config();

const app = require("./app");

const { mongoConnect } = require("./services/mongo");
const { loadPlanetsData } = require("./models/planets/planets.model");
const { loadLaunchesSpaceXData } = require("./models/launches/launches.model");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
    await mongoConnect();

    await loadPlanetsData();
    await loadLaunchesSpaceXData();

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
};

startServer();


