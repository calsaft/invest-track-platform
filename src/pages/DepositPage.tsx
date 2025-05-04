
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/contexts/TransactionContext";
import { useAdmin } from "@/contexts/AdminContext";
import CopyButton from "@/components/CopyButton";
import { Upload, Image } from "lucide-react";
import { toast } from "sonner";

const depositSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  currency: z.enum(["TRC20", "BEP20"]),
  screenshot: z.any().optional(),
});

type DepositFormValues = z.infer<typeof depositSchema>;

export default function DepositPage() {
  const { createDeposit } = useTransactions();
  const { walletAddresses } = useAdmin();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
      currency: "TRC20",
      screenshot: null,
    },
  });

  const selectedCurrency = form.watch("currency");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }
      
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG and PNG files are allowed.");
        return;
      }
      
      setScreenshot(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (values: DepositFormValues) => {
    const walletAddress = values.currency === "TRC20" 
      ? walletAddresses.TRC20 
      : walletAddresses.BEP20;

    try {
      await createDeposit(
        Number(values.amount),
        walletAddress,
        values.currency,
        screenshot
      );
      form.reset();
      setScreenshot(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Deposit error:", error);
      // Error is handled in TransactionContext
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-6">Deposit Funds</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Make a Deposit</CardTitle>
            <CardDescription>
              Enter the amount you want to deposit and select a payment method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <FormLabel>Payment Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a payment method" />
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

                <div className="space-y-2">
                  <FormLabel>Upload Payment Proof</FormLabel>
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center">
                    <label htmlFor="screenshot-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {previewUrl ? (
                          <div className="relative w-full">
                            <img 
                              src={previewUrl} 
                              alt="Payment proof" 
                              className="max-h-48 mx-auto rounded-md" 
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setScreenshot(null);
                                setPreviewUrl(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium text-primary">Click to upload</span> or drag and drop
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PNG or JPG (max 5MB)
                            </div>
                          </>
                        )}
                      </div>
                    </label>
                    <input
                      id="screenshot-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Submit Deposit Request"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
            <CardDescription>
              Follow these steps to complete your {selectedCurrency} deposit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="font-medium">Step 1: Copy Address</div>
              <div className="p-4 bg-muted rounded-md flex items-center justify-between">
                <div className="font-mono text-sm break-all">
                  {selectedCurrency === "TRC20" ? walletAddresses.TRC20 : walletAddresses.BEP20}
                </div>
                <CopyButton 
                  text={selectedCurrency === "TRC20" ? walletAddresses.TRC20 : walletAddresses.BEP20} 
                  className="ml-2" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Step 2: Send Payment</div>
              <div className="text-sm text-muted-foreground">
                Send the exact amount from your wallet to the address above. Make sure you're using the correct {selectedCurrency} network.
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Step 3: Take Screenshot</div>
              <div className="text-sm text-muted-foreground">
                Take a screenshot of your successful transaction and upload it as proof of payment.
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Step 4: Wait for Confirmation</div>
              <div className="text-sm text-muted-foreground">
                Your deposit will be credited to your account once it's confirmed on the blockchain and approved by our team. This process typically takes 10-30 minutes.
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4 flex flex-col items-start">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Important:</span> Make sure to copy the exact address above. Sending to an incorrect address may result in permanent loss of funds.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
