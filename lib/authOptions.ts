
import { NextAuthOptions } from "next-auth";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";
import { Session } from "inspector";
//import clientPromise from "@/lib/MongodbClient";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID as string,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER as string,
      // authorization: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
      // token: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      // userinfo: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,      
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        // const client = await clientPromise;
        // const db = client.db() as any;

        // const user = await db
        //   .collection("users")
        //   .findOne({ email: credentials?.email });

        // const bcrypt = require("bcrypt");

        // const passwordCorrect = await bcrypt.compare(
        //   credentials?.password,
        //   user?.password
        // );

        // if (passwordCorrect) {
        //   return {
        //     id: user?._id,
        //     email: user?.email,
        //   };
        // }

        // console.log("credentials", credentials);
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ user, token, account, trigger, session }) => {
      if (account) {
        token.provider = account.provider;
        token.id_token = account.id_token;
      }
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      return { ...token, ...user };
    },
    session: async ({session, token}) =>{
      session.provider = token.provider;
      return session;
    },

  },
  events :{
    signOut: async ({token})=>{
      if (token.provider === 'keycloak') {
        const keycloakLogoutUrl = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout?post_logout_redirect_uri=${process.env.NEXTAUTH_URL}&id_token_hint=${token.id_token}`;
        await fetch(keycloakLogoutUrl);
      }
    }
  }
  
};
