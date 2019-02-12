const _keys = require('lodash/keys');
const _mergeWith = require('lodash/mergeWith');


/**
 * Station data retrieved via promise chain
 * returns map with station information and current availability
 * @param stationMap 
 */
function getStationData() {

    return Promise.all([getStationInfo(), getStationStatus()])
        .then(results => {
            const stationMap = {}
            const stations = results[0].data.stations;
            const stationStatus = results[1].data.stations;
            
            stations.forEach(station => {
                stationMap[station.station_id] = {
                    name: station.name, 
                    latitude: station.lat,
                    longitude: station.lon, 
                };
            });

            stationStatus.forEach(station => {
                stationMap[station.station_id].ebikes = station.num_ebikes_available
            });


            return stationMap;
        })
        .catch(error => {
            console.log(error);
        })
}

/**
 * updates only the number of ebikes at each station
 */
function updateStationData(stations) {

    return getStationStatus()
        .then(results => {
            results = results.data.stations;
            results.forEach(station => {
                if (stations[station.station_id]) {
                    stations[station.station_id].ebikes = station.num_ebikes_available
                }
            });
            
            return stations;
        })
        .catch(error => {
            console.log(error);
        });
}

/**
 * gets station information such as station name, capacity, id
 * 
 */
function getStationInfo() {
    return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json').then(res => res.json());
    // const res = fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json');
    // return res.json();
}

/**
 * gets station status - current number of bikes available, number of ebikes available
 */
function getStationStatus() {
    return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json').then(res => res.json());
    // return res.json();
}

export {
    getStationData, 
    updateStationData
}