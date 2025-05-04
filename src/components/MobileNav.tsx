
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Home, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-40">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
          }`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/deposit" 
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            location.pathname === '/deposit' ? 'text-primary' : 'text-muted-foreground'
          }`}>
          <ArrowDown className="h-5 w-5" />
          <span className="text-xs mt-1">Deposit</span>
        </Link>
        
        <Link 
          to="/withdraw" 
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            location.pathname === '/withdraw' ? 'text-primary' : 'text-muted-foreground'
          }`}>
          <ArrowUp className="h-5 w-5" />
          <span className="text-xs mt-1">Withdraw</span>
        </Link>
        
        <Link 
          to="/transactions" 
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            location.pathname === '/transactions' ? 'text-primary' : 'text-muted-foreground'
          }`}>
          <Clock className="h-5 w-5" />
          <span className="text-xs mt-1">History</span>
        </Link>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="flex flex-col items-center justify-center flex-1 py-2 h-full rounded-none">
              <Menu className="h-5 w-5" />
              <span className="text-xs mt-1">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[385px]">
            <div className="flex flex-col gap-2 py-4">
              <h2 className="text-2xl font-bold mb-4">Menu</h2>
              
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={() => setOpen(false)}>
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/deposit" 
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={() => setOpen(false)}>
                <ArrowDown className="h-5 w-5" />
                <span>Deposit</span>
              </Link>
              
              <Link 
                to="/withdraw" 
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={() => setOpen(false)}>
                <ArrowUp className="h-5 w-5" />
                <span>Withdraw</span>
              </Link>
              
              <Link 
                to="/transactions" 
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                onClick={() => setOpen(false)}>
                <Clock className="h-5 w-5" />
                <span>Transaction History</span>
              </Link>
              
              {user.role === "admin" && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                  onClick={() => setOpen(false)}>
                  <Settings className="h-5 w-5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
