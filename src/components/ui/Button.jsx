import React from 'react';
import { cn } from "../../utils/cn";

const Button = React.forwardRef(({
    className,
    variant = 'default',
    size = 'default',
    children,
    disabled = false,
    fullWidth,
    ...props
}, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 bg-white hover:bg-gray-50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "hover:bg-gray-100",
        link: "text-primary hover:text-primary/80 underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };
    
    const sizeClasses = {
        default: "h-10 px-4 py-2 sm:h-10 sm:px-4 sm:py-2 md:h-10 md:px-4 md:py-2",
        sm: "h-9 rounded-md px-3 py-2 sm:h-9 sm:rounded-md sm:px-3 sm:py-2 md:h-9 md:rounded-md md:px-3",
        lg: "h-11 rounded-md px-8 py-3 sm:h-11 sm:rounded-md sm:px-8 sm:py-3 md:h-11 md:rounded-md md:px-8",
        icon: "h-10 w-10 sm:h-10 sm:w-10 md:h-10 md:w-10",
        xs: "h-8 rounded-md px-2 text-xs py-2 sm:h-8 sm:rounded-md sm:px-2 sm:text-xs sm:py-2 md:h-8 md:rounded-md md:px-2 md:text-xs",
        xl: "h-12 rounded-md px-10 text-base py-3 sm:h-12 sm:rounded-md sm:px-10 sm:text-base sm:py-3 md:h-12 md:rounded-md md:px-10 md:text-base",
    };
    
    return (
        <button
            className={cn(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)}
            ref={ref}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };
export default Button;
