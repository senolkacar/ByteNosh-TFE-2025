import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "@auth/core/jwt";
import { AdapterUser as NextAuthAdapterUser } from "@auth/core/adapters";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: string;
            fullName: string;
            email: string;
            phone: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: string;
        fullName: string;
        email: string;
        phone: string;
    }

    interface JWT extends DefaultJWT {
        id: string;
        role: string;
        fullName: string;
        email: string;
        phone: string;
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser extends NextAuthAdapterUser {
        role?: string;
        fullName?: string;
        phone?: string;
    }
}