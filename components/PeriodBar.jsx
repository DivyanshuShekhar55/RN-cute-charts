import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'

const periods = [
    { label: "1D", onclick: () => { } },
    { label: "1W", onclick: () => { } },
    { label: "1M", onclick: () => { } },
    { label: "3M", onclick: () => { } },
    { label: "6M", onclick: () => { } },

]

const PeriodBar = () => {
    return (
        <View style={styles.period__container}>

            {periods.map((period, i) => {
                return (

                    <TouchableOpacity style={styles.period__btn} activeOpacity={0.4} key={i}>
                        <Text style={styles.period__btn__text}>{period.label}</Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    period__container: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 15,
        backgroundColor: "#e0e0"
    },
    period__btn: {
        backgroundColor: "#ffc37d",
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignContent: "center",
        borderRadius: 8
    },
    period__btn__text: {
        color: "#000",
        fontSize: 16,
        fontFamily: "Satoshi"
    }
})

export default PeriodBar