import { Github, Home, BarChart3, User, Settings, BookOpen, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type FooterLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const footerLinks: FooterSection[] = [
  {
    title: 'Navigation',
    links: [
      { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
      { name: 'Stats', href: '/stats', icon: <BarChart3 className="w-4 h-4" /> },
      { name: 'Profile', href: '/profile', icon: <User className="w-4 h-4" /> },
      { name: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs', icon: <BookOpen className="w-4 h-4" />, external: true },
      { name: 'Help Center', href: '/help', icon: <HelpCircle className="w-4 h-4" />, external: true },
    ],
  },
  {
    title: 'Connect',
    links: [
      { 
        name: 'GitHub', 
        href: 'https://github.com/ashsajal1/math-tracker', 
        icon: <Github className="w-4 h-4" />, 
        external: true 
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Math Tracker
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Track your math practice, monitor progress, and improve your skills with our intuitive platform.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://github.com/ashsajal1/math-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.icon && <span className="mr-2">{link.icon}</span>}
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.icon && <span className="mr-2">{link.icon}</span>}
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Math Tracker. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
              <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
