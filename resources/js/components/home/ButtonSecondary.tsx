import React from 'react';
import { Link } from '@inertiajs/react';

interface ButtonSecondaryProps {
    onClick?: () => void;
    className?: string;
    href?: string;
    children: React.ReactNode;
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({ 
    onClick, 
    className = '', 
    href,
    children 
}) => {
    const baseClasses = 'btn btn-secondary';
    const combinedClasses = `${baseClasses} ${className}`.trim();

    if (href) {
        return (
            <Link href={href} className={combinedClasses}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={combinedClasses}>
            {children}
        </button>
    );
};

export default ButtonSecondary;