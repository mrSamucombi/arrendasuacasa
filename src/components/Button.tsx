import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles =
    'px-5 py-2.5 rounded-lg font-semibold transition duration-200 ease-in-out focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5';

  const variantStyles: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-opacity-90 focus:ring-primary/30',
    secondary: 'bg-secondary text-dark hover:bg-opacity-90 focus:ring-secondary/40',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/30',
    danger: 'bg-danger text-white hover:bg-opacity-90 focus:ring-danger/30',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;