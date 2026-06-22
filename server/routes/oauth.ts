import type { Express, Request, Response } from "express";
import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, type Profile } from "passport-google-oauth20";
import appleSignin from "apple-signin-auth";
import {
  decodeOAuthState,
  encodeOAuthState,
  findOrCreateOAuthUser,
  getAppleOAuthConfig,
  getGoogleOAuthConfig,
  getOAuthProviderStatus,
  issueOAuthSession,
  oauthFailureRedirect,
} from "../services/oauthLogin";

function configureGoogleStrategy() {
  const config = getGoogleOAuthConfig();
  if (!config) return false;

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackUrl,
        passReqToCallback: true,
      },
      async (
        _req: Request,
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done,
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google account did not provide an email address"));
          }

          const user = await findOrCreateOAuthUser(
            {
              email,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
            },
            "google",
          );

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );

  return true;
}

const googleReady = configureGoogleStrategy();

export function registerOAuthRoutes(app: Express) {
  const router = Router();

  router.get("/api/auth/oauth/status", (_req, res) => {
    res.json(getOAuthProviderStatus());
  });

  router.get("/api/auth/google", (req: Request, res: Response, next) => {
    if (!googleReady) {
      return res.status(503).json({
        message: "Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      });
    }

    const returnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : undefined;
    const instructor = req.query.instructor === "1" || req.query.instructor === "true";

    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state: encodeOAuthState({ returnTo, instructor }),
    })(req, res, next);
  });

  router.get(
    "/api/auth/google/callback",
    (req: Request, res: Response, next) => {
      if (!googleReady) {
        return res.redirect(oauthFailureRedirect("Google sign-in is not configured"));
      }

      passport.authenticate("google", { session: false }, async (err: Error | null, user: any) => {
        const state = decodeOAuthState(typeof req.query.state === "string" ? req.query.state : undefined);

        if (err || !user) {
          return res.redirect(
            oauthFailureRedirect(err?.message || "Google sign-in failed", state.instructor),
          );
        }

        try {
          const redirectUrl = await issueOAuthSession(res, user, {
            returnTo: state.returnTo,
            instructor: state.instructor,
          });
          return res.redirect(redirectUrl);
        } catch (error) {
          console.error("Google OAuth session error:", error);
          return res.redirect(
            oauthFailureRedirect("Could not complete Google sign-in", state.instructor),
          );
        }
      })(req, res, next);
    },
  );

  router.get("/api/auth/apple", (req: Request, res: Response) => {
    const config = getAppleOAuthConfig();
    if (!config) {
      return res.status(503).json({
        message:
          "Apple sign-in is not configured. See APPLE-SIGN-IN-SETUP.md for Apple Developer setup.",
      });
    }

    const returnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : undefined;
    const instructor = req.query.instructor === "1" || req.query.instructor === "true";
    const state = encodeOAuthState({ returnTo, instructor });

    const url = appleSignin.getAuthorizationUrl({
      clientID: config.clientId,
      redirectUri: config.callbackUrl,
      scope: "name email",
      state,
      responseMode: "form_post",
    });

    return res.redirect(url);
  });

  router.post("/api/auth/apple/callback", async (req: Request, res: Response) => {
    const config = getAppleOAuthConfig();
    const state = decodeOAuthState(typeof req.body?.state === "string" ? req.body.state : undefined);

    if (!config) {
      return res.redirect(oauthFailureRedirect("Apple sign-in is not configured", state.instructor));
    }

    try {
      const code = typeof req.body?.code === "string" ? req.body.code : "";
      if (!code) {
        throw new Error("Apple did not return an authorization code");
      }

      const clientSecret = appleSignin.getClientSecret({
        clientID: config.clientId,
        teamID: config.teamId,
        privateKey: config.privateKey,
        keyIdentifier: config.keyId,
      });

      const tokenResponse = await appleSignin.getAuthorizationToken(code, {
        clientID: config.clientId,
        redirectUri: config.callbackUrl,
        clientSecret,
      });

      const idToken = tokenResponse.id_token;
      if (!idToken) {
        throw new Error("Apple did not return an ID token");
      }

      const claims = await appleSignin.verifyIdToken(idToken, {
        audience: config.clientId,
        ignoreExpiration: false,
      });

      const email = claims.email;
      if (!email) {
        throw new Error("Apple account did not provide an email address");
      }

      let firstName: string | undefined;
      let lastName: string | undefined;
      if (typeof req.body?.user === "string" && req.body.user.trim()) {
        try {
          const parsed = JSON.parse(req.body.user) as {
            name?: { firstName?: string; lastName?: string };
          };
          firstName = parsed.name?.firstName;
          lastName = parsed.name?.lastName;
        } catch {
          // Apple only sends name on first authorization
        }
      }

      const user = await findOrCreateOAuthUser(
        { email, firstName, lastName },
        "apple",
      );

      const redirectUrl = await issueOAuthSession(res, user, {
        returnTo: state.returnTo,
        instructor: state.instructor,
      });

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("Apple OAuth callback error:", error);
      return res.redirect(
        oauthFailureRedirect(
          (error as Error)?.message || "Apple sign-in failed",
          state.instructor,
        ),
      );
    }
  });

  app.use(router);
}
