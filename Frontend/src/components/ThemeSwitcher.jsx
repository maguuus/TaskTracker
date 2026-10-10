
import { useTheme } from '../context/ThemeContext';

const themeOptions = [
    {
        value: 'colorful',
        label: 'Разноцветная',
        icon: '🌈'
    },
    {
        value: 'neon',
        label: 'Неон',
        icon: '💜'
    },
    {
        value: 'beige',
        label: 'Бежевая',
        icon: '🤎'
    },
    {
        value: 'mono',
        label: 'Чёрно-белая',
        icon: '🖤'
    }
];

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    return (
        <section className="theme-settings">
            <h4>Оформление</h4>
            <p>Выбери тему для своей доски</p>

            <div className="theme-options">
                {themeOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className={`theme-option ${
                            theme === option.value ? 'active' : ''
                        }`}
                        aria-pressed={theme === option.value}
                        onClick={() => setTheme(option.value)}
                    >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
