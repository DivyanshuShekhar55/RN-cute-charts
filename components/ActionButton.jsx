import { View, Text, Dimensions } from 'react-native'
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather';

const WIDTH = Dimensions.get("screen").width

const ActionButton = ({ action, color }) => {
    return (
        <TouchableOpacity activeOpacity={0.6} style={[styles.actionBtn__main, { backgroundColor: color }]}>
            <Text style={styles.actionBtn__text}>{action}</Text>
            <Feather name="arrow-up-right" size={24} color="#fff" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    actionBtn__main: {
        width: WIDTH * 0.40,
        maxWidth: 350,
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        flexDirection: "row",
        gap: 4

    },
    actionBtn__text: {
        color: "#fff",
        fontFamily: "Satoshi-Bold",
        fontSize: 18
    }
}
)
export default ActionButton