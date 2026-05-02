export const COLORS = {
    // Primary
    primary: '#4f46e5',
    primaryDark: '#4338ca',
    primaryLight: '#6366f1',

    // Neutral
    dark: '#1e1b4b',
    darkSecondary: '#2d2a5f',
    text: '#1e293b',
    textSecondary: '#64748b',
    textLight: '#94a3b8',
    border: '#e2e8f0',

    // Backgrounds
    bg: '#f8fafc',
    bgCard: '#fff',
    bgLight: '#f1f5f9',

    // Status
    success: '#10b981',
    successBg: '#ecfdf5',
    warning: '#f59e0b',
    warningBg: '#fffbeb',
    error: '#ef4444',
    errorBg: '#fef2f2',

    // States
    disabled: '#cbd5f0',
    online: '#00ff00',
};

export const TYPOGRAPHY = {
    h1: { fontSize: 24, fontWeight: 'bold' } as const,
    h2: { fontSize: 20, fontWeight: 'bold' } as const,
    h3: { fontSize: 18, fontWeight: '600' } as const,
    body: { fontSize: 16, fontWeight: '400' } as const,
    small: { fontSize: 14, fontWeight: '400' } as const,
    xs: { fontSize: 12, fontWeight: '400' } as const,
};
