import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import Feather from '@expo/vector-icons/Feather';

const image = require('../assets/images/tesla-icon.png');

const StockHeader = () => {
    return (
        <View style={styles.header_home}>
            <View>
                <Image source={image} style={styles.header_image} contentFit='cover' />
            </View>

            <View style={{gap:4}}>
                <Text style={[styles.header__text, styles.header__text_name]}>Tes</Text>
                
                <View style={{flexDirection:"row", gap:8}}>

                <Text style={styles.header__text}>$214.66 |</Text>
                <Text style={[styles.header__text, {color:"#c3ff47", fontFamily:"Satoshi"}]}>2.34%</Text>
                <Feather name="trending-up" size={24} color="#c3ff47" />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header_home: {
        //backgroundColor:"red",
        width: "100%",
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 20,
        flexDirection: 'row',
        gap: 10,
        alignItems:"center"
    },
    header_image: {
        width: 40,
        height: 40
    },
    header__text: {
        color: "#fff",
        fontFamily: "Satoshi-Light",
        fontSize:16
    },
    header__text_name: {
        fontFamily: "Satoshi-Bold",
        fontSize:18
    }

})
export default StockHeader