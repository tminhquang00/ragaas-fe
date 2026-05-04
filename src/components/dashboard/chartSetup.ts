// Centralized chart.js registration so each chart component doesn't repeat it.
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from 'chart.js';

let registered = false;

export function ensureChartJsRegistered(): void {
    if (registered) return;
    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarController,
        BarElement,
        LineController,
        LineElement,
        PointElement,
        Filler,
        Tooltip,
        Legend
    );
    registered = true;
}

/**
 * Resolve a CSS variable to its computed string value (e.g. "#007bc0").
 * chart.js can't read `var(--token)` directly inside its options.
 */
export function resolveCssVar(name: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
}
