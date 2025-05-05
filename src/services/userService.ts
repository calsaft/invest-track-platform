
import { User } from "../types/auth";
import { toast } from "sonner";
import { updateSessionExpiry } from "../utils/sessionUtils";

export const updateUserBalance = (
  users: User[],
  userId: string,
  amount: number
): User[] => {
  const updatedUsers = users.map(u => 
    u.id === userId 
      ? { ...u, balance: Math.max(0, u.balance + amount) }
      : u
  );
  
  return updatedUsers;
};

export const findUserById = (users: User[], userId: string): User | undefined => {
  return users.find(u => u.id === userId);
};

export const findUserByEmail = (users: User[], email: string): User | undefined => {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const createNewUser = (
  name: string,
  email: string,
  role: "user" | "admin" = "user",
  referredBy?: string
): User => {
  const userId = `user-${Date.now()}`;
  
  return {
    id: userId,
    name,
    email,
    role,
    balance: 0,
    createdAt: new Date().toISOString(),
    referrals: [],
    referralBonus: 0,
    referredBy,
  };
};

export const refreshUserData = (
  currentUser: User | null,
  users: User[]
): User | null => {
  if (!currentUser) return null;
  
  const refreshedUser = users.find(u => u.id === currentUser.id);
  if (refreshedUser) {
    localStorage.setItem("investmentUser", JSON.stringify(refreshedUser));
    updateSessionExpiry();
    return refreshedUser;
  }
  
  return currentUser;
};
