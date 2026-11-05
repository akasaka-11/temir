import { Alert, type AlertButton as NativeAlertButton } from 'react-native';

// Cross-platform alert. Native: the system alert. Web (alert.web.tsx): an in-app dialog,
// because react-native-web's Alert does nothing.
// This file is .tsx on purpose: Metro tries .ts files (alert.web.ts, alert.ts) before .tsx ones,
// so an alert.ts would shadow alert.web.tsx.

export type AlertButton = Pick<NativeAlertButton, 'text' | 'onPress' | 'style'>;

export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  Alert.alert(title, message, buttons);
}

/** Renders web dialogs; nothing on native. Mount once near the root. */
export function AlertHost(): null {
  return null;
}
