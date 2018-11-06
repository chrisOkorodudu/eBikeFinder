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


const ListView = ({stations}) => {
    let numBikes = 0;
    _keys(stations).forEach(key => {
        numBikes += stations[key].ebikes;
    });

    
    const header = `There are ${_keys(stations).length} stations with an electric bike right now: (${numBikes} bikes total)`;
    let counter = 0;
    const stationList = _keys(stations).map(key => {
        const station = stations[key];
        counter++;
        return (
            <View style={counter % 2 == 0 ? styles.station : styles.stationDark} key={key}>
                <Text style={styles.name}>{station.name}</Text><Text style={styles.bikes}>{station.ebikes}</Text>
            </View>
        )
    });
    return (
        <ScrollView contentContainerStyle={styles.list}>
            <Text style={styles.header}>{header}</Text>
            {stationList}
        </ScrollView>
    )
}

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