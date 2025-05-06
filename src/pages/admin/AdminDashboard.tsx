
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import TransactionBadge from "@/components/TransactionBadge";
import { ArrowDown, ArrowUp, Plus, Users } from "lucide-react";

export default function AdminDashboard() {
  const { users } = useAdmin();
  const { transactions } = useTransactions();
  
  // Get pending transactions
  const pendingTransactions = transactions.filter(t => t.status === "pending");
  
  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get recent users
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <div className="flex gap-3">
          <Link to="/admin/users">
            <Button className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="outline">Settings</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="mt-4">
              <Link to="/admin/users/new">
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add New User
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions.length}</div>
            <div className="mt-4">
              <Link to="/admin/transactions">
                <Button size="sm" variant="outline">View All Transactions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex justify-between items-center border-b border-border pb-2">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="text-right">
                      <div>${user.balance.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No users found</div>
              )}
              
              <div className="pt-2">
                <Link to="/admin/users">
                  <Button variant="link" className="px-0">View all users</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="pt-4 space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center border-b border-border pb-2">
                      <div className="flex items-center">
                        <div className={`mr-3 p-1 rounded-full ${
                          transaction.type === "deposit" 
                            ? "bg-success/20 text-success" 
                            : "bg-destructive/20 text-destructive"
                        }`}>
                          {transaction.type === "deposit" 
                            ? <ArrowDown className="h-4 w-4" /> 
                            : <ArrowUp className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            User ID: {transaction.userId}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>${transaction.amount}</div>
                        <div>
                          <TransactionBadge status={transaction.status} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No transactions found</div>
                )}
                
                <div className="pt-2">
                  <Link to="/admin/transactions">
                    <Button variant="link" className="px-0">View all transactions</Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="pending" className="pt-4 space-y-4">
                {pendingTransactions.length > 0 ? (
                  pendingTransactions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center border-b border-border pb-2">
                        <div className="flex items-center">
                          <div className={`mr-3 p-1 rounded-full ${
                            transaction.type === "deposit" 
                              ? "bg-success/20 text-success" 
                              : "bg-destructive/20 text-destructive"
                          }`}>
                            {transaction.type === "deposit" 
                              ? <ArrowDown className="h-4 w-4" /> 
                              : <ArrowUp className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              User ID: {transaction.userId}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div>${transaction.amount}</div>
                          <div>
                            <TransactionBadge status={transaction.status} />
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No pending transactions</div>
                )}
                
                <div className="pt-2">
                  <Link to="/admin/transactions">
                    <Button variant="link" className="px-0">View all transactions</Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
