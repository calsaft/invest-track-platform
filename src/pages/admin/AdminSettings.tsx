
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAdmin } from "@/contexts/AdminContext";

const walletSettingsSchema = z.object({
  TRC20: z.string().min(10, { message: "Please enter a valid TRC20 address" }),
  BEP20: z.string().min(10, { message: "Please enter a valid BEP20 address" }),
});

type WalletSettingsFormValues = z.infer<typeof walletSettingsSchema>;

export default function AdminSettings() {
  const { walletAddresses, updateWalletAddresses, isLoading } = useAdmin();
  
  const form = useForm<WalletSettingsFormValues>({
    resolver: zodResolver(walletSettingsSchema),
    defaultValues: {
      TRC20: walletAddresses.TRC20,
      BEP20: walletAddresses.BEP20,
    },
  });

  const onSubmit = async (values: WalletSettingsFormValues) => {
    try {
      await updateWalletAddresses(values);
    } catch (error) {
      console.error("Error updating wallet addresses:", error);
      // Error is handled in AdminContext
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-6">Platform Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Gateway Settings</CardTitle>
            <CardDescription>
              Configure the wallet addresses where users will send deposits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="TRC20"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TRC20 Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="TRC20 address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="BEP20"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BEP20 Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="BEP20 address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
            <CardDescription>
              General information about the investment platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium">Platform Version</div>
              <div className="text-sm text-muted-foreground">1.0.0</div>
            </div>
            
            <div>
              <div className="font-medium">Last Updated</div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-md">
              <div className="font-medium text-primary">Support Information</div>
              <div className="text-sm mt-1">
                For technical support, please contact:<br />
                <a href="mailto:support@investtrack.com" className="text-primary underline">
                  support@investtrack.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
