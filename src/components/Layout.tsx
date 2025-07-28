
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from "sonner";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-16">{children}</div>
      <Footer />
      <Toaster position="top-right" closeButton richColors />
    </div>
  );
};

export default Layout;
