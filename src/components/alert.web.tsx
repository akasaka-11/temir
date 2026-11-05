import i18n from 'i18next';
import { useSyncExternalStore } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import type { AlertButton } from './alert';

// Web version of alert.ts: react-native-web's Alert is a no-op, so dialogs are rendered by AlertHost.

export type { AlertButton };

type AlertState = { title: string; message?: string; buttons: AlertButton[] } | null;

let current: AlertState = null;
const listeners = new Set<() => void>();

function setCurrent(next: AlertState) {
  current = next;
  listeners.forEach((listener) => listener());
}

export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  setCurrent({
    title,
    message,
    buttons: buttons?.length ? buttons : [{ text: i18n.t('common.ok') }],
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function AlertHost() {
  const alert = useSyncExternalStore(subscribe, () => current);
  if (!alert) return null;

  const cancel = alert.buttons.find((b) => b.style === 'cancel');
  // Like iOS: the cancel button goes last.
  const ordered = [...alert.buttons.filter((b) => b !== cancel), ...(cancel ? [cancel] : [])];

  function press(button?: AlertButton) {
    // Close first, so onPress can open the next dialog.
    setCurrent(null);
    button?.onPress?.();
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => press(cancel)}>
      <Pressable style={styles.backdrop} onPress={() => cancel && press(cancel)}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{alert.title}</Text>
          {alert.message ? <Text style={styles.message}>{alert.message}</Text> : null}
          <View style={styles.buttons}>
            {ordered.map((button, index) => (
              <Pressable
                key={`${index}-${button.text}`}
                accessibilityRole="button"
                onPress={() => press(button)}
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'destructive' && styles.destructive,
                    button.style === 'cancel' && styles.cancel,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    paddingTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  title: { ...typography.heading, color: colors.text, textAlign: 'center', paddingHorizontal: spacing.lg },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  buttons: { marginTop: spacing.lg },
  button: {
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  pressed: { backgroundColor: colors.surface },
  buttonText: { ...typography.body, color: colors.text, fontWeight: '600' },
  destructive: { color: colors.danger },
  cancel: { fontWeight: '400' },
});
