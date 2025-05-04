
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  CreditCard
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "bg-accent text-accent-foreground" : "";
  };

  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <div className="flex overflow-x-auto gap-2 mb-4 pb-2">
          <Link 
            to="/admin"
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive('/admin')}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/admin/users"
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive('/admin/users')}`}
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </Link>
          <Link 
            to="/admin/transactions"
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive('/admin/transactions')}`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Transactions</span>
          </Link>
          <Link 
            to="/admin/settings"
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${isActive('/admin/settings')}`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
      
      <Outlet />
    </div>
  );
}
