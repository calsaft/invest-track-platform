
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useInvestments } from "@/contexts/InvestmentContext";

interface Plan {
  id: string;
  name: string;
  amount: number;
  duration: number;
  returnRate: number;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "plan1",
    name: "Starter",
    amount: 50,
    duration: 20,
    returnRate: 2.0,
  },
  {
    id: "plan2",
    name: "Standard",
    amount: 100,
    duration: 30,
    returnRate: 2.0,
    popular: true,
  },
  {
    id: "plan3",
    name: "Premium",
    amount: 250,
    duration: 30,
    returnRate: 2.0,
  },
  {
    id: "plan4",
    name: "Professional",
    amount: 500,
    duration: 30,
    returnRate: 2.0,
  },
  {
    id: "plan5",
    name: "Executive",
    amount: 1000,
    duration: 15,
    returnRate: 2.0,
  },
  {
    id: "plan6",
    name: "Smart",
    amount: 200,
    duration: 15,
    returnRate: 2.0,
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createInvestment } = useInvestments();

  const handleSelectPlan = async (plan: Plan) => {
    try {
      if (!user) {
        toast.error("You must be logged in to invest");
        navigate("/login");
        return;
      }
      
      if (user.balance < plan.amount) {
        toast.error("Insufficient balance. Please deposit funds first.");
        navigate("/deposit");
        return;
      }
      
      await createInvestment(plan.id, plan.amount, plan.duration);
      toast.success("Investment successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Investment failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-6">Investment Plans</h1>
      <p className="text-lg mb-8 text-muted-foreground">
        Choose an investment plan that suits your goals. All plans generate double your investment over the specified period.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name} Plan</CardTitle>
              <CardDescription>
                {plan.duration} days investment period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="text-3xl font-bold">${plan.amount}</span>
                <span className="text-muted-foreground ml-1">minimum</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2" />
                  <span>Returns ${plan.amount * plan.returnRate} in {plan.duration} days</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2" />
                  <span>Daily profit updates</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2" />
                  <span>24/7 Support</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSelectPlan(plan)} 
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                Invest Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 p-6 border rounded-lg bg-muted/30">
        <h3 className="text-xl font-bold mb-3">Important Information</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Once invested, funds cannot be withdrawn until the investment period is complete.</li>
          <li>Your dashboard will show daily growth of your investments.</li>
          <li>Refer friends to earn 20% commission on their investments.</li>
          <li>All returns are automatically added to your account balance at the end of the investment period.</li>
        </ul>
      </div>
    </div>
  );
}
