import '@testing-library/jest-dom/vitest';

// Mock window.scrollTo
window.scrollTo = vi.fn() as any;
