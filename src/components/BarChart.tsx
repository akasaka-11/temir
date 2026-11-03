import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import { colors, spacing, typography } from '@/theme';

type Props = {
  values: readonly number[];
  startLabel: string;
  endLabel: string;
  height?: number;
};

const GAP = 6;
const LABEL_SPACE = 16;

/** Minimal SVG bar chart with the value above each non-empty bar. The last bar is highlighted. */
export function BarChart({ values, startLabel, endLabel, height = 120 }: Props) {
  const [width, setWidth] = useState(0);
  const max = Math.max(1, ...values);
  const barWidth = values.length > 0 ? (width - GAP * (values.length - 1)) / values.length : 0;
  const chartHeight = height - LABEL_SPACE;

  return (
    <View>
      <View style={{ height }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {values.map((value, i) => {
              const barHeight = Math.max(2, (value / max) * chartHeight);
              const x = i * (barWidth + GAP);
              const y = height - barHeight;
              const isLast = i === values.length - 1;
              return (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={3}
                  fill={isLast ? colors.primary : colors.surfaceElevated}
                />
              );
            })}
            {values.map((value, i) =>
              value > 0 ? (
                <SvgText
                  key={`label-${i}`}
                  x={i * (barWidth + GAP) + barWidth / 2}
                  y={height - Math.max(2, (value / max) * chartHeight) - 4}
                  fontSize={11}
                  fill={colors.textMuted}
                  textAnchor="middle"
                >
                  {value}
                </SvgText>
              ) : null,
            )}
          </Svg>
        )}
      </View>
      <View style={styles.dates}>
        <Text style={styles.axisText}>{startLabel}</Text>
        <Text style={styles.axisText}>{endLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dates: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  axisText: { ...typography.caption, color: colors.textMuted },
});
