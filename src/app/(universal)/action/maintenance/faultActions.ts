// app/(universal)/action/maintenance/faultActions.ts

"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";
import { deleteImage, upload } from "@/lib/cloudinary";

import type {
 
  FaultPriority,
  FaultStatus,
  MaintenanceFault,
} from "@/lib/maintenance/faultTypes";





/* =========================================================
   DELETE FAULT PHOTO
========================================================= */

export async function deleteFaultPhoto(
  faultId: string,
  imageUrl: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId?.trim()) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    if (!imageUrl?.trim()) {
      return {
        success: false,
        message: "Image URL is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const snapshot =
      await faultRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    const data =
      snapshot.data();

    const photos =
      Array.isArray(data?.photos)
        ? data.photos
        : [];

    const updatedPhotos =
      photos.filter(
        (photo: unknown) => {
          if (
            typeof photo === "string"
          ) {
            return photo !== imageUrl;
          }

          if (
            photo &&
            typeof photo === "object"
          ) {
            return (
              (photo as {
                url?: string;
              }).url !== imageUrl
            );
          }

          return true;
        }
      );

    await deleteImage(imageUrl);

    await faultRef.update({
      photos: updatedPhotos,
      updatedAt: Timestamp.now(),
    });

    revalidatePath(
      "/admin/maintenance/faults"
    );

    revalidatePath(
      `/admin/maintenance/faults/${faultId}`
    );

    return {
      success: true,
      message:
        "Fault photo deleted successfully.",
    };
  } catch (error) {
    console.error(
      "deleteFaultPhoto error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to delete fault photo.",
    };
  }
}

/* =========================================================
   GET FAULT BY ID
========================================================= */

export async function getFaultById(
  faultId: string
): Promise<MaintenanceFault | null> {
  try {
    if (!faultId) {
      return null;
    }

    const snapshot = await adminDb
      .collection("maintenanceFaults")
      .doc(faultId)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data();

    if (!data) {
      return null;
    }

    return {
      id: snapshot.id,

      ticketNumber:
        data.ticketNumber || "",

      machineId:
        data.machineId || "",

      machineName:
        data.machineName || "",

      machineCode:
        data.machineCode || "",

      departmentId:
        data.departmentId || "",

      departmentName:
        data.departmentName || "",

      location:
        data.location || "",

      faultTitle:
        data.faultTitle || "",

      faultDescription:
        data.faultDescription || "",

      priority:
        data.priority || "MEDIUM",

      status:
        data.status || "OPEN",

      reportedBy:
        data.reportedBy || "",

      reportedByName:
        data.reportedByName || "",

      reportedAt:
        data.reportedAt?.toDate
          ? data.reportedAt
              .toDate()
              .toISOString()
          : null,

      assignedTo:
        data.assignedTo || null,

      assignedToName:
        data.assignedToName || null,

      assignedAt:
        data.assignedAt?.toDate
          ? data.assignedAt
              .toDate()
              .toISOString()
          : null,

      startedAt:
        data.startedAt?.toDate
          ? data.startedAt
              .toDate()
              .toISOString()
          : null,

      resolvedAt:
        data.resolvedAt?.toDate
          ? data.resolvedAt
              .toDate()
              .toISOString()
          : null,

      closedAt:
        data.closedAt?.toDate
          ? data.closedAt
              .toDate()
              .toISOString()
          : null,

      diagnosis:
        data.diagnosis || "",

      repairDescription:
        data.repairDescription || "",

      downtimeMinutes:
        Number(
          data.downtimeMinutes || 0
        ),

      remarks:
        data.remarks || "",

     photos: Array.isArray(data.photos)
  ? data.photos.map((photo: any, index: number) => ({
      id:
        typeof photo?.id === "string"
          ? photo.id
          : `${snapshot.id}-photo-${index}`,

      url:
        typeof photo?.url === "string"
          ? photo.url
          : "",

      fileName:
        typeof photo?.fileName === "string"
          ? photo.fileName
          : "",

      storagePath:
        typeof photo?.storagePath === "string"
          ? photo.storagePath
          : "",

      uploadedBy:
        typeof photo?.uploadedBy === "string"
          ? photo.uploadedBy
          : "",

      uploadedAt:
        photo?.uploadedAt?.toDate
          ? photo.uploadedAt.toDate().toISOString()
          : typeof photo?.uploadedAt === "string"
            ? photo.uploadedAt
            : null,
    }))
  : [],

      createdAt:
        data.createdAt?.toDate
          ? data.createdAt
              .toDate()
              .toISOString()
          : null,

      updatedAt:
        data.updatedAt?.toDate
          ? data.updatedAt
              .toDate()
              .toISOString()
          : null,
    };
  } catch (error) {
    console.error(
      "getFaultById error:",
      error
    );

    return null;
  }
}

/* =========================================================
   GET ALL FAULTS
========================================================= */

export async function getFaults(): Promise<
  MaintenanceFault[]
> {
  try {
    const snapshot = await adminDb
      .collection("maintenanceFaults")
      .orderBy(
        "reportedAt",
        "desc"
      )
      .get();

    return snapshot.docs.map(
      (doc) =>
        mapFault(
          doc.id,
          doc.data()
        )
    );
  } catch (error) {
    console.error(
      "getFaults error:",
      error
    );

    return [];
  }
}

/* =========================================================
   UPDATE FAULT STATUS
========================================================= */

export async function updateFaultStatus(
  faultId: string,
  status: FaultStatus
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const faultSnapshot =
      await faultRef.get();

    if (!faultSnapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    const now = Timestamp.now();

    const updateData: Record<
      string,
      unknown
    > = {
      status,
      updatedAt: now,
    };

    if (status === "IN_PROGRESS") {
      updateData.startedAt = now;
    }

    if (status === "RESOLVED") {
      updateData.resolvedAt = now;
    }

    if (status === "CLOSED") {
      updateData.closedAt = now;
    }

    await faultRef.update(
      updateData
    );

    if (
      status === "RESOLVED" ||
      status === "CLOSED"
    ) {
      const faultData =
        faultSnapshot.data();

      const machineId =
        faultData?.machineId;

      if (machineId) {
        await adminDb
          .collection("machines")
          .doc(machineId)
          .update({
            status: "ACTIVE",
            updatedAt: now,
          });

        revalidatePath(
          "/admin/maintenance/machines"
        );
      }
    }

    revalidatePath(
      "/admin/maintenance/faults"
    );

    return {
      success: true,
      message:
        "Fault status updated successfully.",
    };
  } catch (error) {
    console.error(
      "updateFaultStatus error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update fault status.",
    };
  }
}

/* =========================================================
   ASSIGN FAULT
========================================================= */

export async function assignFault(
  faultId: string,
  assignedTo: string,
  assignedToName: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    if (!assignedTo?.trim()) {
      return {
        success: false,
        message: "Technician is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const snapshot =
      await faultRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    const now = Timestamp.now();

    await faultRef.update({
      assignedTo:
        assignedTo.trim(),

      assignedToName:
        assignedToName?.trim() || "",

      assignedAt: now,

      status: "ASSIGNED",

      updatedAt: now,
    });

    revalidatePath(
      "/admin/maintenance/faults"
    );

    return {
      success: true,
      message:
        "Fault assigned successfully.",
    };
  } catch (error) {
    console.error(
      "assignFault error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to assign fault.",
    };
  }
}

/* =========================================================
   UPDATE REPAIR INFORMATION
========================================================= */

export async function updateFaultRepair(
  faultId: string,
  input: {
    diagnosis: string;
    repairDescription: string;
    downtimeMinutes: number;
    remarks?: string;
  }
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const snapshot =
      await faultRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    await faultRef.update({
      diagnosis:
        input.diagnosis?.trim() || "",

      repairDescription:
        input.repairDescription?.trim() || "",

      downtimeMinutes:
        Number(
          input.downtimeMinutes || 0
        ),

      remarks:
        input.remarks?.trim() || "",

      updatedAt:
        Timestamp.now(),
    });

    revalidatePath(
      "/admin/maintenance/faults"
    );

    return {
      success: true,
      message:
        "Repair information updated successfully.",
    };
  } catch (error) {
    console.error(
      "updateFaultRepair error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update repair information.",
    };
  }
}

/* =========================================================
   DELETE FAULT
========================================================= */

export async function deleteFault(
  faultId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!faultId) {
      return {
        success: false,
        message: "Fault ID is required.",
      };
    }

    const faultRef = adminDb
      .collection("maintenanceFaults")
      .doc(faultId);

    const snapshot =
      await faultRef.get();

    if (!snapshot.exists) {
      return {
        success: false,
        message: "Fault ticket not found.",
      };
    }

    const data =
      snapshot.data();

    const photos =
      Array.isArray(data?.photos)
        ? data.photos
        : [];

    for (const photo of photos) {
      const imageUrl =
        typeof photo === "string"
          ? photo
          : photo?.url;

      if (imageUrl) {
        try {
          await deleteImage(
            imageUrl
          );
        } catch (error) {
          console.error(
            "Failed to delete fault image:",
            error
          );
        }
      }
    }

    await faultRef.delete();

    revalidatePath(
      "/admin/maintenance/faults"
    );

    return {
      success: true,
      message:
        "Fault ticket deleted successfully.",
    };
  } catch (error) {
    console.error(
      "deleteFault error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to delete fault ticket.",
    };
  }
}

/* =========================================================
   MAP FIRESTORE FAULT
========================================================= */

function mapFault(
  id: string,
  data: FirebaseFirestore.DocumentData
): MaintenanceFault {
  return {
    id,

    ticketNumber:
      data.ticketNumber || "",

    machineId:
      data.machineId || "",

    machineName:
      data.machineName || "",

    machineCode:
      data.machineCode || "",

    departmentId:
      data.departmentId || "",

    departmentName:
      data.departmentName || "",

    location:
      data.location || "",

    faultTitle:
      data.faultTitle || "",

    faultDescription:
      data.faultDescription || "",

    priority:
      (data.priority ||
        "MEDIUM") as FaultPriority,

    status:
      (data.status ||
        "OPEN") as FaultStatus,

    reportedBy:
      data.reportedBy || "",

    reportedByName:
      data.reportedByName || "",

    reportedAt:
      toISOString(
        data.reportedAt
      ),

    assignedTo:
      data.assignedTo || null,

    assignedToName:
      data.assignedToName || null,

    assignedAt:
      toISOString(
        data.assignedAt
      ),

    startedAt:
      toISOString(
        data.startedAt
      ),

    resolvedAt:
      toISOString(
        data.resolvedAt
      ),

    closedAt:
      toISOString(
        data.closedAt
      ),

    diagnosis:
      data.diagnosis || "",

    repairDescription:
      data.repairDescription || "",

    downtimeMinutes:
      Number(
        data.downtimeMinutes || 0
      ),

    remarks:
      data.remarks || "",

    photos:
      Array.isArray(data.photos)
        ? data.photos
        : [],

    createdAt:
      toISOString(
        data.createdAt
      ),

    updatedAt:
      toISOString(
        data.updatedAt
      ),
  };
}

/* =========================================================
   TIMESTAMP → ISO
========================================================= */

function toISOString(
  value: unknown
): string | null {
  if (!value) {
    return null;
  }

  if (
    value instanceof Timestamp
  ) {
    return value
      .toDate()
      .toISOString();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    return (
      value as {
        toDate: () => Date;
      }
    )
      .toDate()
      .toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}