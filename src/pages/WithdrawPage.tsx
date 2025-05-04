
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/contexts/TransactionContext";
import { useAuth } from "@/contexts/AuthContext";

const withdrawSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  currency: z.enum(["TRC20", "BEP20"]),
  wallet: z.string().min(10, "Please enter a valid wallet address"),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export default function WithdrawPage() {
  const { user } = useAuth();
  const { createWithdrawal } = useTransactions();
  
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      currency: "TRC20",
      wallet: "",
    },
  });

  const onSubmit = async (values: WithdrawFormValues) => {
    try {
      if (!user || Number(values.amount) > user.balance) {
        form.setError("amount", { 
          type: "manual", 
          message: "Withdrawal amount exceeds your available balance" 
        });
        return;
      }
      
      await createWithdrawal(
        Number(values.amount),
        values.wallet,
        values.currency
      );
      
      form.reset();
    } catch (error) {
      console.error("Withdrawal error:", error);
      // Error is handled in TransactionContext
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-6">Withdraw Funds</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request a Withdrawal</CardTitle>
            <CardDescription>
              Enter the amount and destination wallet for your withdrawal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="p-4 bg-muted rounded-md mb-4">
                  <div className="font-medium">Available Balance</div>
                  <div className="text-2xl font-bold mt-2">${user?.balance.toFixed(2) || '0.00'}</div>
                </div>
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <Input className="pl-8" placeholder="0.00" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Withdrawal Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a withdrawal method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRC20">TRC20 (USDT)</SelectItem>
                          <SelectItem value="BEP20">BEP20 (USDT)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wallet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your wallet address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Submit Withdrawal Request"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Information</CardTitle>
            <CardDescription>
              Important details about the withdrawal process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="font-medium">Processing Time</div>
              <div className="text-sm text-muted-foreground">
                Withdrawal requests are typically processed within 24 hours during business days. Once approved, the transfer may take additional time to reach your wallet depending on network congestion.
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Withdrawal Fees</div>
              <div className="text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1">
                  <li>TRC20: 1 USDT</li>
                  <li>BEP20: 2 USDT</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Minimum Withdrawal</div>
              <div className="text-sm text-muted-foreground">
                The minimum withdrawal amount is $10 for all payment methods.
              </div>
            </div>
            
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-md">
              <div className="font-medium text-warning">Important Notice</div>
              <div className="text-sm mt-1">
                Always double-check your wallet address before submitting a withdrawal request. We cannot recover funds sent to incorrect addresses.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
