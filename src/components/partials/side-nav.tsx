import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineXMark } from "react-icons/hi2";
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from '../mode-toggle';
import { cn } from '@/lib/utils';
import { 
    Home,
    PlusCircle,
    History,
    PieChart,
    Settings,
    HelpCircle,
    User,
    DollarSign,
    Receipt,
    Wallet
} from 'lucide-react';

const menuItems = [
    {
        title: "Navigation",
        items: [
            { to: "/", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
            { to: "/add", label: "Add Expense", icon: <PlusCircle className="w-5 h-5" /> },
            { to: "/history", label: "Expense History", icon: <History className="w-5 h-5" /> },
            { to: "/stats", label: "Statistics", icon: <PieChart className="w-5 h-5" /> },
        ]
    },
    {
        title: "Account",
        items: [
            { to: "/profile", label: "Profile", icon: <User className="w-5 h-5" /> },
            { to: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
        ]
    },
    {
        title: "Resources",
        items: [
            { to: "/budget", label: "Budget", icon: <Wallet className="w-5 h-5" /> },
            { to: "/reports", label: "Reports", icon: <Receipt className="w-5 h-5" /> },
            { to: "/help", label: "Help Center", icon: <HelpCircle className="w-5 h-5" /> },
        ]
    }
];

export default function SideNav({ isOpen, handleClose }: { isOpen: boolean, handleClose: () => void }) {
    const location = useLocation();
    
    return (
        <AnimatePresence mode='wait'>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 select-none z-10 bg-black/50 backdrop-blur-sm md:hidden"
                        onClick={handleClose}
                    />
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30
                        }}
                        className="fixed inset-y-0 left-0 z-30 w-[280px] bg-white/80 dark:bg-black/80 border-r border-gray-200 dark:border-gray-800 overflow-y-auto backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between h-[80px] px-6 border-b border-gray-200 dark:border-gray-800">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-500" />
                                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-500 dark:to-emerald-400 bg-clip-text text-transparent">
                                    Cost Tracker
                                </span>
                            </motion.div>
                            <div className="flex items-center gap-3">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <ModeToggle />
                                </motion.div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleClose}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <HiOutlineXMark className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
                                </motion.button>
                            </div>
                        </div>

                        <div className='p-4 space-y-6'>
                            {menuItems.map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className='space-y-3'
                                >
                                    <h3 className='text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3'>
                                        {section.title}
                                    </h3>
                                    <div className='space-y-1'>
                                        {section.items.map((item, itemIndex) => {
                                            const isActive = location.pathname === item.to || 
                                                          (item.to !== '/' && location.pathname.startsWith(item.to));
                                            return (
                                                <motion.div
                                                    key={item.to}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * (index + itemIndex + 1) }}
                                                >
                                                    <Link
                                                        to={item.to}
                                                        className={cn(
                                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                                            isActive 
                                                                ? 'bg-green-50 dark:bg-gray-800 text-green-700 dark:text-green-400' 
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                                                        )}
                                                        onClick={handleClose}
                                                    >
                                                        <span className={cn(
                                                            isActive 
                                                                ? 'text-green-600 dark:text-green-400' 
                                                                : 'text-gray-500 dark:text-gray-400'
                                                        )}>
                                                            {item.icon}
                                                        </span>
                                                        <span>{item.label}</span>
                                                        {isActive && (
                                                            <span className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                        )}
                                                    </Link>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
