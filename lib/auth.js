import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDB } from "@/lib/db";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  providers: [
    // =========================
    // ADMIN LOGIN
    // =========================
    Credentials({
      id: "admin-credentials",
      name: "Admin Login",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const db = await getDB();

          const email = credentials.email
            .toString()
            .trim()
            .toLowerCase();

          const admin = await db.collection("users").findOne({
            email,
            role: "admin",
            isActive: true,
          });

          if (!admin || !admin.password) {
            return null;
          }

          const passwordValid = await bcrypt.compare(
            credentials.password.toString(),
            admin.password
          );

          if (!passwordValid) {
            return null;
          }

          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: "ADMIN",
          };
        } catch (error) {
          console.error("ADMIN AUTH ERROR:", error);
          return null;
        }
      },
    }),

    // =========================
    // MEMBER LOGIN
    // =========================
    Credentials({
      id: "user-credentials",
      name: "User Login",

      credentials: {
        mobile: {
          label: "Mobile",
          type: "tel",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.mobile || !credentials?.password) {
            return null;
          }

          const db = await getDB();

          const mobile = credentials.mobile
            .toString()
            .replace(/\D/g, "");

          const member = await db.collection("members").findOne({
            mobile,
            isActive: true,
          });

          if (!member || !member.password) {
            return null;
          }

          const passwordValid = await bcrypt.compare(
            credentials.password.toString(),
            member.password
          );

          if (!passwordValid) {
            return null;
          }

          return {
            id: member._id.toString(),
            name: member.name,
            mobile: member.mobile,
            role: "USER",
            memberId: member._id.toString(),
          };
        } catch (error) {
          console.error("USER AUTH ERROR:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        if (user.memberId) {
          token.memberId = user.memberId;
        }

        if (user.mobile) {
          token.mobile = user.mobile;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;

        if (token.memberId) {
          session.user.memberId = token.memberId;
        }

        if (token.mobile) {
          session.user.mobile = token.mobile;
        }
      }

      return session;
    },

    async authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;

      // Admin routes
      if (pathname.startsWith("/admin")) {
        return auth?.user?.role === "ADMIN";
      }

      // User routes
      if (pathname.startsWith("/dashboard")) {
        return auth?.user?.role === "USER";
      }

      return true;
    },
  },

  pages: {
    signIn: "/auth",
  },
});