import React, {Component} from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

import _keys from 'lodash/keys';

const ListView = ({stations, numStations, numBikes}) => {

    const header = `There are ${numStations} stations with an electric bike right now: (${numBikes} bikes total)`;

    return (
        <ScrollView contentContainerStyle={styles.list}>
            <Text style={styles.header}>{header}</Text>
            {stations}
        </ScrollView>
    );
};

export default ListView;


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
    }
});
