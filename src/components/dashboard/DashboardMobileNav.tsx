
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface DashboardMobileNavProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const DashboardMobileNav = ({ isMobileMenuOpen, setIsMobileMenuOpen }: DashboardMobileNavProps) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b px-4 py-3 flex justify-between items-center">
      <Link to="/" className="flex items-center">
        <img src="/logo.svg" alt="Switch2Tech Academy" className="h-8 w-auto" />
        <span className="ml-2 text-lg font-bold text-brand-700">Switch2Tech</span>
      </Link>
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        className="p-2 rounded-md text-gray-700 focus:outline-none"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
};

export default DashboardMobileNav;
