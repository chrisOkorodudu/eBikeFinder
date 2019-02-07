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


const ListViewStatic = ({stations, currentStation, numStations, numBikes}) => {

    const stationList = _keys(stations).map(key => {
        const station = stations[key];

        return (
            <View style={key === currentStation ? styles.selectedStation : styles.station} key={key}>
                <Text style={styles.name}>{station.name}</Text><Text style={styles.bikes}>{station.ebikes}</Text>
            </View>
        )
    });

    const header = `There are ${numStations} stations with an electric bike right now: (${numBikes} bikes total)`;

    return (
        <ScrollView contentContainerStyle={styles.list}>
            <Text style={styles.header}>{header}</Text>
            {stationList}
        </ScrollView>
    );
};

export default ListViewStatic;


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
