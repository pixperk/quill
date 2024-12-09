import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { pinecone } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { JinaEmbeddings } from "@langchain/community/embeddings/jina";
import { PineconeStore } from "@langchain/pinecone";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) throw new UploadThingError("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();

  return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  const isFileExisting = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });

  if (isFileExisting) return;

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: `https://utfs.io/f/${file.key}`,
      uploadStatus: "PROCESSING",
    },
  });

  try {
    const response = await fetch(`https://utfs.io/f/${file.key}`);
    const blob = await response.blob();

    const loader = new PDFLoader(blob);

    const pageLevelDocs = await loader.load();

    const pagesAmt = pageLevelDocs.length;

    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;

    const isProExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
    const isFreeExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
    }

    // Initialize Pinecone index
    const pineconeIndex = pinecone.Index(
      "quill",
      "https://quill-my4xm59.svc.aped-4627-b74a.pinecone.io"
    );

    const embeddings = new JinaEmbeddings({
      apiKey: process.env.JINA_API_KEY,
      model: "jina-embeddings-v2-base-en", // Optional, defaults to "jina-embeddings-v2-base-en"
    });

    console.log(embeddings);

    const store = await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    });

    console.log(store);

    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
      },
    });
  } catch (error) {
    console.log(error);
    alert(error);
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: createdFile.id,
      },
    });
  }
};

export const ourFileRouter = {
  freePdfUploader: f({
    pdf: {
      maxFileSize: "4MB",
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPdfUploader: f({
    pdf: {
      maxFileSize: "16MB",
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
