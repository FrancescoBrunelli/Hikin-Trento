import { createContext, useContext, useState, useEffect } from "react"

const ThemeContect= createContext({darkMode: false, toggle: () => {}})

export default function ThemeProvider({ children }: { children: React.ReactNode}) {
    const [darkMode, setDarkMode] = useState(false);
    useEffect(()=> {
        document.documentElement.classList.toggle("dark-mode", darkMode);
    }, [darkMode])
    return (
        <ThemeContect.Provider value={{darkMode, toggle: () => setDarkMode(d => !d)}}>
            {children}
        </ThemeContect.Provider>
    )
}

export const useTheme = () => useContext(ThemeContect)
