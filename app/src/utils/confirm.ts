/**
 * Cross-platform confirmation dialog.
 *
 * On web, Alert.alert callbacks can be unreliable. This utility uses
 * window.confirm() on web and Alert.alert on native for reliable behavior.
 */
import { Alert, Platform } from 'react-native';

export function confirmAction(
    title: string,
    message: string,
    confirmLabel: string,
    onConfirm: () => void,
    destructive?: boolean,
): void {
    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n\n${message}`)) {
            onConfirm();
        }
    } else {
        Alert.alert(title, message, [
            { text: 'Non', style: 'cancel' },
            {
                text: confirmLabel,
                onPress: onConfirm,
                style: destructive ? 'destructive' : 'default',
            },
        ]);
    }
}

/**
 * Cross-platform alert (information only, no callback).
 */
export function showAlert(title: string, message?: string): void {
    if (Platform.OS === 'web') {
        window.alert(message ? `${title}\n\n${message}` : title);
    } else {
        Alert.alert(title, message);
    }
}
