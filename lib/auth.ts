import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Access Key",
      credentials: {
        accessKey: { label: "Access key", type: "password" }
      },
      async authorize(credentials) {
        const configuredKey = process.env.NEXTAUTH_DEMO_ACCESS_KEY;
        if (!configuredKey || !credentials?.accessKey || credentials.accessKey !== configuredKey) {
          return null;
        }

        return {
          id: "access-key-user",
          name: "Blind Dev Toolkit User",
          email: "subscriber@blinddevtoolkit.com"
        };
      }
    })
  ],
  pages: {
    signIn: "/"
  }
};
