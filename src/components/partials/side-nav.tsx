import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineXMark } from "react-icons/hi2";
import { Link } from 'react-router-dom';
import { ModeToggle } from '../mode-toggle';

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
    return (
        <AnimatePresence mode='wait'>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 select-none md:hidden bg-black/50 backdrop-blur-sm z-10"
                        onClick={handleClose}
                    />
                    <motion.nav
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30
                        }}
                        className='fixed inset-y-0 left-0 z-30 w-[300px] bg-white/95 dark:bg-black/95 border-r dark:border-r-gray-800 overflow-y-auto md:hidden backdrop-blur-md'
                    >
                        <div className='flex items-center justify-between h-[80px] px-4 border-b dark:border-b-gray-800'>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center gap-2">
    <DollarSign className="w-6 h-6 text-green-600" />
    <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
        Cost Tracker
    </span>
</div>
                            </motion.div>
                            <div className="flex items-center gap-2">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <ModeToggle />
                                </motion.div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleClose}
                                >
                                    <HiOutlineXMark className='h-6 w-6 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors' />
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
                                    className='space-y-2'
                                >
                                    <h3 className='text-sm font-semibold text-gray-500 dark:text-gray-400 px-2'>
                                        {section.title}
                                    </h3>
                                    {section.items.map((item, itemIndex) => (
                                        <motion.div
                                            key={item.to}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * (index + itemIndex + 1) }}
                                        >
                                            <Link 
                                                to={item.to} 
                                                className='flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-1'
                                                onClick={handleClose}
                                            >
                                                <span className="text-gray-400 dark:text-gray-500 group-hover:text-primary">
                                                    {item.icon}
                                                </span>
                                                {item.label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ))}
                        </div>
                    </motion.nav>
                </>
            )}
        </AnimatePresence>
    );
}
