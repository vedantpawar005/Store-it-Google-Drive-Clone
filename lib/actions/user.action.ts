"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ID, Query } from "node-appwrite";

import { avatarPlaceholderUrl } from "@/constants";
import { parseStringify } from "@/lib/utils";
import { appwriteConfig } from "@/lib/appwrite/config";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/index";

/* ========================== HELPERS ========================== */
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  throw error;
};

const getUserByEmail = async (email: string) => {
  const { database } = await createAdminClient();

  const result = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

/* ========================== SEND OTP ========================== */
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const token = await account.createEmailToken(ID.unique(), email);
    return token.userId; // 🔑 this is accountId
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

/* ========================== SIGN UP ========================== */
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send OTP");

  if (!existingUser) {
    const { database } = await createAdminClient();

    await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId, // ✅ unified
      }
    );
  }

  return parseStringify({ accountId });
};

/* ========================== VERIFY OTP ========================== */
export const verifySecret = async ({
  accountId,
  secret,
}: {
  accountId: string;
  secret: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, secret);

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

/* ========================== CURRENT USER ========================== */
export const getCurrentUser = async () => {
  const client = await createSessionClient();
  if (!client) return null;

  try {
    const accountUser = await client.account.get();

    const userDocs = await client.database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", accountUser.$id)]
    );

    if (userDocs.total === 0) return null;

    return parseStringify(userDocs.documents[0]);
  } catch {
    return null;
  }
};

/* ========================== SIGN OUT ========================== */
export const signOutUser = async () => {
  const client = await createSessionClient();

  try {
    if (client) {
      await client.account.deleteSession("current");
    }

    const cookieStore = await cookies();
    cookieStore.delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

/* ========================== SIGN IN ========================== */
export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return parseStringify({
        accountId: null,
        error: "User not found",
      });
    }

    await sendEmailOTP({ email });

    return parseStringify({ accountId: existingUser.accountId });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};
