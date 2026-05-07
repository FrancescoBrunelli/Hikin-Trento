import ThemeToggle from "./ThemeToggle.tsx";

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <div className="page">
            <ThemeToggle />
            {children}
        </div>
    )
}
