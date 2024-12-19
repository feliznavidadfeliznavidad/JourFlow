import { SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import PickFeeling from '../components/PickFeeling'
import FontLoader from '../services/FontsLoader'

const pick = () => {
  return (
    <FontLoader>
      <SafeAreaView style={styles.safeArea}>
          <PickFeeling />
      </SafeAreaView>
    </FontLoader>
  )
}

export default pick

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#FAF7F0",
    }
  });