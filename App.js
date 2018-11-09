
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
import {ListView} from './components/ListView';
import ListViewStatic from './components/ListViewStatic';
import { getBikeData } from './bikeFinder';

import _keys from 'lodash/keys';

const screen = Dimensions.get('window');

const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.05; //???????
const LONGITUDE_DELTA = LATITUDE_DELTA / ASPECT_RATIO; //?????

export default class App extends Component {

    constructor() {
        super();
        this.state = {
            stations: {}, 
            markers: [],
            currentStation: null
        };
    }

    componentDidMount() {
        // this.startLocationTracking();
        this.getStations();
        setInterval(() => {
            this.getStations();
        }, 5000)
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
        const $ = this;
        getBikeData(stations)
            .then(stationMap => {
                //remove marker if no more ebikes at station
                _keys(stations).forEach(id => {
                    if (stationMap[id].ebikes < 1) {
                        delete stations[id];
                    }
                });

                _keys(stationMap).forEach(id => {
                    const station = stationMap[id];
                    if (!stations.id && station.ebikes > 0) {
                        stations[id] = stationMap[id];
                    } else if (station.id && station.ebikes > 0) {
                        stations[id].ebikes = station.ebikes;
                    }
                });

                $.setState({
                    stations
                }, () => {
                    $.updateMarkers();
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    updateMarkers() {
        //station => marker logic
        const { stations, markers } = this.state;

        _keys(stations).forEach(id => {
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
                    onPress={() => this.handlePress(id)}
                    key={id}
                    identifier={id}
                    coordinate={location}
                    title={name}
                />
            )
            markers.push(marker);
        });

        this.setState({
            markers: markers
        });
        console.log('updated');
    }

    handlePress(id) {
        this.setState({currentStation: id})
    }

    render() {
        console.log(this.state.currentStation);
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
                    <ListViewStatic style={styles.stationList} stations={this.state.stations} currentStation={this.state.currentStation} />
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
        height: '55%',
        top: 0,
    },
    stationList: { 
        position: 'absolute'
    }
});
