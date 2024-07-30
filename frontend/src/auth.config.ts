import Google from "@auth/core/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth"

export default { providers: [Google,Credentials] } satisfies NextAuthConfig