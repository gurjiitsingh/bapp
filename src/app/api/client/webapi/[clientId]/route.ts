import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request, context: any) {
  console.log("---- API HIT ----");

  const params = await context.params;
  const clientId = params.clientId?.trim();

  console.log("CLIENT ID:", clientId);

  if (!clientId) {
    return Response.json(
      { error: "Missing clientId" },
      { status: 400 }
    );
  }

  try {
    // FETCH CLIENT FROM FIRESTORE
    const docRef = adminDb
      .collection("clients")
      .doc(clientId);

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return Response.json(
        {
          error: "Client not found",
          clientId,
        },
        { status: 404 }
      );
    }

    const data = docSnap.data();

    // CHECK ACTIVE
    if (!data?.isActive) {
      return Response.json(
        { error: "Client inactive" },
        { status: 403 }
      );
    }

    // CHECK WEB API CONFIGURATION
    if (!data?.webApi) {
      return Response.json(
        {
          error: "Web API configuration not found",
          clientId,
        },
        { status: 404 }
      );
    }

    // RETURN CLIENT DATA + WEB API
    return Response.json({
      success: true,
      data: {
        clientId: data.clientId,
        clientKey: data.clientKey,

        status: data.status,
        isActive: data.isActive,

        webApi: data.webApi,
      },
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}