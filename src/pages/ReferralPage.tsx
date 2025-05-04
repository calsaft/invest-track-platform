
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Users } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export default function ReferralPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const baseUrl = window.location.origin;
  const referralLink = user ? `${baseUrl}/register?ref=${user.id}` : "";
  
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send an email invitation
    toast.success(`Invitation sent to ${email}`);
    setEmail("");
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-6">Referral Program</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Share & Earn</CardTitle>
              <CardDescription>
                Invite friends and earn 20% commission on their investments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium mb-2">Your Referral Link</div>
                <div className="flex items-center gap-2">
                  <Input 
                    value={referralLink}
                    readOnly
                    className="flex-1"
                  />
                  <CopyButton value={referralLink} />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Invite by Email</h3>
                <form onSubmit={handleInvite} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit">Invite</Button>
                </form>
              </div>
              
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
                <div className="font-medium text-primary mb-2">How it works</div>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Share your unique referral link with friends</li>
                  <li>When they register and make a successful deposit, you earn a 20% commission</li>
                  <li>Your commission is automatically added to your account balance</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Referral Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-muted-foreground text-sm">Total Referrals</div>
                <div className="text-2xl font-bold">{user?.referrals?.length || 0}</div>
              </div>
              
              <div>
                <div className="text-muted-foreground text-sm">Commissions Earned</div>
                <div className="text-2xl font-bold">${user?.referralBonus || 0}</div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Recent Referrals</h4>
                {user?.referrals && user.referrals.length > 0 ? (
                  <div className="space-y-2">
                    {user.referrals.map((referral) => (
                      <div key={referral.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                        <div>{referral.name || referral.id}</div>
                        <div>${referral.commission || 0}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    No referrals yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
