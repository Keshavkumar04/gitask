"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Info } from "lucide-react";
import { createCheckoutSession } from "@/lib/stripe";
import { useState } from "react";

const BillingPage = () => {
  const trpc = useTRPC();
  const { data: credits, isLoading } = useQuery(
    trpc.project.getMyCredits.queryOptions(),
  );
  const { data: transactions, isLoading: transactionsLoading } = useQuery(
    trpc.project.getTransactions.queryOptions(),
  );
  const [creditsToBuy, setCreditsToBuy] = useState(100);
  const [loading, setLoading] = useState(false);

  const price = (creditsToBuy / 50).toFixed(2);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await createCheckoutSession(creditsToBuy);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-base font-bold text-gray-900 mb-1">Billing</h1>
      <p className="text-xs text-gray-500 mb-6">
        Manage your credits and purchase more to keep asking questions.
      </p>

      <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-8 rounded-full bg-green-50">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="text-base font-bold text-gray-900">
              {isLoading ? "..." : (credits?.credits ?? 0)}
              <span className="text-xs font-normal text-gray-500 ml-1">
                credits
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          Purchase Credits
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Info className="h-3 w-3 shrink-0" />
          <p>Each credit allows you to index 1 file in a repository</p>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">{creditsToBuy} credits</span>
          <span className="text-sm font-semibold text-primary">${price}</span>
        </div>

        <Slider
          min={50}
          max={1250}
          step={10}
          value={[creditsToBuy]}
          onValueChange={(value) => setCreditsToBuy(value[0]!)}
          className="mb-4"
        />

        <Button
          className="w-full text-xs"
          size="sm"
          disabled={loading}
          onClick={handleCheckout}
        >
          {loading
            ? "Redirecting..."
            : `Buy ${creditsToBuy} credits for $${price}`}
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Transaction History
        </h2>
        {transactionsLoading ? (
          <p className="text-xs text-gray-400">Loading...</p>
        ) : !transactions?.length ? (
          <p className="text-xs text-gray-400">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 py-2 border-b last:border-b-0"
              >
                <div className="flex items-center justify-center size-7 rounded-full bg-green-50 shrink-0">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">
                    +{t.credits} credits
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-xs font-semibold text-green-600">
                  +${(t.credits / 50).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
