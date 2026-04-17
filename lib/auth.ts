import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialSchema = z.object({
  email: z.string().email(),
  accessCode: z.string().min(8)
});

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      name: "Access Code",
      credentials: {
        email: { label: "Work email", type: "email" },
        accessCode: { label: "Access code", type: "password" }
      },
      authorize: async (credentials) => {
        const parsed = credentialSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const demoEmail = process.env.DEMO_AUTH_EMAIL ?? "demo@blinddevtoolkit.com";
        const demoAccessCode = process.env.DEMO_AUTH_ACCESS_CODE ?? "accessibility-first";

        if (parsed.data.email === demoEmail && parsed.data.accessCode === demoAccessCode) {
          return {
            id: "demo-user",
            email: parsed.data.email,
            name: "Blind Dev Toolkit Member"
          };
        }

        return null;
      }
    })
  ]
};
