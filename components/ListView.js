import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    AlertIOS
} from 'react-native';

import _keys from 'lodash/keys';
import _findIndex from 'lodash/findIndex';


export class ListView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            stationList: [],
            selectedStation: null,
            updated: false
        }
        this.scrollView = null;
    }

    // componentDidUpdate() {
    //     if (_keys(this.props.stations).length > 0 && !this.state.updated) {
    //         this.getStations();
    //         this.setState({updated: true});
    //     }
    //     const selectedStation = this.getSelectedStation(this.props.currentStation);
    //     this.setState({selectedStation: selectedStation});
    // }

    componentWillReceiveProps() {
        if (_keys(this.props.stations).length > 0) {
            this.getStations();
        }
        const selectStation = this.getSelectedStation(this.props.currentStation);
        console.log(selectStation);
        if (selectStation !== this.state.selectedStation) {
            this.setState({selectedStation: selectStation});
            this.hightlightStation();
        }
        
        
    }

    getSelectedStation(stationId) {
        if (stationId) {
            return _findIndex(_keys(this.props.stations), (id) => id === stationId);
        }
        return null;
    }

    getStations() {
        const stations = this.props.stations;
        let i = 0;
        const stationList = _keys(stations).map(key => {
            const station = stations[key];
            i++;

            return (
                <View style={i % 2 == 0 ? styles.station : styles.stationDark} key={key}>
                    <Text style={styles.name}>{station.name}</Text><Text style={styles.bikes}>{station.ebikes}</Text>
                </View>
            )
        });

       this.setState({stationList: stationList});

    }

    // seems like this would need to involve complex ref tag logic, 
    // easier option may be to swap selected station for first element in list, re-render with it at the top 
    // scrollToStation() {
    //     if (this.state.selectedStation) {
    //         this.scrollView.scrollTo({y: this.selectedStation * 22 + 300, animated: true});
    //         console.log('scrolling');
    //     }
    // }
    hightlightStation() {
        const {stationList, selectedStation} = this.state;
        if (selectedStation) {
            console.log('here');
            const station = stationList[selectedStation];
            stationList[selectedStation] = (
                <View style={styles.selectedStation} key={this.props.currentStation}>
                    <Text style={styles.name}>{station.name}</Text><Text style={styles.bikes}>{station.ebikes}</Text>
                </View>
            );
            this.setState({stationList}, () => {
                console.log(this.state.stationList);
            });

        }
        
    }

    render() {
        let numBikes = 0;
        const stations = this.props.stations;
        _keys(stations).forEach(key => {
            numBikes += stations[key].ebikes;
        });
        const header = `There are ${_keys(stations).length} stations with an electric bike right now: (${numBikes} bikes total)`;
        return (
            <ScrollView 
                ref={scrollView => this.scrollView = scrollView}
                contentContainerStyle={styles.list}
            >
                    <Text style={styles.header}>{header}</Text>
                    {this.state.stationList}
            </ScrollView>
        )
    }
        
}


//Styles
const styles = StyleSheet.create({
    list: {
        position: 'relative',
        paddingTop: 5,
        bottom:0,
        left: 0,
    },
    header: {
        marginLeft: 5,
        marginBottom: 10,
        fontSize: 20,
    },
    station: {
        flex: 1, 
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 22
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
        height: 30
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
