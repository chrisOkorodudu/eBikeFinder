
import React, {Component} from 'react';
// import {Platform, StyleSheet, Text, View} from 'react-native';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  AlertIOS
} from 'react-native';
import MapView, { Marker, AnimatedRegion, MarkerAnimated } from 'react-native-maps';
import ListView from './components/ListView';
import { getBikeData } from './bikeFinder';


import _ from 'lodash';

const screen = Dimensions.get('window');

const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.05; //???????
const LONGITUDE_DELTA = LATITUDE_DELTA / ASPECT_RATIO; //?????

export default class App extends Component {

    constructor() {
        super();
        this.state = {
            stations: {}, 
            markers: []
        };
    }

    componentDidMount() {
        // this.startLocationTracking();
        this.getStations();
        setInterval(() => {
            this.updateMarkers();
        }, 10000)
    }

    startLocationTracking(cb) {
        navigator.geolocation.watchPosition(
            cb,
            error => console.log(error),
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000
            }
        );
    }

    getStations() {

        const {stations} = this.state;
        const scope = this;
        getBikeData(stations)
            .then(stationMap => {
                //remove marker if no more ebikes at station
                _.keys(stations).forEach(id => {
                    if (stationMap[id].ebikes < 1) {
                        stations[id].setMap(null);
                        delete station[id];
                    }
                });

                _.keys(stationMap).forEach(id => {
                    const station = stationMap[id];
                    if (!stations.id && station.ebikes > 0) {
                        stations[id] = stationMap[id];
                    } else if (station.id && station.ebikes > 0) {
                        stations[id].ebikes = station.ebikes;
                    }
                });

                scope.setState({
                    stations
                }, () => {
                    scope.updateMarkers();
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    updateMarkers() {
        //station => marker logic
        const { stations, markers } = this.state;

        _.keys(stations).forEach(id => {
            const exists = markers.find(marker => {
                return marker.key === id;
            });
            if (exists) {
                return;
            }

            const station = stations[id];
            const {name} = station;
            const location = {
                latitude: station.latitude, 
                longitude: station.longitude,
            };
            const marker = (
                <MarkerAnimated
                    key={id}
                    identifier={id}
                    coordinate={location}
                    title={name}
                />
            )
            markers.push(marker);
        });

        this.setState({
            markers
        });
        console.log('updated');
    }

    render() {
        return (
            <View style={styles.container}>
                <MapView
                    style={styles.map}
                    ref={ref => {this.map = ref;}}
                        initialRegion={{
                        latitude: 40.758896,
                        longitude: -73.985130,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA
                    }}
                >
                    {this.state.markers}
                </MapView>
                <ListView style={styles.stationList} stations={this.state.stations} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    map: {
        // ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '67%',
        top: 0,
    },
    stationList: { 
    
    }
});
