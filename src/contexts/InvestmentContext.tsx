import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export type InvestmentPlan = {
  id: string;
  name: string;
  roi: number;
  minDeposit: number;
  maxDeposit: number;
  durationDays: number;
  status: "active" | "inactive";
};

export type Investment = {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  roiEarned: number;
  createdAt: string;
  currentValue: number; // Added this property to fix the build errors
};

type InvestmentContextType = {
  plans: InvestmentPlan[];
  investments: Investment[];
  isLoading: boolean;
  createInvestment: (planId: string, amount: number) => Promise<void>;
  cancelInvestment: (investmentId: string) => Promise<void>;
  getInvestmentROI: (investmentId: string) => number;
};

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

// Mock investment plans
const mockPlans: InvestmentPlan[] = [
  {
    id: "1",
    name: "Basic Plan",
    roi: 0.05,
    minDeposit: 100,
    maxDeposit: 1000,
    durationDays: 30,
    status: "active",
  },
  {
    id: "2",
    name: "Standard Plan",
    roi: 0.10,
    minDeposit: 1001,
    maxDeposit: 5000,
    durationDays: 60,
    status: "active",
  },
  {
    id: "3",
    name: "Premium Plan",
    roi: 0.15,
    minDeposit: 5001,
    maxDeposit: 10000,
    durationDays: 90,
    status: "active",
  },
];

// Mock investments
const mockInvestments: Investment[] = [
  {
    id: "1",
    userId: "2",
    planId: "1",
    amount: 500,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    roiEarned: 25,
    createdAt: new Date().toISOString(),
    currentValue: 525, // Added currentValue (initial amount + roiEarned)
  },
  {
    id: "2",
    userId: "2",
    planId: "2",
    amount: 2000,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    roiEarned: 0,
    createdAt: new Date().toISOString(),
    currentValue: 2000, // Initial currentValue is the same as amount
  },
];

export function InvestmentProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUserBalance } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>(mockPlans);
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);
  const [isLoading, setIsLoading] = useState(false);

  // Load investments from localStorage on mount
  useEffect(() => {
    const savedInvestments = localStorage.getItem("investmentInvestments");
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }
  }, []);

  // Save investments to localStorage on change
  useEffect(() => {
    localStorage.setItem("investmentInvestments", JSON.stringify(investments));
  }, [investments]);

  const createInvestment = async (planId: string, amount: number) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("You must be logged in");
      
      // Find the plan
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error("Plan not found");
      
      // Check if user has enough balance
      if (user.balance < amount) {
        throw new Error("Insufficient balance");
      }
      
      // Check if amount is within plan limits
      if (amount < plan.minDeposit || amount > plan.maxDeposit) {
        throw new Error(`Amount must be between $${plan.minDeposit} and $${plan.maxDeposit}`);
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newInvestment: Investment = {
        id: String(investments.length + 1),
        userId: user.id,
        planId,
        amount,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        roiEarned: 0,
        createdAt: new Date().toISOString(),
        currentValue: amount, // Initialize currentValue with the investment amount
      };
      
      setInvestments([...investments, newInvestment]);
      
      // Deduct investment amount from user balance
      await updateUserBalance(user.id, -amount);
      
      toast.success("Investment created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create investment");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelInvestment = async (investmentId: string) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("You must be logged in");
      
      // Find the investment
      const investment = investments.find(i => i.id === investmentId);
      if (!investment) throw new Error("Investment not found");
      
      // Check if user owns the investment
      if (investment.userId !== user.id) {
        throw new Error("You do not own this investment");
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Update investment status to cancelled
      setInvestments(prev => 
        prev.map(i => 
          i.id === investmentId 
            ? { ...i, status: "cancelled" } 
            : i
        )
      );
      
      // Return investment amount to user balance
      await updateUserBalance(user.id, investment.amount);
      
      toast.success("Investment cancelled successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel investment");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getInvestmentROI = (investmentId: string): number => {
    const investment = investments.find(i => i.id === investmentId);
    if (!investment) return 0;
    
    const plan = plans.find(p => p.id === investment.planId);
    if (!plan) return 0;
    
    // Calculate ROI earned based on the time elapsed
    const startDate = new Date(investment.startDate);
    const endDate = new Date(); // Current date for calculation
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysElapsed = timeDiff / (1000 * 3600 * 24);
    
    const roiPerDay = plan.roi / plan.durationDays;
    const roiEarned = investment.amount * roiPerDay * daysElapsed;
    
    return roiEarned;
  };

  // Add a function to calculate the current value of investments
  const calculateInvestmentGrowth = () => {
    const updatedInvestments = investments.map(investment => {
      if (investment.status !== "active") return investment;
      
      const plan = plans.find(p => p.id === investment.planId);
      if (!plan) return investment;
      
      // Calculate growth based on time elapsed
      const startDate = new Date(investment.startDate);
      const now = new Date();
      const endDate = new Date(investment.endDate);
      
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      
      if (elapsed > 0) {
        const progressRatio = Math.min(1, elapsed / totalDuration);
        const expectedProfit = investment.amount * plan.roi;
        const currentProfit = expectedProfit * progressRatio;
        const newCurrentValue = investment.amount + currentProfit;
        
        return {
          ...investment,
          currentValue: newCurrentValue
        };
      }
      
      return investment;
    });
    
    if (JSON.stringify(updatedInvestments) !== JSON.stringify(investments)) {
      setInvestments(updatedInvestments);
    }
  };
  
  // Update investment values periodically
  useEffect(() => {
    calculateInvestmentGrowth();
    
    const interval = setInterval(() => {
      calculateInvestmentGrowth();
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [investments, plans]);

  return (
    <InvestmentContext.Provider 
      value={{ 
        plans, 
        investments, 
        isLoading, 
        createInvestment, 
        cancelInvestment,
        getInvestmentROI
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
