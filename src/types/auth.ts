
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
