
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "../types/auth";
import { updateSessionExpiry, isSessionValid } from "../utils/sessionUtils";
import { addReferralCommission } from "../services/referralService";
import { 
  updateUserBalance, 
  findUserById, 
  findUserByEmail,
  createNewUser,
  refreshUserData
} from "../services/userService";

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
  refreshUserSession: () => void;
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
  {
    id: "3",
    name: "Gurutech",
    email: "Gurutech@gmail.com",
    role: "admin",
    balance: 10000,
    createdAt: new Date().toISOString(),
    referrals: [],
    referralBonus: 0,
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for saved user in localStorage and session expiry
    const savedUser = localStorage.getItem("investmentUser");
    
    if (savedUser && isSessionValid()) {
      setUser(JSON.parse(savedUser));
      // Extend session when user is active
      updateSessionExpiry();
    } else {
      // Session expired, clear data
      localStorage.removeItem("investmentUser");
      localStorage.removeItem("sessionExpiry");
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
  
  // Refresh user session
  const refreshUserSession = () => {
    const refreshedUser = refreshUserData(user, users);
    if (refreshedUser) {
      setUser(refreshedUser);
    }
  };

  const handleUpdateUserBalance = async (userId: string, amount: number): Promise<void> => {
    setIsLoading(true);
    try {
      const updatedUsers = updateUserBalance(users, userId, amount);
      setUsers(updatedUsers);
      
      // Update current user if it's them
      if (user && user.id === userId) {
        const updatedUser = { ...user, balance: Math.max(0, user.balance + amount) };
        setUser(updatedUser);
        localStorage.setItem("investmentUser", JSON.stringify(updatedUser));
        updateSessionExpiry();
      }
      
      return;
    } catch (error: any) {
      toast.error(error.message || "Failed to update balance");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReferralCommission = async (referrerId: string, amount: number, userId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const updatedUsers = await addReferralCommission(users, referrerId, amount, userId);
      setUsers(updatedUsers);
      
      // Update current user if it's the referrer
      if (user && user.id === referrerId) {
        const updatedUser = updatedUsers.find(u => u.id === referrerId);
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem("investmentUser", JSON.stringify(updatedUser));
          updateSessionExpiry();
        }
      }
      
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
      
      const foundUser = findUserByEmail(users, email);
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }
      
      // Special case for the new admin account
      if (email.toLowerCase() === "gurutech@gmail.com" && password !== "Guru2030") {
        throw new Error("Invalid password");
      }
      
      // In a real app, you'd verify the password here
      
      setUser(foundUser);
      localStorage.setItem("investmentUser", JSON.stringify(foundUser));
      updateSessionExpiry();
      toast.success("Login successful");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, referralCode?: string) => {
    if (isSubmitting) {
      return; // Prevent duplicate submissions
    }
    
    setIsLoading(true);
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("User already exists");
      }
      
      const newUser = createNewUser(name, email, "user", referralCode);
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setUser(newUser);
      localStorage.setItem("investmentUser", JSON.stringify(newUser));
      localStorage.setItem("investmentUsers", JSON.stringify(updatedUsers));
      updateSessionExpiry();
      
      toast.success("Registration successful");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("investmentUser");
    localStorage.removeItem("sessionExpiry");
    toast.success("Logged out successfully");
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const foundUser = findUserByEmail(users, email);
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
      updateUserBalance: handleUpdateUserBalance,
      addReferralCommission: handleAddReferralCommission,
      users,
      refreshUserSession
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
