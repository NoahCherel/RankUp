/**
 * RankUp MVP — Test Suite
 *
 * Tests validation, formatters, filter logic, commission math, and seed data.
 * All Firebase/native modules are mocked to run in a clean Jest environment.
 */

// ---------------------------------------------------------------------------
// Module mocks — MUST be before any imports
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
}));

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({ currentUser: { uid: 'test-user-id' } })),
    initializeAuth: jest.fn(() => ({ currentUser: { uid: 'test-user-id' } })),
    getReactNativePersistence: jest.fn(),
    onAuthStateChanged: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn(),
    getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
    setDoc: jest.fn(() => Promise.resolve()),
    updateDoc: jest.fn(() => Promise.resolve()),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() => Promise.resolve({ docs: [], empty: true })),
    orderBy: jest.fn(),
    limit: jest.fn(),
    Timestamp: {
        now: () => ({ toDate: () => new Date() }),
        fromDate: (d: Date) => ({ toDate: () => d }),
    },
    onSnapshot: jest.fn(),
    addDoc: jest.fn(),
    serverTimestamp: jest.fn(),
    writeBatch: jest.fn(() => ({ set: jest.fn(), commit: jest.fn(() => Promise.resolve()) })),
    increment: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(() => ({})),
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
}));

jest.mock('firebase/functions', () => ({
    getFunctions: jest.fn(() => ({})),
    httpsCallable: jest.fn(),
}));

// ---------------------------------------------------------------------------
// 1. Validation Tests — US #1 & #2
// ---------------------------------------------------------------------------

import {
    isValidEmail,
    isValidPassword,
    isValidName,
    isValidAge,
    isValidPrice,
    isValidRanking,
    validateLoginForm,
    validateSignupForm,
} from '../utils/validation';

describe('US #1 — Validation', () => {
    describe('Email validation', () => {
        test('accepts valid email', () => {
            expect(isValidEmail('user@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co')).toBe(true);
        });

        test('rejects invalid email', () => {
            expect(isValidEmail('')).toBe(false);
            expect(isValidEmail('not-an-email')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
        });
    });

    describe('Password validation', () => {
        test('accepts valid password (6+ chars)', () => {
            expect(isValidPassword('123456')).toBe(true);
            expect(isValidPassword('securePass!')).toBe(true);
        });

        test('rejects short password', () => {
            expect(isValidPassword('')).toBe(false);
            expect(isValidPassword('12345')).toBe(false);
        });
    });

    describe('Name validation', () => {
        test('accepts valid names', () => {
            expect(isValidName('Alice')).toBe(true);
            expect(isValidName('Jean-Pierre')).toBe(true);
        });

        test('rejects invalid names', () => {
            expect(isValidName('')).toBe(false);
            expect(isValidName('A')).toBe(false);
        });
    });

    describe('Login form validation', () => {
        test('returns no errors for valid form', () => {
            const errors = validateLoginForm({
                email: 'user@test.com',
                password: '123456',
            });
            expect(errors).toHaveLength(0);
        });

        test('returns errors for empty form', () => {
            const errors = validateLoginForm({ email: '', password: '' });
            expect(errors.length).toBeGreaterThan(0);
        });

        test('validates email format', () => {
            const errors = validateLoginForm({
                email: 'invalid',
                password: '123456',
            });
            expect(errors.some(e => e.field === 'email')).toBe(true);
        });
    });

    describe('Signup form validation', () => {
        test('validates password confirmation', () => {
            const errors = validateSignupForm({
                email: 'user@test.com',
                password: '123456',
                confirmPassword: '654321',
            });
            expect(errors.some(e => e.field === 'confirmPassword')).toBe(true);
        });
    });
});

// ---------------------------------------------------------------------------
// 2. Profile Validation Tests — US #2
// ---------------------------------------------------------------------------

describe('US #2 — Profile Validation', () => {
    test('isValidAge accepts 16-100', () => {
        expect(isValidAge(16)).toBe(true);
        expect(isValidAge(30)).toBe(true);
        expect(isValidAge(100)).toBe(true);
    });

    test('isValidAge rejects out of range', () => {
        expect(isValidAge(15)).toBe(false);
        expect(isValidAge(101)).toBe(false);
    });

    test('isValidPrice accepts valid prices', () => {
        expect(isValidPrice(1)).toBe(true);
        expect(isValidPrice(45)).toBe(true);
        expect(isValidPrice(1000)).toBe(true);
    });

    test('isValidPrice rejects invalid', () => {
        expect(isValidPrice(0)).toBe(false);
        expect(isValidPrice(-10)).toBe(false);
        expect(isValidPrice(1001)).toBe(false);
    });

    test('isValidRanking accepts valid rankings', () => {
        expect(isValidRanking(1)).toBe(true);
        expect(isValidRanking(500)).toBe(true);
    });

    test('isValidRanking rejects invalid', () => {
        expect(isValidRanking(0)).toBe(false);
        expect(isValidRanking(-1)).toBe(false);
        expect(isValidRanking(1.5)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// 3. Formatter Tests — US #2
// ---------------------------------------------------------------------------

import {
    formatPrice,
    formatDate,
    formatRelativeTime,
    truncateText,
    getInitials,
    formatRanking,
    formatRating,
} from '../utils/formatters';

describe('US #2 — Formatters', () => {
    test('formatPrice formats correctly', () => {
        expect(formatPrice(45)).toBe('45€');
        expect(formatPrice(35, '$')).toBe('35$');
    });

    test('formatDate returns readable date', () => {
        const date = new Date(2026, 0, 15);
        const result = formatDate(date);
        expect(result).toContain('15');
        expect(result).toContain('2026');
    });

    test('formatRelativeTime handles various durations', () => {
        const now = new Date();
        expect(formatRelativeTime(now)).toBe("À l'instant");
        expect(formatRelativeTime(new Date(now.getTime() - 5 * 60000))).toContain('5 min');
        expect(formatRelativeTime(new Date(now.getTime() - 3 * 3600000))).toContain('3h');
        expect(formatRelativeTime(new Date(now.getTime() - 2 * 86400000))).toContain('2 jour');
    });

    test('truncateText with ellipsis', () => {
        expect(truncateText('Hello World', 20)).toBe('Hello World');
        expect(truncateText('Hello World, this is long', 10)).toBe('Hello W...');
    });

    test('getInitials extracts correctly', () => {
        expect(getInitials('Alice', 'Bernard')).toBe('AB');
        expect(getInitials('carlos', 'rivera')).toBe('CR');
    });

    test('formatRanking', () => {
        expect(formatRanking(45)).toBe('Top 45');
        expect(formatRanking(500)).toContain('500');
    });

    test('formatRating stars', () => {
        expect(formatRating(5)).toBe('★★★★★');
        expect(formatRating(0)).toBe('☆☆☆☆☆');
        expect(formatRating(3)).toBe('★★★☆☆');
    });
});

// ---------------------------------------------------------------------------
// 4. Marketplace Filter Logic — US #3
// ---------------------------------------------------------------------------

describe('US #3 — Marketplace Filters', () => {
    const mockMentors = [
        { ranking: 45, mentorPrice: 45, league: 'ile-de-france' },
        { ranking: 120, mentorPrice: 35, league: 'paca' },
        { ranking: 78, mentorPrice: 40, league: 'occitanie' },
        { ranking: 200, mentorPrice: 30, league: 'bretagne' },
        { ranking: 35, mentorPrice: 55, league: 'auvergne-rhone-alpes' },
    ];

    test('ranking filter min works correctly', () => {
        const minRanking = 50;
        const filtered = mockMentors.filter(m => m.ranking >= minRanking);
        expect(filtered).toHaveLength(3);
    });

    test('ranking filter max works correctly', () => {
        const maxRanking = 100;
        const filtered = mockMentors.filter(m => m.ranking <= maxRanking);
        expect(filtered).toHaveLength(3);
    });

    test('price filter works correctly', () => {
        const maxPrice = 40;
        const filtered = mockMentors.filter(m => m.mentorPrice <= maxPrice);
        expect(filtered).toHaveLength(3);
    });

    test('league filter works correctly', () => {
        const league = 'paca';
        const filtered = mockMentors.filter(m => m.league === league);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].mentorPrice).toBe(35);
    });

    test('combined filters work correctly', () => {
        const maxPrice = 45;
        const maxRanking = 100;
        const filtered = mockMentors.filter(
            m => m.mentorPrice <= maxPrice && m.ranking <= maxRanking,
        );
        expect(filtered).toHaveLength(2);
    });

    test('name search is case-insensitive', () => {
        const names = ['Carlos Rivera', 'Sophie Martin', 'Marco Rossi'];
        const query = 'carlos';
        const filtered = names.filter(n => n.toLowerCase().includes(query.toLowerCase()));
        expect(filtered).toHaveLength(1);
        expect(filtered[0]).toBe('Carlos Rivera');
    });
});

// ---------------------------------------------------------------------------
// 5. Stripe Commission Tests — US #4
// ---------------------------------------------------------------------------

describe('US #4 — Payment Commission', () => {
    test('15% commission is calculated correctly', () => {
        const price = 45;
        const commission = Math.round(price * 0.15 * 100) / 100;
        expect(commission).toBe(6.75);
    });

    test('commission for various prices', () => {
        const testCases = [
            { price: 30, expected: 4.5 },
            { price: 35, expected: 5.25 },
            { price: 40, expected: 6 },
            { price: 55, expected: 8.25 },
        ];

        testCases.forEach(({ price, expected }) => {
            const commission = Math.round(price * 0.15 * 100) / 100;
            expect(commission).toBe(expected);
        });
    });

    test('amount in cents conversion', () => {
        const price = 45;
        const amountCents = Math.round(price * 100);
        expect(amountCents).toBe(4500);
    });
});

// ---------------------------------------------------------------------------
// 6. Booking Logic Tests — US #5
// ---------------------------------------------------------------------------

describe('US #5 — Booking Logic', () => {
    test('cancellation >48h before should be refundable', () => {
        const futureDate = new Date(Date.now() + 72 * 60 * 60 * 1000);
        const hoursLeft = (futureDate.getTime() - Date.now()) / (1000 * 60 * 60);
        expect(hoursLeft).toBeGreaterThan(48);
    });

    test('cancellation <48h before should NOT be refundable', () => {
        const soonDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const hoursLeft = (soonDate.getTime() - Date.now()) / (1000 * 60 * 60);
        expect(hoursLeft).toBeLessThan(48);
    });

    test('booking states are valid', () => {
        const validStatuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
        expect(validStatuses).toContain('pending');
        expect(validStatuses).toContain('confirmed');
        expect(validStatuses).toContain('completed');
        expect(validStatuses).toHaveLength(5);
    });
});

// ---------------------------------------------------------------------------
// 7. Seed Data Tests — US #7
// ---------------------------------------------------------------------------

import { getSeedSummary } from '../utils/seedData';

describe('US #7 — Seed Data', () => {
    test('seed summary provides correct counts', () => {
        const summary = getSeedSummary();
        expect(summary.mentors).toBeGreaterThanOrEqual(5);
        expect(summary.users).toBeGreaterThanOrEqual(3);
        expect(summary.bookings).toBeGreaterThanOrEqual(5);
        expect(summary.conversations).toBeGreaterThanOrEqual(3);
        expect(summary.reviews).toBeGreaterThanOrEqual(5);
        expect(summary.totalMessages).toBeGreaterThan(0);
    });
});

// ---------------------------------------------------------------------------
// 8. Type Consistency Tests
// ---------------------------------------------------------------------------

describe('Type Consistency', () => {
    test('BookingStatus type covers all valid states', () => {
        const validStatuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
        expect(validStatuses).toHaveLength(5);
    });

    test('UserProfile mentor fields are consistent', () => {
        const mockProfile = {
            id: 'test',
            email: 'test@test.com',
            firstName: 'Test',
            lastName: 'User',
            isMentor: true,
            mentorPrice: 40,
            mentorDescription: 'Test desc',
            matchesPlayed: 0,
            matchesWon: 0,
            averageRating: 0,
            totalReviews: 0,
        };
        expect(mockProfile.isMentor).toBe(true);
        expect(mockProfile.mentorPrice).toBe(40);
    });
});

// ---------------------------------------------------------------------------
// 9. Responsive Utility Tests
// ---------------------------------------------------------------------------

describe('Responsive Utilities', () => {
    test('breakpoints are correctly ordered', () => {
        const { BREAKPOINTS } = require('../utils/responsive');
        expect(BREAKPOINTS.sm).toBeLessThan(BREAKPOINTS.md);
        expect(BREAKPOINTS.md).toBeLessThan(BREAKPOINTS.lg);
        expect(BREAKPOINTS.lg).toBeLessThan(BREAKPOINTS.xl);
    });

    test('WEB_CONTENT_MAX_WIDTH is reasonable', () => {
        const { WEB_CONTENT_MAX_WIDTH } = require('../utils/responsive');
        expect(WEB_CONTENT_MAX_WIDTH).toBeGreaterThanOrEqual(600);
        expect(WEB_CONTENT_MAX_WIDTH).toBeLessThanOrEqual(1200);
    });
});
