import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type SocialAuthButtonsProps = {
  returnTo?: string | null;
  instructorFlow?: boolean;
};

function buildOAuthHref(
  provider: "google" | "apple",
  options: SocialAuthButtonsProps,
): string {
  const params = new URLSearchParams();
  if (options.returnTo) params.set("returnTo", options.returnTo);
  if (options.instructorFlow) params.set("instructor", "1");
  const query = params.toString();
  const base = provider === "google" ? "/api/auth/google" : "/api/auth/apple";
  return query ? `${base}?${query}` : base;
}

export default function SocialAuthButtons({ returnTo, instructorFlow }: SocialAuthButtonsProps) {
  const { data: status } = useQuery({
    queryKey: ["/api/auth/oauth/status"],
    queryFn: async () => {
      const r = await fetch("/api/auth/oauth/status");
      if (!r.ok) return { google: false, apple: false };
      return r.json() as Promise<{ google: boolean; apple: boolean }>;
    },
    staleTime: 60_000,
  });

  if (!status?.google && !status?.apple) {
    return null;
  }

  return (
    <div className="space-y-3">
      {status.google ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300"
          onClick={() => {
            window.location.href = buildOAuthHref("google", { returnTo, instructorFlow });
          }}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium">Continue with Google</span>
        </Button>
      ) : null}

      {status.apple ? (
        <Button
          type="button"
          className="w-full h-12 bg-black hover:bg-gray-900 text-white"
          onClick={() => {
            window.location.href = buildOAuthHref("apple", { returnTo, instructorFlow });
          }}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.05 20.28c-.98.95-2.05 1.88-3.51 1.88-1.34 0-1.75-.79-3.26-.79-1.53 0-2 .77-3.24.82-1.31.05-2.3-1.18-3.18-2.13C2.79 17.07 1.22 12.39 3.58 9.26c1.17-1.52 2.8-2.48 4.62-2.51 1.44-.03 2.8.95 3.68.95.87 0 2.52-1.17 4.25-1 .73.03 2.78.29 4.09 2.21-.1.06-2.44 1.42-2.41 4.23.03 3.35 2.94 4.48 2.97 4.5-.03.07-.47 1.6-1.43 3.15zM13.02 3.5c.77-.94 1.29-2.24 1.15-3.5-1.11.05-2.45.74-3.25 1.67-.71.82-1.33 2.14-1.16 3.39 1.23.09 2.49-.63 3.26-1.56z" />
          </svg>
          <span className="font-medium">Continue with Apple</span>
        </Button>
      ) : null}
    </div>
  );
}
