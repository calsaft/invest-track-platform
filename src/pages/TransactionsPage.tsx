
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions, Transaction } from "@/contexts/TransactionContext";
import TransactionBadge from "@/components/TransactionBadge";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TransactionsPage() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState("");
  
  const userTransactions = useMemo(() => {
    if (!user) return [];
    return transactions.filter(t => t.userId === user.id);
  }, [user, transactions]);
  
  const deposits = useMemo(() => {
    return userTransactions.filter(t => t.type === "deposit");
  }, [userTransactions]);
  
  const withdrawals = useMemo(() => {
    return userTransactions.filter(t => t.type === "withdrawal");
  }, [userTransactions]);
  
  const getFilteredTransactions = (transactionList: Transaction[]) => {
    if (!searchQuery.trim()) return transactionList;
    
    return transactionList.filter(t => 
      t.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.amount.toString().includes(searchQuery) ||
      new Date(t.createdAt).toLocaleDateString().includes(searchQuery)
    );
  };

  const renderTransactionList = (transactionList: Transaction[]) => {
    const filteredList = getFilteredTransactions(transactionList);
    
    if (filteredList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No transactions found
        </div>
      );
    }
    
    return filteredList
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((transaction) => (
        <div key={transaction.id} className="transaction-item">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${
              transaction.type === "deposit" 
                ? "bg-success/20 text-success" 
                : "bg-destructive/20 text-destructive"
            }`}>
              {transaction.type === "deposit" ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
            </div>
            <div>
              <div className="font-medium">
                {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`font-medium ${
              transaction.type === "deposit" ? "text-success" : "text-destructive"
            }`}>
              {transaction.type === "deposit" ? "+" : "-"}${transaction.amount}
            </div>
            <div>
              <TransactionBadge status={transaction.status} />
            </div>
          </div>
        </div>
      ));
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Your Transactions</CardTitle>
              <CardDescription>
                View and track all your deposits and withdrawals
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-9 max-w-xs" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({userTransactions.length})</TabsTrigger>
              <TabsTrigger value="deposits">Deposits ({deposits.length})</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {renderTransactionList(userTransactions)}
            </TabsContent>
            
            <TabsContent value="deposits" className="space-y-4">
              {renderTransactionList(deposits)}
            </TabsContent>
            
            <TabsContent value="withdrawals" className="space-y-4">
              {renderTransactionList(withdrawals)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
