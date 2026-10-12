import { useEffect } from "react";

const REWARDS_URL = "https://www.shabushack.com/rewards";

/**
 * This app has been retired — the rewards program now lives at
 * shabushack.com/rewards. Every route renders this screen and the
 * browser is immediately redirected there (window.location.replace,
 * so the old URL never lands in history).
 */
const RetiredRedirect = () => {
  useEffect(() => {
    window.location.replace(REWARDS_URL);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="text-center max-w-sm">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-wide mb-3 leading-tight">
          Shabu Perks Club is now Shabu Shack Rewards
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Redirecting you to our new home…
        </p>
        <a
          href={REWARDS_URL}
          className="inline-flex items-center justify-center px-6 h-12 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Go to Shabu Shack Rewards
        </a>
      </div>
    </div>
  );
};

export default RetiredRedirect;
