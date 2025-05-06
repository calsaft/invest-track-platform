
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

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

// Initialize with admin users
const initialAdmins: User[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    balance: 10000,
    createdAt: new Date().toISOString(),
    referrals: [],
    referralBonus: 0,
  },
  {
    id: "admin-2",
    name: "Gurutech",
    email: "Gurutech@gmail.com",
    role: "admin",
    balance: 10000,
    createdAt: new Date().toISOString(),
    referrals: [],
    referralBonus: 0,
  },
  {
    id: "admin-3",
    name: "Caltech",
    email: "caltech@gmail.com",
    role: "admin",
    balance: 10000,
    createdAt: new Date().toISOString(),
    referrals: [],
    referralBonus: 0,
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  // Set up auth state listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSupabaseUser(session?.user || null);
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user);
        }
      }
    );

    // Initial session check
    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check current session on load
  const checkSession = async () => {
    try {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchUserProfile(session.user);
      }
      
      // Load all users
      fetchAllUsers();
      
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile from Supabase
  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      // Check if user exists in profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" error
        throw error;
      }
      
      // Special case for admin emails
      if (
        authUser.email === 'admin@example.com' || 
        authUser.email?.toLowerCase() === 'gurutech@gmail.com' ||
        authUser.email?.toLowerCase() === 'caltech@gmail.com'
      ) {
        // Find the matching admin in our initial admins
        const adminUser = initialAdmins.find(
          admin => admin.email.toLowerCase() === authUser.email?.toLowerCase()
        );
        
        if (adminUser) {
          // If admin exists in profiles, use that data with admin role
          if (profile) {
            const updatedUser: User = {
              id: authUser.id,
              name: profile.name || adminUser.name,
              email: authUser.email || profile.email,
              role: "admin",
              balance: Number(profile.balance) || adminUser.balance,
              createdAt: profile.created_at || adminUser.createdAt,
              referralBonus: profile.referral_bonus || 0,
              referredBy: profile.referred_by
            };
            setUser(updatedUser);
            
            // Update the profile with admin role if needed
            if (profile.role !== 'admin') {
              await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', authUser.id);
            }
            return;
          }
          
          // If admin doesn't exist in profiles, create entry
          const newUser = { ...adminUser, id: authUser.id };
          setUser(newUser);
          
          // Create profile for admin
          await supabase.from('profiles').insert({
            id: authUser.id,
            name: adminUser.name,
            email: authUser.email,
            balance: adminUser.balance,
            role: 'admin',
            referral_bonus: 0,
            referral_code: Math.random().toString(36).substring(2, 10)
          });
          return;
        }
      }
      
      // Regular user profile handling
      if (profile) {
        const userProfile: User = {
          id: profile.id,
          name: profile.name || '',
          email: authUser.email || profile.email || '',
          role: profile.role === 'admin' ? "admin" : "user",
          balance: Number(profile.balance) || 0,
          createdAt: profile.created_at,
          referralBonus: Number(profile.referral_bonus) || 0,
          referredBy: profile.referred_by
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Error loading user profile');
    }
  };

  // Fetch all users from the database
  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const mappedUsers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
          role: profile.role === 'admin' ? "admin" : "user",
          balance: Number(profile.balance) || 0,
          createdAt: profile.created_at,
          referralBonus: Number(profile.referral_bonus) || 0,
          referredBy: profile.referred_by
        }));
        
        // Make sure the admins are always included
        const adminEmails = ['admin@example.com', 'gurutech@gmail.com', 'caltech@gmail.com'];
        const existingAdminEmails = mappedUsers
          .filter(u => u.role === 'admin')
          .map(u => u.email.toLowerCase());
          
        // Add any missing admins
        const missingAdmins = initialAdmins.filter(
          admin => !existingAdminEmails.includes(admin.email.toLowerCase())
        );
        
        setUsers([...mappedUsers, ...missingAdmins]);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const updateUserBalance = async (userId: string, amount: number): Promise<void> => {
    setIsLoading(true);
    try {
      // Get current balance
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      const currentBalance = Number(data?.balance || 0);
      const newBalance = Math.max(0, currentBalance + amount);
      
      // Update balance in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state if it's the current user
      if (user && user.id === userId) {
        setUser(prevUser => 
          prevUser ? { ...prevUser, balance: newBalance } : null
        );
      }
      
      // Update users list
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, balance: newBalance } : u
      ));
      
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
      // Find the referrer in the database
      const { data: referrer, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', referrerId)
        .single();
        
      if (error) {
        throw new Error("Referrer not found");
      }
      
      // Find the new user
      const { data: newUser, error: newUserError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (newUserError) {
        throw new Error("User not found");
      }
      
      // Calculate commission (20% of deposit)
      const commission = amount * 0.2;
      
      // Update referrer's bonus and balance
      const currentBonus = Number(referrer.referral_bonus || 0);
      const currentBalance = Number(referrer.balance || 0);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          referral_bonus: currentBonus + commission,
          balance: currentBalance + commission
        })
        .eq('id', referrerId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state if it's the current user
      if (user && user.id === referrerId) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            balance: prevUser.balance + commission,
            referralBonus: (prevUser.referralBonus || 0) + commission
          };
        });
      }
      
      // Update users list
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === referrerId) {
          return {
            ...u,
            balance: u.balance + commission,
            referralBonus: (u.referralBonus || 0) + commission
          };
        }
        return u;
      }));
      
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
      // Special case for the admin account
      if (email.toLowerCase() === "gurutech@gmail.com" && password !== "Guru2030") {
        throw new Error("Invalid password");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
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
      // Check if referral code exists
      let referrerId: string | undefined;
      
      if (referralCode) {
        const { data: referrerData, error: referrerError } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode)
          .single();
          
        if (!referrerError && referrerData) {
          referrerId = referrerData.id;
        }
      }
      
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Registration failed");
      }
      
      // The trigger will create a profile, but we need to update it with referral info if any
      if (referrerId) {
        await supabase
          .from('profiles')
          .update({ referred_by: referrerId })
          .eq('id', data.user.id);
      }
      
      toast.success("Registration successful");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
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
