
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold text-primary">InvestTrack</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${location.pathname === '/dashboard' ? 'text-primary font-medium' : ''}`}>
                  Dashboard
                </Link>
                <Link 
                  to="/deposit" 
                  className={`nav-link ${location.pathname === '/deposit' ? 'text-primary font-medium' : ''}`}>
                  Deposit
                </Link>
                <Link 
                  to="/withdraw" 
                  className={`nav-link ${location.pathname === '/withdraw' ? 'text-primary font-medium' : ''}`}>
                  Withdraw
                </Link>
                <Link 
                  to="/transactions" 
                  className={`nav-link ${location.pathname === '/transactions' ? 'text-primary font-medium' : ''}`}>
                  Transactions
                </Link>
                <Link 
                  to="/referral" 
                  className={`nav-link ${location.pathname === '/referral' ? 'text-primary font-medium' : ''}`}>
                  Referral
                </Link>
                {user.role === "admin" && (
                  <Link 
                    to="/admin" 
                    className={`nav-link ${location.pathname.startsWith('/admin') ? 'text-primary font-medium' : ''}`}>
                    Admin
                  </Link>
                )}
              </div>

              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.role}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" className="hidden sm:flex items-center">
                    Register
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
