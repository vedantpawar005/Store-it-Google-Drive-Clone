"use server";

import { cookies } from "next/headers";
import { Client, Account, Databases, Storage, Avatars } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";

/**
 * Session-based client (logged-in user)
 * Returns null if no session exists
 */
export const createSessionClient = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");

  if (!session?.value) {
    return null;
  }

  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    .setSession(session.value);

  return {
    account: new Account(client),
    database: new Databases(client),
  };
};

/**
 * Admin client (server-only)
 * Used for signup, DB writes, storage
 */
export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.secretKey);

  return {
    account: new Account(client),
    database: new Databases(client),
    storage: new Storage(client),
    avatars: new Avatars(client),
  };
};
