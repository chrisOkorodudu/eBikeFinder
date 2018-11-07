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


class ListView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            stationList: this.getStations(),
            selectedStation: this.getSelectedStation(props.currentStation)
        }
        this.scrollView = null;
    }


    getSelectedStation(stationId) {
        if (stationId) {
            return _findIndex(_keys(stations), (id) => id === currentStation);
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

        return stationList;
    }

    scrollToStation() {
        if (this.state.selectedStation) {
            this.scrollView.scrollTo(this.state.selectedStation);
        }
    }

    
    render() {
        console.log(this.state.stationList);
        let numBikes = 0;
        const stations = this.props.stations;
        _keys(stations).forEach(key => {
            numBikes += stations[key].ebikes;
        });
        const header = `There are ${_keys(stations).length} stations with an electric bike right now: (${numBikes} bikes total)`;
        return (
            <ScrollView 
                onLayout={() => {this.scrollToStation()}}
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
        justifyContent: 'space-between'
    },
    stationDark: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'lightblue',
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

export default ListView;