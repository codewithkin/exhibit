import { expo } from '@better-auth/expo';
import prisma from "@exhibit/db";
import { env } from "@exhibit/env/server";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import nodemailer from "nodemailer";

import { polarClient } from "./lib/payments";

// Create nodemailer transporter
const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
    })
  : null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN, "mybettertapp://", "exp://", "exhibit://"],
  emailAndPassword: {
    enabled: true,
  },
  // Google OAuth
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    // Magic link authentication
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!transporter) {
          console.log("Magic link for", email, ":", url);
          console.warn("SMTP not configured. Magic link logged to console.");
          return;
        }

        await transporter.sendMail({
          from: env.SMTP_FROM || "noreply@exhibit.art",
          to: email,
          subject: "Sign in to Exhibit",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #ffffff; margin: 0; padding: 40px 20px;">
                <div style="max-width: 480px; margin: 0 auto;">
                  <h1 style="font-family: 'Crimson Pro', Georgia, serif; font-size: 32px; font-weight: 400; color: #0a0a0a; margin: 0 0 24px 0;">
                    Exhibit
                  </h1>
                  <p style="font-size: 16px; color: #0a0a0a; line-height: 1.6; margin: 0 0 24px 0;">
                    Click the link below to sign in to your account. This link will expire in 5 minutes.
                  </p>
                  <a href="${url}" style="display: inline-block; background-color: #0a0a0a; color: #fafafa; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 500; border-radius: 2px;">
                    Sign in to Exhibit
                  </a>
                  <p style="font-size: 14px; color: #737373; line-height: 1.6; margin: 32px 0 0 0;">
                    If you didn't request this email, you can safely ignore it.
                  </p>
                </div>
              </body>
            </html>
          `,
          text: `Sign in to Exhibit\n\nClick here to sign in: ${url}\n\nThis link will expire in 5 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
        });
      },
      expiresIn: 300, // 5 minutes
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      use: [
        checkout({
          products: [
            {
              productId: "your-product-id",
              slug: "pro",
            },
          ],
          successUrl: env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
    expo()
  ],
});
