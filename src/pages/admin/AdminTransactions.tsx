
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransactions, Transaction } from "@/contexts/TransactionContext";
import { useAdmin } from "@/contexts/AdminContext";
import TransactionBadge from "@/components/TransactionBadge";
import { Check, Search, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminTransactions() {
  const { transactions, updateTransaction, isLoading } = useTransactions();
  const { users } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  
  const pendingTransactions = transactions.filter(t => t.status === "pending");
  const approvedTransactions = transactions.filter(t => t.status === "approved");
  const rejectedTransactions = transactions.filter(t => t.status === "rejected");
  
  const getFilteredTransactions = (transactionList: Transaction[]) => {
    if (!searchQuery.trim()) return transactionList;
    
    const query = searchQuery.toLowerCase();
    return transactionList.filter(t => {
      const user = users.find(u => u.id === t.userId);
      return (
        t.type.toLowerCase().includes(query) ||
        t.amount.toString().includes(query) ||
        (user?.name.toLowerCase().includes(query) || false) ||
        (user?.email.toLowerCase().includes(query) || false) ||
        t.userId.includes(query)
      );
    });
  };
  
  const handleUpdateTransaction = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateTransaction(id, status);
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction status");
    }
  };
  
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User #${userId}`;
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
          <div>
            <div className="font-medium flex items-center gap-2">
              {transaction.type === "deposit" ? "Deposit" : "Withdrawal"} 
              <TransactionBadge status={transaction.status} />
            </div>
            <div className="text-sm text-muted-foreground">
              By {getUserName(transaction.userId)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {transaction.details?.currency || "N/A"} • 
              {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
              {new Date(transaction.createdAt).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="font-medium mb-2">${transaction.amount}</div>
            
            {transaction.status === "pending" && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 bg-success/10 text-success hover:bg-success/20 hover:text-success"
                  onClick={() => handleUpdateTransaction(transaction.id, "approved")}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => handleUpdateTransaction(transaction.id, "rejected")}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      ));
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-6">Manage Transactions</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>All Transactions</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by type, amount, or user..." 
                className="pl-9 max-w-xs" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingTransactions.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedTransactions.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedTransactions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {renderTransactionList(transactions)}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {renderTransactionList(pendingTransactions)}
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              {renderTransactionList(approvedTransactions)}
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              {renderTransactionList(rejectedTransactions)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
