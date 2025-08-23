import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { CiMenuFries } from "react-icons/ci";
import { motion } from "framer-motion";
import { ModeToggle } from "../mode-toggle";
import Logo from "@/components/Logo";

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-center justify-between px-4 md:px-8 w-full h-[80px] top-0 bg-white/80 md:dark:border-none border-b dark:bg-black/80 dark:border-b-gray-800 z-20 fixed backdrop-blur-md ${
        scrollY > 150 ? 'shadow-sm' : ''
      }`} 
      onClick={handleNavClick}
    >
      <div className="flex items-center gap-8">
        <Link to='/'>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-auto text-black dark:text-white" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Cost Tracker
              </h1>
            </div>
            
          </motion.div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <CiMenuFries 
            onClick={toggleOpen} 
            className="h-6 w-6 md:hidden text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary dark:hover:text-primary transition-colors" 
          />
        </motion.div>
      </div>
    </motion.nav>
  );
}