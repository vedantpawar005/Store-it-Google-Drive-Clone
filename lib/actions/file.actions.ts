"use server";

import { revalidatePath } from "next/cache";
import { InputFile } from "node-appwrite/file";
import { ID, Models, Query } from "node-appwrite";

import { getCurrentUser } from "@/lib/actions/user.action";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";

/* ========================== ERROR HANDLER ========================== */
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  throw error;
};

/* ========================== UPLOAD FILE ========================== */
export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, database } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    // 1️⃣ Upload to storage
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    // 2️⃣ Create DB document
    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,              // Users collection document ID
      accountId: accountId,        // Appwrite Account ID
      users: [],
      bucketField: bucketFile.$id, // REQUIRED FIELD
    };

    const newFile = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      ID.unique(),
      fileDocument
    );

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

/* ========================== QUERY BUILDER ========================== */
const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  const queries = [
    Query.or([
      // ✅ FIX: use accountId, NOT $id
      Query.equal("accountId", [currentUser.accountId]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");
    queries.push(
      orderBy === "asc"
        ? Query.orderAsc(sortBy)
        : Query.orderDesc(sortBy)
    );
  }

  return queries;
};

/* ========================== GET FILES ========================== */
export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { database } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return parseStringify({ documents: [], total: 0 });

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

/* ========================== RENAME FILE ========================== */
export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { database } = await createAdminClient();

  try {
    const updatedFile = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { name: `${name}.${extension}` }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

/* ========================== UPDATE FILE USERS ========================== */
export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { database } = await createAdminClient();

  try {
    const updatedFile = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { users: emails }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

/* ========================== DELETE FILE ========================== */
export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { database, storage } = await createAdminClient();

  try {
    await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );

    await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

/* ========================== TOTAL SPACE USED ========================== */
export const getTotalSpaceUsed = async () => {
  const { database } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    // ✅ FIX: accountId, not $id
    const files = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("accountId", [currentUser.accountId])]
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024, // 2GB
    };

    files.documents.forEach((file) => {
      const type = file.type as FileType;
      totalSpace[type].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[type].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[type].latestDate)
      ) {
        totalSpace[type].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Failed to calculate storage usage");
  }
};
