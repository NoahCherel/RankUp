import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    style,
    textStyle,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const getBackgroundColor = () => {
        if (isDisabled) return Colors.border;
        switch (variant) {
            case 'primary':
                return Colors.primary;
            case 'secondary':
                return Colors.secondary;
            case 'outline':
                return 'transparent';
            case 'danger':
                return Colors.error;
            default:
                return Colors.primary;
        }
    };

    const getTextColor = () => {
        if (isDisabled) return Colors.textSecondary;
        switch (variant) {
            case 'primary':
                return Colors.background;
            case 'secondary':
                return Colors.background;
            case 'outline':
                return Colors.primary;
            case 'danger':
                return Colors.textPrimary;
            default:
                return Colors.background;
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'small':
                return Spacing.sm;
            case 'medium':
                return Spacing.md;
            case 'large':
                return Spacing.lg;
            default:
                return Spacing.md;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small':
                return FontSizes.sm;
            case 'medium':
                return FontSizes.md;
            case 'large':
                return FontSizes.lg;
            default:
                return FontSizes.md;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    paddingVertical: getPadding(),
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderColor: Colors.primary,
                },
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <Text
                    style={[
                        styles.text,
                        {
                            color: getTextColor(),
                            fontSize: getFontSize(),
                        },
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
    },
    text: {
        fontWeight: '600',
    },
});
