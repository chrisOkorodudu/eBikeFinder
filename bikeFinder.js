const _keys = require('lodash/keys');

function getBikeData(stationMap) {

    return new Promise((resolve, reject) => {
        const stationMap = {};
        getStationInfo()
            .then(response => {
                const stations = response.data.stations;

                stations.forEach(station => {
                    stationMap[station.station_id] = {
                        name: station.name,
                        latitude: station.lat,
                        longitude: station.lon
                    };
                });

                getStationStatus()
                    .then(response => {
                        const stationData = response.data.stations;
                        stationData.forEach(station => {
                            stationMap[station.station_id].ebikes = station.num_ebikes_available;
                        });

                        resolve(stationMap);
                    })
                    .catch(error => {
                        reject(error);
                    });

            })
            .catch(err => {
                console.log(err);
            })
    });
}

function getStationInfo() {
    return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
        .then(res => res.json());
}

function getStationStatus() {
    return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
        .then(res => res.json());
}

export {
    getBikeData
}