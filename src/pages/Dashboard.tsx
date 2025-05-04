
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import TransactionBadge from "@/components/TransactionBadge";
import { ArrowDown, ArrowUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  
  const userTransactions = useMemo(() => {
    if (!user) return [];
    return transactions.filter(t => t.userId === user.id);
  }, [user, transactions]);
  
  const pendingTransactions = useMemo(() => {
    return userTransactions.filter(t => t.status === "pending");
  }, [userTransactions]);
  
  const recentTransactions = useMemo(() => {
    return [...userTransactions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5);
  }, [userTransactions]);

  // Generate chart data
  const chartData = useMemo(() => {
    // Get last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    // Create balance data points
    let balance = user?.balance || 0;
    let dailyBalances = [];
    
    for (const date of dates) {
      // Find transactions for this date
      const dateTransactions = transactions.filter(t => 
        t.userId === user?.id &&
        t.status === "approved" &&
        t.createdAt.split('T')[0] === date
      );
      
      // Calculate balance changes
      let dailyChange = 0;
      dateTransactions.forEach(t => {
        if (t.type === "deposit") dailyChange += t.amount;
        if (t.type === "withdrawal") dailyChange -= t.amount;
      });
      
      balance -= dailyChange; // Go backward in time
      
      dailyBalances.push({
        date,
        balance: Math.max(0, balance), // Ensure no negative balance
      });
    }
    
    // Reverse to go forward in time
    dailyBalances.reverse();
    
    // Set the last point to current balance
    if (dailyBalances.length > 0) {
      dailyBalances[dailyBalances.length - 1].balance = user?.balance || 0;
    }
    
    return dailyBalances;
  }, [user, transactions]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${user.balance.toFixed(2)}</div>
            <div className="flex mt-4 gap-2">
              <Link to="/deposit">
                <Button size="sm" className="flex items-center gap-1">
                  <ArrowDown className="h-4 w-4" />
                  Deposit
                </Button>
              </Link>
              <Link to="/withdraw">
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <ArrowUp className="h-4 w-4" />
                  Withdraw
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
              <Link to="/transactions">
                <Button size="sm" variant="outline">View All Transactions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Member Since
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Balance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Balance']} />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="hsl(var(--primary))"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center border-b border-border pb-2">
                      <div>
                        <div className="font-medium">
                          {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={transaction.type === "deposit" ? "text-success" : "text-destructive"}>
                          {transaction.type === "deposit" ? "+" : "-"}${transaction.amount}
                        </div>
                        <div>
                          <TransactionBadge status={transaction.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2">
                    <Link to="/transactions">
                      <Button variant="link" className="px-0">View all transactions</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
