import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';

const WIDTH = Dimensions.get("screen").width

const ActionButton = ({ action, color }) => {
    return (
        <TouchableOpacity activeOpacity={0.6} style={[styles.actionBtn__main, { backgroundColor: color }]} onPress={()=>{router.push("/CandleMain")}}>
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