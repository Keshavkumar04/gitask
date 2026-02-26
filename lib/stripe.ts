"use server";

import Stripe from "stripe";
import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function createCheckoutSession(credits: number) {
  const userSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!userSession) {
    throw new Error("Unauthorized");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${credits} GitAsk Credits`,
          },
          unit_amount: Math.round((credits / 50) * 100), // $1 per 50 credits
        },
        quantity: 1,
      },
    ],
    customer_creation: "always",
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/create?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing?cancelled=true`,
    client_reference_id: userSession.user.id,
    metadata: {
      credits: credits,
    },
  });

  redirect(session.url!);
}