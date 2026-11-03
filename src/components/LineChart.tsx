import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { buildChartGeometry } from '@/lib/progress';
import { colors, spacing, typography } from '@/theme';

type Props = {
  values: readonly number[];
  /** Formats axis values (e.g. "100 kg"). */
  formatValue: (value: number) => string;
  startLabel: string;
  endLabel: string;
  height?: number;
};

const PADDING = 12;

/** Minimal SVG line chart: no extra dependency, works in Expo Go. */
export function LineChart({ values, formatValue, startLabel, endLabel, height = 180 }: Props) {
  const [width, setWidth] = useState(0);
  const geometry = buildChartGeometry(values, width, height, PADDING);
  const last = geometry.points[geometry.points.length - 1];

  return (
    <View>
      <View style={styles.axisTop}>
        <Text style={styles.axisText}>{formatValue(geometry.maxValue)}</Text>
      </View>
      <View style={{ height }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {[0, 0.5, 1].map((f) => (
              <Line
                key={f}
                x1={PADDING}
                x2={width - PADDING}
                y1={PADDING + f * (height - PADDING * 2)}
                y2={PADDING + f * (height - PADDING * 2)}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4 6"
              />
            ))}
            <Path d={geometry.path} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
            {geometry.points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.primary} />
            ))}
            {last && <Circle cx={last.x} cy={last.y} r={6} fill={colors.background} stroke={colors.primary} strokeWidth={3} />}
          </Svg>
        )}
      </View>
      <View style={styles.axisBottom}>
        <Text style={styles.axisText}>{formatValue(geometry.minValue)}</Text>
      </View>
      <View style={styles.dates}>
        <Text style={styles.axisText}>{startLabel}</Text>
        <Text style={styles.axisText}>{endLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axisTop: { alignItems: 'flex-end', marginBottom: -spacing.xs },
  axisBottom: { alignItems: 'flex-end', marginTop: -spacing.xs },
  axisText: { ...typography.caption, color: colors.textMuted },
  dates: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
});
