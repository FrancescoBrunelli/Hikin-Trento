import { FaSun, FaMoon} from 'react-icons/fa';
import {useTheme} from "./ThemeProvider.tsx";

export default function ThemeToggle() {
    const {darkMode, toggle} = useTheme();

    return (
        <button className="theme-toggle" onClick={toggle}>
            {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
    )
}
