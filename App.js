
import React, {Component} from 'react';
import { StyleSheet, View, Text, Dimensions, PanResponder, Animated, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ListViewStatic from './components/ListViewStatic';
import { getStationData, updateStationData } from './bikeFinder';

import _keys from 'lodash/keys';

const screen = Dimensions.get('window');

const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.05; 
const LONGITUDE_DELTA = LATITUDE_DELTA / ASPECT_RATIO;
const GEOLOCATION_OPTIONS = { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 };

const defaultProps = {
    geolocationOptions: GEOLOCATION_OPTIONS
};

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            stations: {}, 
            markers: {},
            refs: {},
            currentStation: null,
            // draggable window properties:
            offset: 0,
            topHeight: 40,
            bottomHeight: screen.height / 2,
            deviceHeight: screen.height,
            isDividerClicked: false,
            pan: new Animated.ValueXY()
        };
    }

    /**
     * immediately initialize station data/markers
     */
    componentWillMount() {
        this.initializeStationData();
        this.createPanResponder();
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
     * creates pan responder for divider
     * All logic draggable divider taken from: 
     * https://stackoverflow.com/questions/52527803/resizable-flex-layout-in-react-native
     */
    createPanResponder() {
        this._panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            // Initially, set the Y position offset when touch start
            onPanResponderGrant: (e, gestureState) => {
                this.setState({
                    offset: e.nativeEvent.pageY,
                    isDividerClicked: true
                })
            },

            // When we drag the divider, set the bottomHeight (component state) again.
            onPanResponderMove: (e, gestureState) => {
                this.setState({
                    bottomHeight: gestureState.moveY > (this.state.deviceHeight - 40) ? 40 : this.state.deviceHeight - gestureState.moveY,
                    offset: e.nativeEvent.pageY
                })
            },

            onPanResponderRelease: (e, gestureState) => {
                // Do something here for the touch end event
                this.setState({
                    offset: e.nativeEvent.pageY,
                    isDividerClicked: false
                })
            }
        });
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
            <Marker
                onPress={() => this.handleMarkerPress(id)}
                key={id}
                identifier={id}
                coordinate={location}
                title={station.name + ' - ' +  station.ebikes}
                ref={ref => { if (ref) { 
                    this.state.refs[id] = ref
                    this.setState({ refs: this.state.refs });
                }}}
            />
        );
    }

    /**
     * sets current station in state to marker that was pressed
     * @param id 
     */
    handleMarkerPress(id) {
        this.setState({currentStation: id})
    }

    /**
     * displays marker title of selected station
     * @param id 
     */
    handleStationPress(id) {
        // for some reason showCallout method only available through ref
        if (this.state.refs[id]) {
            this.state.refs[id].showCallout();
        }
    }



    render() {
        // cannot render object, must convert markers to array
        const markerList = _keys(this.state.markers).map(key => {
            return this.state.markers[key]
        });

        // create text representation of stations, to pass as prop to ListView
        const stationText = _keys(this.state.stations).filter(key => this.state.stations[key].ebikes > 0).map(key => {
            const station = this.state.stations[key];
            return (
                <TouchableOpacity onPress={() => {this.handleStationPress(key)}} style={key === this.currentStation ? styles.selectedStation : styles.station} key={key}>
                    <Text style={styles.name}>{station.name}</Text><Text style={styles.bikes}>{station.ebikes}</Text>
                </TouchableOpacity>
            )
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

                {/* Top View: Map*/}
                <Animated.View style={[{minHeight: 40, flex: 1}, {height: this.state.topHeight}]} >
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
                </Animated.View>

                {/* Divider */}
                <View 
                    style={[{height: 12}, this.state.isDividerClicked ? {backgroundColor: '#666'} : {backgroundColor: '#e2e2e2'}]} 
                    {...this._panResponder.panHandlers}
                >
                    <Text style={{color: 'darkgrey', textAlign: 'center', marginTop: 3, lineHeight: 10}}> ≡≡ </Text>
                </View>

                {/* Bottom View: Station List */}
                <Animated.View style={[{minHeight: 40}, {height: this.state.bottomHeight}]} >
                    <ListViewStatic 
                        style={styles.stationList} 
                        numStations={numStations} 
                        numBikes={numBikes}  
                        stations={stationText}
                    />
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
    },
    stationList: { 
        // position: 'absolute'
    },
    station: {
        flex: 1, 
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: 'black',
        borderRadius: 5,
        borderBottomWidth: 1,
    },
    stationDark: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'lightblue',
        height: 22
    },
    selectedStation: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'orange',
    },
    name: {
        marginLeft: 10,
        maxWidth: 250,
        fontSize: 16,
        textAlign: 'left',
        padding: 3,
    },
    bikes: {
        marginRight: 10,
        fontSize: 18,
    }
});

App.defaultProps = defaultProps;
