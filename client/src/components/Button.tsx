import {useNavigate} from 'react-router-dom'

export default function Button({ children, variant = "primary", to, ...props }: {
    children: string,
    variant?: string,
    to?: string,
    onClick?: () => void
}) {
    const navigate = useNavigate()
    return (
        <button
            className={`btn btn-${variant}`}
            style={{color: "rgb(254, 116, 25)"}}
            {...props}
            onClick={() => to && navigate(to)}
        >
            {children}
        </button>
    );
}
