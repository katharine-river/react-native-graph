import React, { useCallback, useMemo, useState } from 'react'
import { View, StyleSheet, Text, Button, ScrollView } from 'react-native'
import { LineGraph } from 'react-native-graph'
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets'
import type { GraphRange, GradientStop } from '../../../src/LineGraphProps'
import { SelectionDot } from '../components/CustomSelectionDot'
import { Toggle } from '../components/Toggle'
import {
  generateRandomGraphData,
  generateSinusGraphData,
} from '../data/GraphData'
import { useColors } from '../hooks/useColors'
import { hapticFeedback } from '../utils/HapticFeedback'

const POINT_COUNT = 70
const POINTS = generateRandomGraphData(POINT_COUNT)
const COLOR = '#6a7ee7'
const GRADIENT_FILL_COLORS = ['#7476df5D', '#7476df4D', '#7476df00']
const SMALL_POINTS = generateSinusGraphData(9)

// Example custom gradient stops with multiple colors at different positions
const CUSTOM_GRADIENT_STOPS: GradientStop[] = [
  { color: '#ff0000', position: 0.0 },    // Red at 0%
  { color: '#00ff00', position: 0.3 },    // Green at 30%
  { color: '#0000ff', position: 0.7 },    // Blue at 70%
  { color: '#ffff00', position: 1.0 },    // Yellow at 100%
]

// Additional gradient examples for demonstration
const RAINBOW_GRADIENT: GradientStop[] = [
  { color: '#ff0000', position: 0.0 },    // Red
  { color: '#ff8000', position: 0.17 },   // Orange
  { color: '#ffff00', position: 0.33 },   // Yellow
  { color: '#00ff00', position: 0.5 },    // Green
  { color: '#0080ff', position: 0.67 },   // Blue
  { color: '#8000ff', position: 0.83 },   // Purple
  { color: '#ff0080', position: 1.0 },    // Pink
]

const FADE_GRADIENT: GradientStop[] = [
  { color: '#6a7ee700', position: 0.0 },  // Transparent
  { color: '#6a7ee780', position: 0.5 },  // Semi-transparent
  { color: '#6a7ee7ff', position: 1.0 },  // Solid
]

export function GraphPage() {
  const colors = useColors()

  const [isAnimated, setIsAnimated] = useState(true)
  const [enablePanGesture, setEnablePanGesture] = useState(true)
  const [enableFadeInEffect, setEnableFadeInEffect] = useState(false)
  const [enableCustomSelectionDot, setEnableCustomSelectionDot] =
    useState(false)
  const [enableGradient, setEnableGradient] = useState(false)
  const [enableRange, setEnableRange] = useState(false)
  const [enableIndicator, setEnableIndicator] = useState(false)
  const [indicatorPulsating, setIndicatorPulsating] = useState(false)
  const [enableCustomGradientStops, setEnableCustomGradientStops] = useState(false)
  const [selectedGradient, setSelectedGradient] = useState<'custom' | 'rainbow' | 'fade'>('custom')

  const [points, setPoints] = useState(POINTS)

  const getSelectedGradientStops = useCallback(() => {
    if (!enableCustomGradientStops) return undefined
    
    switch (selectedGradient) {
      case 'rainbow':
        return RAINBOW_GRADIENT
      case 'fade':
        return FADE_GRADIENT
      default:
        return CUSTOM_GRADIENT_STOPS
    }
  }, [enableCustomGradientStops, selectedGradient])

  const refreshData = useCallback(() => {
    setPoints(generateRandomGraphData(POINT_COUNT))
    hapticFeedback('impactLight')
  }, [])

  const highestDate = useMemo(
    () =>
      points.length !== 0 && points[points.length - 1] != null
        ? points[points.length - 1]!.date
        : undefined,
    [points]
  )
  const range: GraphRange | undefined = useMemo(() => {
    // if range is disabled, default to infinite range (undefined)
    if (!enableRange) return undefined

    if (points.length !== 0 && highestDate != null) {
      return {
        x: {
          min: points[0]!.date,
          max: new Date(highestDate.getTime() + 50 * 1000 * 60 * 60 * 24),
        },
        y: {
          min: -200,
          max: 200,
        },
      }
    } else {
      return {
        y: {
          min: -200,
          max: 200,
        },
      }
    }
  }, [enableRange, highestDate, points])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          react-native-graph
        </Text>
        <LineGraph
          style={styles.miniGraph}
          animated={false}
          color={colors.foreground}
          points={SMALL_POINTS}
        />
      </View>

      <View style={styles.spacer} />

      <LineGraph
        style={styles.graph}
        animated={isAnimated}
        color={COLOR}
        points={points}
        gradientFillColors={enableGradient ? GRADIENT_FILL_COLORS : undefined}
        enablePanGesture={enablePanGesture}
        enableFadeInMask={enableFadeInEffect}
        fadeInGradientStops={getSelectedGradientStops()}
        onGestureStart={() => hapticFeedback('impactLight')}
        SelectionDot={enableCustomSelectionDot ? SelectionDot : undefined}
        range={range}
        enableIndicator={enableIndicator}
        horizontalPadding={enableIndicator ? 15 : 0}
        indicatorPulsating={indicatorPulsating}
      />

      <Button title="Refresh" onPress={refreshData} />

      <ScrollView
        style={styles.controlsScrollView}
        contentContainerStyle={styles.controlsScrollViewContent}
      >
        <Toggle
          title="Animated:"
          isEnabled={isAnimated}
          setIsEnabled={setIsAnimated}
        />
        <Toggle
          title="Enable Gesture:"
          isEnabled={enablePanGesture}
          setIsEnabled={setEnablePanGesture}
        />
        <Toggle
          title="Enable Fade-in effect:"
          isEnabled={enableFadeInEffect}
          setIsEnabled={setEnableFadeInEffect}
        />
        <Toggle
          title="Custom Gradient Stops:"
          isEnabled={enableCustomGradientStops}
          setIsEnabled={setEnableCustomGradientStops}
        />
        {enableCustomGradientStops && (
          <View style={styles.gradientSelector}>
            <Text style={[styles.gradientLabel, { color: colors.foreground }]}>
              Gradient Type:
            </Text>
            <View style={styles.gradientButtons}>
              <Button
                title="Custom"
                onPress={() => setSelectedGradient('custom')}
                color={selectedGradient === 'custom' ? COLOR : '#666'}
              />
              <Button
                title="Rainbow"
                onPress={() => setSelectedGradient('rainbow')}
                color={selectedGradient === 'rainbow' ? COLOR : '#666'}
              />
              <Button
                title="Fade"
                onPress={() => setSelectedGradient('fade')}
                color={selectedGradient === 'fade' ? COLOR : '#666'}
              />
            </View>
          </View>
        )}
        <Toggle
          title="Custom Selection Dot:"
          isEnabled={enableCustomSelectionDot}
          setIsEnabled={setEnableCustomSelectionDot}
        />
        <Toggle
          title="Enable Gradient:"
          isEnabled={enableGradient}
          setIsEnabled={setEnableGradient}
        />
        <Toggle
          title="Enable Range:"
          isEnabled={enableRange}
          setIsEnabled={setEnableRange}
        />
        <Toggle
          title="Enable Indicator:"
          isEnabled={enableIndicator}
          setIsEnabled={setEnableIndicator}
        />
        <Toggle
          title="Indicator pulsating:"
          isEnabled={indicatorPulsating}
          setIsEnabled={setIndicatorPulsating}
        />
      </ScrollView>

      <View style={styles.spacer} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop + 15,
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 15,
  },
  spacer: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    paddingHorizontal: 15,
  },
  graph: {
    alignSelf: 'center',
    width: '100%',
    aspectRatio: 1.4,
    marginVertical: 20,
  },
  miniGraph: {
    width: 40,
    height: 35,
    marginLeft: 5,
  },
  controlsScrollView: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  controlsScrollViewContent: {
    justifyContent: 'center',
  },
  gradientSelector: {
    marginVertical: 10,
  },
  gradientLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  gradientButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
})
