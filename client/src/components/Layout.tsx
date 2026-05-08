import ThemeToggle from "./ThemeToggle.tsx";
import NavBar from "./NavBar.tsx";

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <>
            <NavBar />
            <div className="page">
                <ThemeToggle />
                {children}
            </div>
        </>
    )
}
