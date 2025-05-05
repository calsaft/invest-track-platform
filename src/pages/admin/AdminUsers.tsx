
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default function AdminUsers() {
  const { users, deleteUser, isLoading } = useAdmin();
  const { user: currentUser, updateUserBalance, refreshUserSession } = useAuth();
  
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUpdateUserBalance = async (userId: string, amount: number) => {
    try {
      await updateUserBalance(userId, amount);
      refreshUserSession(); // Refresh the current user session if needed
    } catch (error) {
      console.error("Error updating user balance:", error);
    }
  };

  const handleRefresh = () => {
    refreshUserSession();
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        
        <div className="flex gap-3">
          <Link to="/admin/users/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add New User</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <AdminUsersTable 
              users={users}
              onDeleteUser={handleDeleteUser}
              onUpdateUserBalance={handleUpdateUserBalance}
              currentUserId={currentUser?.id}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
