
import React from 'react';
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/46f46751-2285-4ad6-9c49-da2565a6ffbd.png" 
        alt="Switch2Tech Academy" 
        className="h-8 w-auto" 
      />
      <span className="ml-2 text-lg font-bold text-brand-700">Switch2Tech</span>
    </Link>
  );
};

export default Logo;
