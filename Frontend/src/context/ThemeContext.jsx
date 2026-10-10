
import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';

const ThemeContext = createContext(null);

const THEMES = ['colorful', 'neon', 'beige', 'mono'];

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('app-theme');
            return THEMES.includes(savedTheme)
                ? savedTheme
                : 'colorful';
        } catch {
            return 'colorful';
        }
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;

        try {
            localStorage.setItem('app-theme', theme);
        } catch {
            // Приложение продолжит работать без localStorage
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            'useTheme должен использоваться внутри ThemeProvider'
        );
    }

    return context;
}
