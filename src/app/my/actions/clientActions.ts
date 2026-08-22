"use server";

import { adminDb } from "@/lib/firebaseAdmin";

function parseFirebaseWebConfig(text: string) {
  const getValue = (key: string) => {
    const regex = new RegExp(
      `${key}\\s*:\\s*["']([^"']*)["']`,
      "m"
    );

    return text.match(regex)?.[1] || "";
  };

  return {
    apiKey: getValue("apiKey"),
    authDomain: getValue("authDomain"),
    databaseURL: getValue("databaseURL"),
    projectId: getValue("projectId"),
    storageBucket: getValue("storageBucket"),
    messagingSenderId: getValue("messagingSenderId"),
    appId: getValue("appId"),
    measurementId: getValue("measurementId"),
  };
}

export async function saveWebApi({
  clientId,
  config,
}: {
  clientId: string;
  config: string;
}) {
  try {
    if (!clientId) {
      return {
        success: false,
        error: "Client ID is required.",
      };
    }

    const docRef = adminDb
      .collection("clients")
      .doc(clientId);

    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        success: false,
        error: "Client not found.",
      };
    }

    const webApi = parseFirebaseWebConfig(config);

    if (
      !webApi.apiKey ||
      !webApi.projectId ||
      !webApi.appId
    ) {
      return {
        success: false,
        error:
          "Invalid Firebase Web configuration. apiKey, projectId and appId are required.",
      };
    }

    await docRef.update({
      webApi,
      updatedAt: new Date(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("SAVE WEB API ERROR:", error);

    return {
      success: false,
      error: "Failed to save Web Firebase configuration.",
    };
  }
}