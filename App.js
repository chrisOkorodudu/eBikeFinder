
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
import { getStationData, updateStationData } from './bikeFinder';

import _keys from 'lodash/keys';
import isEqual from 'lodash/isEqual';

const screen = Dimensions.get('window');

const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.05; //???????
const LONGITUDE_DELTA = LATITUDE_DELTA / ASPECT_RATIO; //?????
const PERSON_ID = 'user'; //should generate GUID
const GEOLOCATION_OPTIONS = { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 };

const defaultProps = {
    geolocationOptions: GEOLOCATION_OPTIONS
};

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentLocation: null,
            stations: {}, 
            markers: {},
            currentStation: null
        };
    }

    /**
     * immediately initialize station data/markers
     */
    componentWillMount() {
        this.initializeStationData();
    }

    /**
     * may not be necessary for this to go here
     */
    componentDidMount() {
        setInterval(() => {
            this.updateStations();
        }, 5000)
    }

    /**
     * retrieve station data (name, id, location, etc) from API call, store in state
     */
    initializeStationData() {
        const $ = this;
        getStationData()
            .then(stationMap => {
                $.setState({ stations: stationMap }, () => {
                    this.createMarkers();
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    /**
     * station -> marker logic 
     * marker only created if station.ebikes > 0
     */
    createMarkers() {
        const {stations} = this.state;
        const markers = {};
        _keys(stations).filter(id => stations[id].ebikes > 0).forEach(id => {
            markers[id] = this.createMarker(id, stations[id]);
        });


        this.setState({
            markers
        });  
    }

    /**
     * update ebike data for each station
     */
    updateStations() {

        const {stations} = this.state;
        const $ = this;
        updateStationData(stations)
            .then(stationMap => {
                _keys(stations).forEach(id => {
                    stations[id].ebikes = stationMap[id].ebikes
                });
                $.setState({ stations }, () => {
                    this.updateMarkers();
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    /**
     * create new marker if station has ebikes/marker doesn't exist, delete marker if ebikes at station is zero
     */
    updateMarkers() {

        const { stations, markers } = this.state;

        _keys(stations).forEach(id => {
            if (stations[id].ebikes > 0 && !markers[id]) {
                markers[id] = this.createMarker(id, stations[id]); 
            } else if (stations[id].ebikes == 0 && markers[id]) {
                // may have to do something like marker.setMap(null)
                delete markers[id]
            }
        });

        this.setState({ markers });
    }

    /**
     * creates a new Maps marker component with specified id and location
     * @param id 
     * @param station 
     */
    createMarker(id, station) {
        const location = {
            latitude: station.latitude,
            longitude: station.longitude
        }

        return (
            <MarkerAnimated
                onPress={() => this.handlePress(id)}
                key={id}
                identifier={id}
                coordinate={location}
                title={station.name + ', ' +  station.ebikes}
            />
        )
    }

    handlePress(id) {
        this.setState({currentStation: id})
    }

    render() {
        // cannot render object, must convert markers to array
        const markerList = _keys(this.state.markers).map(key => {
            return this.state.markers[key]
        });

        // calculate ebike numbers here as opposed to passing markers as prop
        const { stations, markers } = this.state;
        let numBikes = 0;
        _keys(markers).forEach(id => {
            numBikes += stations[id].ebikes;
        });
        const numStations = _keys(markers).length;

        return (
            <View style={styles.container}>
                    <MapView
                        style={styles.map}
                        showsUserLocation={true}
                        ref={ref => {this.map = ref;}}
                            initialRegion={{
                            latitude: 40.758896,
                            longitude: -73.985130,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA
                        }}
                    >
                        {markerList}
                    </MapView>
                    <ListViewStatic 
                        style={styles.stationList} 
                        stations={this.state.stations} 
                        numStations={numStations} 
                        numBikes={numBikes} 
                        currentStation={this.state.currentStation} 
                    />
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

App.defaultProps = defaultProps;
