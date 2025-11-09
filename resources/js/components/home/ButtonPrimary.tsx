import React from 'react';
import { Link } from '@inertiajs/react';
import '../../../css/button.css';

interface ButtonPrimaryProps {
    onClick?: () => void;
    className?: string;
    href?: string;
    children: React.ReactNode;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({ 
    onClick, 
    className = '', 
    href,
    children 
}) => {
    const baseClasses = 'btn btn-primary';
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

export default ButtonPrimary;