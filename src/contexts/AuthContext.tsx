import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export type Referral = {
  id: string;
  name?: string;
  commission: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  balance: number;
  createdAt: string;
  referrals?: Referral[];
  referralBonus?: number;
  referredBy?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateUserBalance: (userId: string, amount: number) => Promise<void>;
  addReferralCommission: (referrerId: string, amount: number, userId: string) => Promise<void>;
  users: User[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    balance: 10000,
    createdAt: new Date().toISOString(),
    referrals: [],
    referralBonus: 0,
  },
  {
    id: "2",
    name: "Test User",
    email: "user@example.com",
    role: "user",
    balance: 1000,
    createdAt: new Date().toISOString(),
    referrals: [],
    referralBonus: 0,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("investmentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Check for saved users in localStorage
    const savedUsers = localStorage.getItem("investmentUsers");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with mock users
      localStorage.setItem("investmentUsers", JSON.stringify(mockUsers));
    }
    
    setIsLoading(false);
  }, []);

  // Save users to localStorage when changed
  useEffect(() => {
    localStorage.setItem("investmentUsers", JSON.stringify(users));
  }, [users]);

  const updateUserBalance = async (userId: string, amount: number): Promise<void> => {
    setIsLoading(true);
    try {
      const updatedUsers = users.map(u => 
        u.id === userId 
          ? { ...u, balance: Math.max(0, u.balance + amount) }
          : u
      );
      
      setUsers(updatedUsers);
      
      // Update current user if it's them
      if (user && user.id === userId) {
        const updatedUser = { ...user, balance: Math.max(0, user.balance + amount) };
        setUser(updatedUser);
        localStorage.setItem("investmentUser", JSON.stringify(updatedUser));
      }
      
      return;
    } catch (error: any) {
      toast.error(error.message || "Failed to update balance");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addReferralCommission = async (referrerId: string, amount: number, userId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Find the referrer
      const referrer = users.find(u => u.id === referrerId);
      if (!referrer) throw new Error("Referrer not found");
      
      // Find the new user
      const newUser = users.find(u => u.id === userId);
      if (!newUser) throw new Error("User not found");
      
      // Calculate commission (20% of deposit)
      const commission = amount * 0.2;
      
      // Update referrer's referrals and bonus
      const updatedReferrals = [...(referrer.referrals || []), {
        id: userId,
        name: newUser.name,
        commission,
      }];
      
      const updatedReferralBonus = (referrer.referralBonus || 0) + commission;
      
      // Update referrer in users array
      const updatedUsers = users.map(u => 
        u.id === referrerId 
          ? { ...u, 
              referrals: updatedReferrals, 
              referralBonus: updatedReferralBonus,
              balance: u.balance + commission
            }
          : u
      );
      
      setUsers(updatedUsers);
      
      // Update current user if it's the referrer
      if (user && user.id === referrerId) {
        const updatedUser = { 
          ...user, 
          referrals: updatedReferrals, 
          referralBonus: updatedReferralBonus,
          balance: user.balance + commission
        };
        setUser(updatedUser);
        localStorage.setItem("investmentUser", JSON.stringify(updatedUser));
      }
      
      toast.success(`Referral commission of $${commission} added`);
      
      return;
    } catch (error: any) {
      toast.error(error.message || "Failed to add referral commission");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const foundUser = users.find(u => u.email === email);
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }
      
      // In a real app, you'd verify the password here
      
      setUser(foundUser);
      localStorage.setItem("investmentUser", JSON.stringify(foundUser));
      toast.success("Login successful");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        throw new Error("User already exists");
      }
      
      const newUser: User = {
        id: String(users.length + 1),
        name,
        email,
        role: "user",
        balance: 0,
        createdAt: new Date().toISOString(),
        referrals: [],
        referralBonus: 0,
        referredBy: referralCode,
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setUser(newUser);
      localStorage.setItem("investmentUser", JSON.stringify(newUser));
      localStorage.setItem("investmentUsers", JSON.stringify(updatedUsers));
      
      toast.success("Registration successful");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("investmentUser");
    toast.success("Logged out successfully");
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const foundUser = users.find(u => u.email === email);
      if (!foundUser) {
        throw new Error("Email not found");
      }
      
      // In a real app, you'd send a password reset email
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Password reset failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      resetPassword, 
      updateUserBalance,
      addReferralCommission,
      users
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
