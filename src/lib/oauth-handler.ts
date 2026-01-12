import { SupabaseClient } from "@supabase/supabase-js";

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  type: "signup" | "recovery" | "invite" | "magiclink";
}

/**
 * Parse OAuth tokens from URL fragment (hash)
 * Handles both browser URLs and deep link URLs
 */
export function parseOAuthTokensFromUrl(url: string): OAuthTokens | null {
  try {
    // Extract the fragment (everything after #)
    const fragment = url.includes("#") ? url.split("#")[1] : "";

    if (!fragment) {
      console.log("[OAuth] No fragment found in URL");
      return null;
    }

    // Parse the fragment as query string
    const params = new URLSearchParams(fragment);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");
    const tokenType = params.get("token_type");
    const type = (params.get("type") || "signup") as
      | "signup"
      | "recovery"
      | "invite"
      | "magiclink";

    if (!accessToken) {
      console.warn("[OAuth] No access token found in URL fragment");
      return null;
    }

    console.log("[OAuth] Tokens parsed successfully:", {
      accessToken: accessToken.slice(0, 10) + "...",
      refreshToken: refreshToken ? refreshToken.slice(0, 10) + "..." : null,
      expiresIn,
      tokenType,
      type,
    });

    return {
      accessToken,
      refreshToken: refreshToken || "",
      expiresIn: expiresIn ? parseInt(expiresIn, 10) : 3600,
      tokenType: tokenType || "bearer",
      type,
    };
  } catch (error) {
    console.error("[OAuth] Error parsing tokens from URL:", error);
    return null;
  }
}

/**
 * Establish session from OAuth tokens
 * Replaces the normal Supabase session detection flow for deep links
 */
export async function establishSessionFromOAuthUrl(
  supabase: SupabaseClient,
  url: string
): Promise<boolean> {
  try {
    const tokens = parseOAuthTokensFromUrl(url);

    if (!tokens) {
      return false;
    }

    console.log("[OAuth] Establishing session with tokens...");

    // Set the session directly with the tokens
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });

    if (error) {
      console.error("[OAuth] Error setting session:", error);
      return false;
    }

    if (data?.session) {
      console.log("[OAuth] Session established successfully:", {
        user: data.session.user?.email,
        expiresAt: data.session.expires_at,
      });
      return true;
    } else {
      console.warn("[OAuth] Session was set but no session returned");
      return false;
    }
  } catch (error) {
    console.error("[OAuth] Exception establishing session:", error);
    return false;
  }
}
