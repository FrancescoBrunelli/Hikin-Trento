import { NavLink } from "react-router-dom";
import logo from "../assets/HikinTrentoLogo_noBackground.png"
import "../styles/NavBar.css"

export default function NavBar({ children }: { children?: React.ReactNode}) {

    return(
        <nav className="navbar">
            <div className="logo">
                <img src={logo} alt="Hikin'Trento Logo" />
            </div>
            <div className="navbar-links">
                <NavLink to="/">Home</NavLink>
                { children }
            </div>
        </nav>
    )
}
