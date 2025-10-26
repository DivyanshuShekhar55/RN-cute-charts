import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const StockInfo = () => {
    return (
        <View style={styles.info__main}>
            <Text style={styles.info__header}>Performance</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    info__main: {
        display: "flex",
        width: "100%"
    },
    info__header: {
        fontSize: 20,
        fontFamily: "Satoshi",
        color: "#fff",
    },
})

export default StockInfo