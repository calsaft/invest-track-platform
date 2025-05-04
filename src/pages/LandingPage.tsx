
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, RefreshCw } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Invest</span> and <span className="text-primary">Track</span> your wealth
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-muted-foreground">
              A secure and transparent investment platform to grow your assets with real-time tracking and complete control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose InvestTrack</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="dashboard-card flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
                <p className="text-muted-foreground">
                  Your investments are protected with state-of-the-art security measures and transparent processes.
                </p>
              </div>
              
              <div className="dashboard-card flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Performance</h3>
                <p className="text-muted-foreground">
                  Monitor your investment growth in real-time with detailed analytics and insights.
                </p>
              </div>
              
              <div className="dashboard-card flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <RefreshCw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Transactions</h3>
                <p className="text-muted-foreground">
                  Deposit and withdraw funds effortlessly with multiple payment options and quick processing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Investing?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
              Join thousands of investors who trust InvestTrack with their financial future.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-8">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-4">InvestTrack</h3>
            <p className="text-muted-foreground mb-6">
              The secure way to invest and grow your wealth
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Login
              </Link>
              <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground">
                Register
              </Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </a>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} InvestTrack. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
