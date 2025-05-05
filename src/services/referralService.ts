
import { User, Referral } from "../types/auth";
import { toast } from "sonner";

export const addReferralCommission = async (
  users: User[],
  referrerId: string,
  amount: number,
  userId: string
): Promise<User[]> => {
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
    
    toast.success(`Referral commission of $${commission} added`);
    
    return updatedUsers;
  } catch (error: any) {
    toast.error(error.message || "Failed to add referral commission");
    throw error;
  }
};

// Add a helper function to validate referral codes
export const validateReferralCode = (users: User[], referralCode: string): boolean => {
  return users.some(user => user.id === referralCode);
};
