/**
 * DateTimePicker — Cross-platform date & time selector.
 *
 * Opens a modal with a mini-calendar + time slot picker.
 * Works on both web and native without extra dependencies.
 */
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Platform,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface DateTimePickerProps {
    value: Date | null;
    onChange: (date: Date) => void;
    /** Minimum selectable date (default: now) */
    minimumDate?: Date;
    placeholder?: string;
}

const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/** Available time slots (every 30 min from 7:00 to 22:00) */
const TIME_SLOTS: { hour: number; minute: number; label: string }[] = [];
for (let h = 7; h <= 22; h++) {
    TIME_SLOTS.push({ hour: h, minute: 0, label: `${String(h).padStart(2, '0')}:00` });
    if (h < 22) {
        TIME_SLOTS.push({ hour: h, minute: 30, label: `${String(h).padStart(2, '0')}:30` });
    }
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/** Monday = 0, …, Sunday = 6  (ISO week) */
function getFirstDayOfMonth(year: number, month: number): number {
    const d = new Date(year, month, 1).getDay(); // 0=Sun
    return d === 0 ? 6 : d - 1;
}

export default function DateTimePicker({
    value,
    onChange,
    minimumDate,
    placeholder = 'Sélectionner une date et heure',
}: DateTimePickerProps) {
    const now = new Date();
    const minDate = minimumDate ?? now;

    const [visible, setVisible] = useState(false);
    const [viewYear, setViewYear] = useState(value?.getFullYear() ?? now.getFullYear());
    const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? now.getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(value?.getDate() ?? null);
    const [selectedHour, setSelectedHour] = useState<number>(value?.getHours() ?? 10);
    const [selectedMinute, setSelectedMinute] = useState<number>(value?.getMinutes() ?? 0);

    // Derived
    const daysInMonth = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);
    const firstDay = useMemo(() => getFirstDayOfMonth(viewYear, viewMonth), [viewYear, viewMonth]);

    const handleOpen = () => {
        // Reset view to value or now
        const base = value ?? now;
        setViewYear(base.getFullYear());
        setViewMonth(base.getMonth());
        setSelectedDay(value ? value.getDate() : null);
        setSelectedHour(value?.getHours() ?? 10);
        setSelectedMinute(value?.getMinutes() ?? 0);
        setVisible(true);
    };

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
        setSelectedDay(null);
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
        setSelectedDay(null);
    };

    const isDayDisabled = (day: number): boolean => {
        const d = new Date(viewYear, viewMonth, day, 23, 59);
        return d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    };

    const isToday = (day: number): boolean => {
        return (
            viewYear === now.getFullYear() &&
            viewMonth === now.getMonth() &&
            day === now.getDate()
        );
    };

    const handleConfirm = () => {
        if (!selectedDay) return;
        const result = new Date(viewYear, viewMonth, selectedDay, selectedHour, selectedMinute);
        onChange(result);
        setVisible(false);
    };

    // Format display value
    const displayText = value
        ? `${value.getDate()} ${MONTHS_FR[value.getMonth()]} ${value.getFullYear()} à ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
        : placeholder;

    // Build calendar grid (6 rows × 7 cols)
    const calendarCells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) calendarCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
    while (calendarCells.length % 7 !== 0) calendarCells.push(null);

    return (
        <>
            {/* Trigger button */}
            <TouchableOpacity style={styles.trigger} onPress={handleOpen} activeOpacity={0.7}>
                <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
                <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]}>
                    {displayText}
                </Text>
                <Text style={styles.triggerChevron}>{'›'}</Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        {/* Modal header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{'Date & Heure'}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.modalContent}
                        >
                            {/* Month navigator */}
                            <View style={styles.monthNav}>
                                <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
                                    <Text style={styles.monthArrowText}>{'‹'}</Text>
                                </TouchableOpacity>
                                <Text style={styles.monthLabel}>
                                    {MONTHS_FR[viewMonth]} {viewYear}
                                </Text>
                                <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
                                    <Text style={styles.monthArrowText}>{'›'}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Day-of-week header */}
                            <View style={styles.weekRow}>
                                {DAYS_FR.map((d) => (
                                    <View key={d} style={styles.weekCell}>
                                        <Text style={styles.weekText}>{d}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Calendar grid */}
                            <View style={styles.calendarGrid}>
                                {calendarCells.map((day, i) => {
                                    if (day === null) {
                                        return <View key={`e-${i}`} style={styles.dayCell} />;
                                    }
                                    const disabled = isDayDisabled(day);
                                    const selected = day === selectedDay;
                                    const today = isToday(day);

                                    return (
                                        <TouchableOpacity
                                            key={day}
                                            style={[
                                                styles.dayCell,
                                                selected && styles.dayCellSelected,
                                                today && !selected && styles.dayCellToday,
                                            ]}
                                            disabled={disabled}
                                            onPress={() => setSelectedDay(day)}
                                        >
                                            <Text
                                                style={[
                                                    styles.dayText,
                                                    disabled && styles.dayTextDisabled,
                                                    selected && styles.dayTextSelected,
                                                    today && !selected && styles.dayTextToday,
                                                ]}
                                            >
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Time slots */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
                                <Ionicons name="time-outline" size={18} color={Colors.textPrimary} />
                                <Text style={[styles.timeSectionTitle, { marginBottom: 0 }]}>{'Heure'}</Text>
                            </View>
                            <View style={styles.timeGrid}>
                                {TIME_SLOTS.map((slot) => {
                                    const active =
                                        slot.hour === selectedHour && slot.minute === selectedMinute;
                                    return (
                                        <TouchableOpacity
                                            key={slot.label}
                                            style={[styles.timeSlot, active && styles.timeSlotActive]}
                                            onPress={() => {
                                                setSelectedHour(slot.hour);
                                                setSelectedMinute(slot.minute);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeSlotText,
                                                    active && styles.timeSlotTextActive,
                                                ]}
                                            >
                                                {slot.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        {/* Confirm */}
                        <TouchableOpacity
                            style={[styles.confirmBtn, !selectedDay && styles.confirmBtnDisabled]}
                            disabled={!selectedDay}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmBtnText}>
                                {selectedDay
                                    ? `Confirmer — ${selectedDay} ${MONTHS_FR[viewMonth]} à ${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
                                    : 'Sélectionner un jour'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    // Trigger
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md + 2,
    },
    triggerText: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    triggerPlaceholder: {
        color: Colors.textSecondary,
        fontWeight: '400',
    },
    triggerChevron: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xl,
        fontWeight: '300',
    },

    // Overlay
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '85%',
        ...(Platform.OS === 'web' ? { maxWidth: 480, alignSelf: 'center' as const, width: '100%' } : {}),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    modalTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    modalContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },

    // Month nav
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    monthArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthArrowText: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xxl,
        fontWeight: '300',
    },
    monthLabel: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },

    // Week header
    weekRow: {
        flexDirection: 'row',
        marginBottom: Spacing.xs,
    },
    weekCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    weekText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },

    // Calendar grid
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: Spacing.lg,
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCellSelected: {
        backgroundColor: Colors.primary,
        borderRadius: 999,
    },
    dayCellToday: {
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 999,
    },
    dayText: {
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
    dayTextDisabled: {
        color: Colors.border,
    },
    dayTextSelected: {
        color: Colors.background,
        fontWeight: '800',
    },
    dayTextToday: {
        color: Colors.primary,
        fontWeight: '700',
    },

    // Time section
    timeSectionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    timeSlot: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    timeSlotActive: {
        borderColor: Colors.primary,
        backgroundColor: '#EAB30820',
    },
    timeSlotText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
    timeSlotTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },

    // Confirm
    confirmBtn: {
        backgroundColor: Colors.primary,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
        paddingVertical: Spacing.md + 2,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },
    confirmBtnDisabled: {
        backgroundColor: Colors.border,
    },
    confirmBtnText: {
        color: Colors.background,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
});
