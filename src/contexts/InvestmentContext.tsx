
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export type Investment = {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  returnAmount: number;
  duration: number;
  startDate: string;
  endDate: string;
  dailyReturn: number;
  status: "active" | "completed" | "credited" | string;
  currentValue: number;
};

interface InvestmentContextType {
  investments: Investment[];
  isLoading: boolean;
  createInvestment: (planId: string, amount: number, duration: number) => Promise<void>;
  calculateInvestmentGrowth: () => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export function InvestmentProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUserBalance } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load investments from localStorage on mount
  useEffect(() => {
    const savedInvestments = localStorage.getItem("investments");
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }
  }, []);

  // Save investments to localStorage on change
  useEffect(() => {
    localStorage.setItem("investments", JSON.stringify(investments));
  }, [investments]);

  // Calculate daily growth for active investments and credit matured investments
  useEffect(() => {
    const interval = setInterval(() => {
      calculateInvestmentGrowth();
    }, 1000 * 60 * 10); // Update every 10 minutes for better responsiveness
    
    // Run once immediately
    calculateInvestmentGrowth();
    
    return () => clearInterval(interval);
  }, [investments, user]);

  const calculateInvestmentGrowth = () => {
    // Update current value for all active investments
    const updatedInvestments = investments.map(investment => {
      if (investment.status === "active") {
        const startDate = new Date(investment.startDate);
        const now = new Date();
        const endDate = new Date(investment.endDate);
        
        // Check if investment is mature but not yet credited
        if (now >= endDate) {
          // Only credit if not already credited
          if (investment.status !== "credited") {
            // Mark as completed and update user balance
            if (user && investment.userId === user.id) {
              updateUserBalance(user.id, investment.returnAmount);
              toast.success(`Your investment of $${investment.amount} has matured and $${investment.returnAmount} has been credited to your account!`);
            } else {
              // Handle case where user is not the current logged in user (admin view)
              const userId = investment.userId;
              updateUserBalance(userId, investment.returnAmount);
            }
            return { ...investment, status: "credited", currentValue: investment.returnAmount };
          }
          return { ...investment, status: "completed", currentValue: investment.returnAmount };
        }
        
        // Calculate elapsed days (fractional)
        const elapsedMs = now.getTime() - startDate.getTime();
        const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
        
        // Calculate current value based on daily growth
        const currentValue = Math.min(
          investment.amount + (elapsedDays * investment.dailyReturn),
          investment.returnAmount
        );
        
        return { ...investment, currentValue };
      }
      return investment;
    });
    
    setInvestments(updatedInvestments);
  };

  const createInvestment = async (planId: string, amount: number, duration: number) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("You must be logged in");
      
      if (user.balance < amount) {
        throw new Error("Insufficient balance");
      }
      
      // Calculate return amount (double the investment)
      const returnAmount = amount * 2;
      const dailyReturn = returnAmount / duration;
      
      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      
      const newInvestment: Investment = {
        id: `inv-${Date.now()}`,
        userId: user.id,
        planId,
        amount,
        returnAmount,
        duration,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "active",
        dailyReturn,
        currentValue: amount, // Starts at the investment amount
      };
      
      // Deduct from user's balance
      await updateUserBalance(user.id, -amount);
      
      setInvestments([...investments, newInvestment]);
      toast.success("Investment created successfully");
    } catch (error: any) {
      toast.error(error.message || "Investment creation failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InvestmentContext.Provider 
      value={{ 
        investments, 
        isLoading, 
        createInvestment,
        calculateInvestmentGrowth
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
}

export const useInvestments = () => {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error("useInvestments must be used within an InvestmentProvider");
  }
  return context;
};
