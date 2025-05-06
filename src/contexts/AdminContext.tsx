
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth, User } from "./AuthContext";

type WalletAddresses = {
  TRC20: string;
  BEP20: string;
};

type AdminContextType = {
  users: User[];
  walletAddresses: WalletAddresses;
  isLoading: boolean;
  createUser: (name: string, email: string, password: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateWalletAddresses: (addresses: WalletAddresses) => Promise<void>;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, users: authUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [walletAddresses, setWalletAddresses] = useState<WalletAddresses>({
    TRC20: "TRC20DefaultAddress123456789",
    BEP20: "BEP20DefaultAddress123456789",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync users from AuthContext
  useEffect(() => {
    if (authUsers && authUsers.length > 0) {
      setUsers(authUsers);
    }
  }, [authUsers]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAddresses = localStorage.getItem("walletAddresses");
    
    if (savedAddresses) {
      setWalletAddresses(JSON.parse(savedAddresses));
    }
  }, []);

  // Save wallet addresses to localStorage on change
  useEffect(() => {
    localStorage.setItem("walletAddresses", JSON.stringify(walletAddresses));
  }, [walletAddresses]);

  const createUser = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        throw new Error("User already exists");
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: String(users.length + 1),
        name,
        email,
        role: "user",
        balance: 0,
        createdAt: new Date().toISOString(),
      };
      
      setUsers([...users, newUser]);
      toast.success("User created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      
      // Prevent deleting admin users or self
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete || userToDelete.role === "admin" || userToDelete.id === user.id) {
        throw new Error("Cannot delete this user");
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setUsers(users.filter(u => u.id !== userId));
      toast.success("User deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWalletAddresses = async (addresses: WalletAddresses) => {
    setIsLoading(true);
    try {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setWalletAddresses(addresses);
      toast.success("Wallet addresses updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update wallet addresses");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContext.Provider 
      value={{ 
        users, 
        walletAddresses, 
        isLoading, 
        createUser, 
        deleteUser, 
        updateWalletAddresses 
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
