import { env } from "@exhibit/env/web";
import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins: [polarClient(), magicLinkClient()],
});
