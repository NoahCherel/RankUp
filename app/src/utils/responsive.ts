/**
 * Responsive utilities for web vs mobile layout adaptation.
 */
import { Platform, useWindowDimensions } from 'react-native';
import { Spacing } from '../theme';

/** Breakpoints */
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
} as const;

/** Max content width for centered web layouts */
export const WEB_CONTENT_MAX_WIDTH = 900;

/**
 * Hook that provides responsive layout info.
 */
export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';

    return {
        width,
        height,
        isWeb,
        isMobile: !isWeb,
        isWide: width > BREAKPOINTS.md,
        isExtraWide: width > BREAKPOINTS.lg,
        /** Top padding — smaller on web (no status bar) */
        headerPaddingTop: isWeb ? Spacing.lg : Spacing.xxl + 8,
        /** Content max-width for centered web layouts */
        contentStyle: isWeb ? {
            maxWidth: WEB_CONTENT_MAX_WIDTH,
            width: '100%' as any,
            alignSelf: 'center' as any,
        } : {},
    };
}
