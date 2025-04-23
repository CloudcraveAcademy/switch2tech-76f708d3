
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  withPadding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, withPadding = true }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-grow ${withPadding ? 'pt-16' : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
