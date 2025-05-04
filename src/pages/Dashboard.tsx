
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useInvestments } from "@/contexts/InvestmentContext";
import TransactionBadge from "@/components/TransactionBadge";
import { ArrowDown, ArrowUp, TrendingUp, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { investments } = useInvestments();
  
  const userTransactions = useMemo(() => {
    if (!user) return [];
    return transactions.filter(t => t.userId === user.id);
  }, [user, transactions]);
  
  const userInvestments = useMemo(() => {
    if (!user) return [];
    return investments.filter(i => i.userId === user.id);
  }, [user, investments]);
  
  const activeInvestments = useMemo(() => {
    return userInvestments.filter(i => i.status === "active");
  }, [userInvestments]);
  
  const pendingTransactions = useMemo(() => {
    return userTransactions.filter(t => t.status === "pending");
  }, [userTransactions]);
  
  const recentTransactions = useMemo(() => {
    return [...userTransactions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5);
  }, [userTransactions]);

  // Calculate total invested and investment value
  const totalInvested = useMemo(() => {
    return userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  }, [userInvestments]);
  
  const currentInvestmentValue = useMemo(() => {
    return userInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  }, [userInvestments]);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestments.length}</div>
            <div className="mt-4">
              <Link to="/plans">
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  View Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investment Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentInvestmentValue.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              From ${totalInvested.toFixed(2)} invested
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Referral Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${user.referralBonus?.toFixed(2) || "0.00"}</div>
            <div className="mt-4">
              <Link to="/referral">
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Refer Friends
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
      
      {/* Active Investments Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Active Investments</h2>
        {activeInvestments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeInvestments.map((investment) => {
              // Calculate progress percentage
              const startDate = new Date(investment.startDate);
              const endDate = new Date(investment.endDate);
              const now = new Date();
              
              const totalDuration = endDate.getTime() - startDate.getTime();
              const elapsed = now.getTime() - startDate.getTime();
              const progress = Math.min(100, (elapsed / totalDuration) * 100);
              
              // Calculate profit
              const profit = investment.currentValue - investment.amount;
              
              return (
                <Card key={investment.id}>
                  <CardHeader>
                    <CardTitle>Investment #{investment.id.split('-')[1]}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="text-muted-foreground">Amount Invested</div>
                      <div className="font-bold">${investment.amount}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-muted-foreground">Current Value</div>
                      <div className="font-bold text-success">${investment.currentValue.toFixed(2)}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-muted-foreground">Profit</div>
                      <div className="font-bold text-success">+${profit.toFixed(2)}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div>{new Date(investment.startDate).toLocaleDateString()}</div>
                      <div>{new Date(investment.endDate).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">You don't have any active investments</p>
              <Link to="/plans">
                <Button>View Investment Plans</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
