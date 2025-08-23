import { FaGithub, FaDollarSign, FaChartLine, FaWallet } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-background border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-4">
              Cost Tracker
            </h3>
            <p className="text-muted-foreground text-sm">
              Track your expenses, manage your budget, and achieve your financial goals.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/add" className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">Add Expense</a></li>
              <li><a href="/history" className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">Expense History</a></li>
              <li><a href="/stats" className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">Statistics</a></li>
              <li><a href="/settings" className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">Settings</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-3">Features</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-muted-foreground">
                <FaDollarSign className="mr-2 text-green-500" size={12} />
                <span>Expense Tracking</span>
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <FaChartLine className="mr-2 text-green-500" size={12} />
                <span>Visual Reports</span>
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <FaWallet className="mr-2 text-green-500" size={12} />
                <span>Budget Management</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-3">Connect</h4>
            <div className="flex space-x-4">
              <motion.a 
                href="https://github.com/AshsajalPro/cost-tracker" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={20} />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <p className="text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Cost Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
