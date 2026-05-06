import {useNavigate} from 'react-router-dom'
import React from 'react'

export default function Button({ children, variant = "primary", to, ...props }: {
    children: React.ReactNode,
    variant?: string,
    to?: string,
    onClick?: () => void
    type?: "button" | "submit" | "reset"
    disabled?: boolean
}) {
    const navigate = useNavigate()
    return (
        <button
            className={`btn btn-${variant}`}
            {...props}
            onClick={() => {
                if (to) navigate(to)
                if (props.onClick) props.onClick()
            }}
        >
            {children}
        </button>
    );
}
