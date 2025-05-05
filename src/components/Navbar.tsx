
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const { user, logout, refreshUserSession } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (user) {
      e.preventDefault();
      refreshUserSession();
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <Link 
            to={user ? "/dashboard" : "/"} 
            className="text-xl font-bold text-primary"
            onClick={handleLogoClick}
          >
            InvestTrack
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link 
                  to="/deposit" 
                  className={`nav-link ${location.pathname === '/deposit' ? 'active' : ''}`}>
                  Deposit
                </Link>
                <Link 
                  to="/withdraw" 
                  className={`nav-link ${location.pathname === '/withdraw' ? 'active' : ''}`}>
                  Withdraw
                </Link>
                <Link 
                  to="/transactions" 
                  className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}>
                  Transactions
                </Link>
                {user.role === "admin" && (
                  <Link 
                    to="/admin" 
                    className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
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
              
              <Link to="/login">
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
