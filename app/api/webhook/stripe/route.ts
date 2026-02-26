import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const credits = Number(session.metadata?.["credits"]);

    if (!userId || !credits) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    await prisma.stripeTransaction.create({ data: { userId, credits } });

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: credits,
        },
      },
    });
    return NextResponse.json(
      { message: "Credits added Successfully" },
      { status: 200 },
    );
  }

  return NextResponse.json({ received: true });
}
