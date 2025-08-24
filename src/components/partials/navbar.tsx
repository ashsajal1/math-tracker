import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, Home, User, Settings, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "../mode-toggle";
import Logo from "@/components/Logo";

const navLinks = [
  { to: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { to: "/stats", label: "Stats", icon: <BarChart3 className="h-5 w-5" /> },
  { to: "/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  { to: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

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

  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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
        <Link to='/' className="flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-auto text-black dark:text-white" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Math Tracker
              </h1>
            </div>
            
          </motion.div>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isActive(link.to)
                ? 'text-primary font-medium bg-primary/10'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden"
        >
          <Menu 
            onClick={toggleOpen} 
            className="h-6 w-6 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary dark:hover:text-primary transition-colors" 
          />
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800 p-4 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'text-primary font-medium bg-primary/10'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}