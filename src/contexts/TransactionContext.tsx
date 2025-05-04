
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export type Transaction = {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal";
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  details?: {
    wallet?: string;
    currency?: string;
    screenshotUrl?: string;
  };
};

type TransactionContextType = {
  transactions: Transaction[];
  isLoading: boolean;
  createDeposit: (amount: number, wallet: string, currency: string, screenshot?: File | null) => Promise<void>;
  createWithdrawal: (amount: number, wallet: string, currency: string) => Promise<void>;
  updateTransaction: (transactionId: string, status: "approved" | "rejected") => Promise<void>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Mock transactions
const mockTransactions: Transaction[] = [
  {
    id: "1",
    userId: "2",
    type: "deposit",
    amount: 500,
    status: "approved",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    details: {
      wallet: "TRC20Address123",
      currency: "TRC20",
    },
  },
  {
    id: "2",
    userId: "2",
    type: "withdrawal",
    amount: 200,
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    details: {
      wallet: "UserWalletAddress456",
      currency: "BEP20",
    },
  },
];

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUserBalance, addReferralCommission, users } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem("investmentTransactions");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage on change
  useEffect(() => {
    localStorage.setItem("investmentTransactions", JSON.stringify(transactions));
  }, [transactions]);

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const createDeposit = async (amount: number, wallet: string, currency: string, screenshot: File | null = null) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("You must be logged in");
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Process screenshot if provided
      let screenshotUrl: string | undefined = undefined;
      if (screenshot) {
        // In a real app, we would upload the file to storage
        // For now, we'll convert to base64 and store it
        screenshotUrl = await fileToBase64(screenshot);
      }
      
      const newTransaction: Transaction = {
        id: String(transactions.length + 1),
        userId: user.id,
        type: "deposit",
        amount,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        details: {
          wallet,
          currency,
          screenshotUrl
        },
      };
      
      setTransactions([...transactions, newTransaction]);
      toast.success("Deposit request submitted successfully");
    } catch (error: any) {
      toast.error(error.message || "Deposit request failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createWithdrawal = async (amount: number, wallet: string, currency: string) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("You must be logged in");
      
      // Check if user has enough balance
      if (user.balance < amount) {
        throw new Error("Insufficient balance");
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: String(transactions.length + 1),
        userId: user.id,
        type: "withdrawal",
        amount,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        details: {
          wallet,
          currency,
        },
      };
      
      setTransactions([...transactions, newTransaction]);
      toast.success("Withdrawal request submitted successfully");
    } catch (error: any) {
      toast.error(error.message || "Withdrawal request failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (transactionId: string, status: "approved" | "rejected") => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("You must be logged in");
      if (user.role !== "admin") throw new Error("Unauthorized");
      
      // Find the transaction
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) throw new Error("Transaction not found");
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Process transaction based on status
      if (status === "approved") {
        // Update user balance for approved deposits
        if (transaction.type === "deposit") {
          await updateUserBalance(transaction.userId, transaction.amount);
          
          // Check if this user was referred by someone
          const depositUser = users.find(u => u.id === transaction.userId);
          if (depositUser?.referredBy) {
            // Add referral commission (20% of the deposit)
            await addReferralCommission(
              depositUser.referredBy, 
              transaction.amount, 
              transaction.userId
            );
          }
        } 
        // Deduct balance for approved withdrawals
        else if (transaction.type === "withdrawal") {
          await updateUserBalance(transaction.userId, -transaction.amount);
        }
      }
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { 
                ...t, 
                status, 
                updatedAt: new Date().toISOString() 
              } 
            : t
        )
      );
      
      toast.success(`Transaction ${status} successfully`);
    } catch (error: any) {
      toast.error(error.message || "Update transaction failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TransactionContext.Provider 
      value={{ 
        transactions, 
        isLoading, 
        createDeposit, 
        createWithdrawal, 
        updateTransaction 
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
};
