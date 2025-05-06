
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  status: "active" | "completed" | string;
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

  // Load investments from Supabase on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchInvestments();
    } else {
      setInvestments([]);
    }
  }, [user]);

  // Fetch investments from Supabase
  const fetchInvestments = async () => {
    try {
      setIsLoading(true);
      
      if (!user) return;

      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Map Supabase data to Investment type
        const mappedInvestments: Investment[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          planId: item.plan_id,
          amount: Number(item.amount),
          returnAmount: Number(item.return_amount),
          duration: item.duration,
          startDate: item.start_date,
          endDate: item.end_date,
          dailyReturn: Number(item.daily_return),
          status: item.status,
          currentValue: Number(item.current_value)
        }));
        
        setInvestments(mappedInvestments);
      }
    } catch (error: any) {
      console.error('Error fetching investments:', error);
      toast.error('Failed to load investments');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate daily growth for active investments
  useEffect(() => {
    const interval = setInterval(() => {
      calculateInvestmentGrowth();
    }, 1000 * 60 * 60); // Update every hour
    
    // Run once immediately
    if (user) {
      calculateInvestmentGrowth();
    }
    
    return () => clearInterval(interval);
  }, [investments, user]);

  const calculateInvestmentGrowth = async () => {
    if (!user) return;
    
    try {
      // Update current value for all active investments
      const updatedInvestments = await Promise.all(investments.map(async (investment) => {
        if (investment.status === "active") {
          const startDate = new Date(investment.startDate);
          const now = new Date();
          const endDate = new Date(investment.endDate);
          
          // Don't update if investment is complete
          if (now >= endDate && investment.status === "active") {
            // Mark as completed and update user balance
            if (user && investment.userId === user.id) {
              await updateUserBalance(user.id, investment.returnAmount);
            }
            
            // Update investment status in Supabase
            await supabase
              .from('investments')
              .update({ 
                status: 'completed',
                current_value: investment.returnAmount
              })
              .eq('id', investment.id);
              
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
          
          // Update current value in Supabase
          await supabase
            .from('investments')
            .update({ current_value: currentValue })
            .eq('id', investment.id);
            
          return { ...investment, currentValue };
        }
        return investment;
      }));
      
      setInvestments(updatedInvestments);
    } catch (error) {
      console.error('Error calculating investment growth:', error);
    }
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
      
      // Create new investment in Supabase
      const { data, error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          plan_id: planId,
          amount: amount,
          return_amount: returnAmount,
          duration: duration,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          daily_return: dailyReturn,
          current_value: amount // Starts at the investment amount
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error("Failed to create investment");
      }
      
      // Deduct from user's balance
      await updateUserBalance(user.id, -amount);
      
      // Map Supabase data to Investment type
      const newInvestment: Investment = {
        id: data.id,
        userId: data.user_id,
        planId: data.plan_id,
        amount: Number(data.amount),
        returnAmount: Number(data.return_amount),
        duration: data.duration,
        startDate: data.start_date,
        endDate: data.end_date,
        dailyReturn: Number(data.daily_return),
        status: data.status,
        currentValue: Number(data.current_value)
      };
      
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
