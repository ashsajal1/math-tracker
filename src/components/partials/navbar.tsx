import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { CiMenuFries, CiShoppingCart, CiReceipt } from "react-icons/ci";
import { FaChartPie, FaCog } from "react-icons/fa";
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
        <Link to='/' className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-auto text-black dark:text-white" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Cost Tracker
              </h1>
            </div>
            
          </motion.div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-6">
          <Link to="/add" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <CiShoppingCart className="h-5 w-5" />
            <span>Add Expense</span>
          </Link>
          <Link to="/history" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <CiReceipt className="h-5 w-5" />
            <span>History</span>
          </Link>
          <Link to="/stats" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <FaChartPie className="h-4 w-4" />
            <span>Stats</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <FaCog className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </div>
        <ModeToggle />
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <CiMenuFries 
            onClick={toggleOpen} 
            className="h-6 w-6 md:hidden text-gray-600 dark:text-gray-400 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors" 
          />
        </motion.div>
      </div>
    </motion.nav>
  );
}