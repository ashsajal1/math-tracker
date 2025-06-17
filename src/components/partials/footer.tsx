import { FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-background border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Math Tracker
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Track your math practice and improve your skills
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/yourusername/math-tracker" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <FaGithub size={20} />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Math Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
