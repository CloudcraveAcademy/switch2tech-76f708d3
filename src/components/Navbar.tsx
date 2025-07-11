import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, LogOut, User, Book, Home, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Only show user data when not loading and user exists
  const userData = useMemo(() => {
    if (loading || !user) return null;
    
    return {
      name: user.name || 'User',
      email: user.email || '',
      avatar: user.avatar || '',
      role: user.role || 'student'
    };
  }, [user, loading]);

  // Debug logging
  useEffect(() => {
    console.log("Navbar state - loading:", loading, "user:", !!user, "userData:", !!userData);
  }, [loading, user, userData]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    
    try {
      setLoggingOut(true);
      console.log("Navbar: Starting logout");
      
      await logout();
      setIsMenuOpen(false);
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      
      // Navigate to home page after logout
      navigate("/");
      
    } catch (error) {
      console.error("Logout error in Navbar:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = useMemo(() => {
    return getInitials(userData?.name);
  }, [userData?.name]);

  return (
    <nav className="fixed w-full top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/lovable-uploads/46f46751-2285-4ad6-9c49-da2565a6ffbd.png"
                alt="Switch2Tech Academy"
              />
              <span className="ml-2 text-xl font-bold text-[#03045E] hidden md:block">
                Switch2Tech
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className="py-2 px-3 rounded-md text-sm font-medium text-[#03045E] hover:bg-[#00B4D8]/10"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="py-2 px-3 rounded-md text-sm font-medium text-[#03045E] hover:bg-[#00B4D8]/10"
            >
              Courses
            </Link>
            <Link
              to="/about"
              className="py-2 px-3 rounded-md text-sm font-medium text-[#03045E] hover:bg-[#00B4D8]/10"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="py-2 px-3 rounded-md text-sm font-medium text-[#03045E] hover:bg-[#00B4D8]/10"
            >
              Contact
            </Link>

            {/* Show login/register when not loading and no userData */}
            {!loading && !userData ? (
              <div className="ml-4 flex items-center md:ml-6">
                <Link to="/login">
                  <Button variant="outline" className="mr-2 border-[#0077B6] text-[#0077B6] hover:bg-[#00B4D8]/10">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#0077B6] hover:bg-[#03045E]">Register</Button>
                </Link>
              </div>
            ) : userData ? (
              /* Show user menu when user data is available */
              <div className="ml-4 flex items-center md:ml-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full">
                      <Avatar>
                        <AvatarImage src={userData.avatar} alt={userData.name} />
                        <AvatarFallback>
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="font-normal">
                        <div className="font-medium">{userData.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {userData.email}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize mt-1">
                          Role: {userData.role}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer w-full">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-600"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Home
              </div>
            </Link>
            <Link
              to="/courses"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-600"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Book className="w-5 h-5 mr-2" />
                Courses
              </div>
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-600"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                About
              </div>
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-600"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Contact
              </div>
            </Link>
            
            {!loading && !userData ? (
              <div className="mt-4 flex flex-col space-y-2 px-3">
                <Link to="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={toggleMenu}>
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            ) : userData ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={userData.avatar} alt={userData.name} />
                      <AvatarFallback>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {userData.name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {userData.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={toggleMenu}
                  >
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Dashboard
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <LogOut className="w-5 h-5 mr-2" />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </div>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
