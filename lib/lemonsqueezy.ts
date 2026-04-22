import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

let lemonSqueezyInitialized = false;

export function initializeLemonSqueezyCompatibility(): void {
  if (lemonSqueezyInitialized) {
    return;
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    return;
  }

  lemonSqueezySetup({
    apiKey,
    onError: (error) => {
      console.error("Lemon Squeezy compatibility init failed", error.message);
    }
  });

  lemonSqueezyInitialized = true;
}

export function getHostedCheckoutLink(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";
}

export function hasCheckoutConfigured(): boolean {
  return Boolean(getHostedCheckoutLink());
}
