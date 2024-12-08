import { db } from "@/db";
import { gemini } from "@/lib/gemini";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { JinaEmbeddings } from "@langchain/community/embeddings/jina";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { GoogleGenerativeAIStream,StreamingTextResponse } from 'ai'


export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { id: userId } = user;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  //vectorise message

  const embeddings = new JinaEmbeddings({
    apiKey: process.env.JINA_API_KEY,
    model: "jina-embeddings-v2-base-en", // Optional, defaults to "jina-embeddings-v2-base-en"
  });

  const pineconeIndex = pinecone.Index(
    "quill",
    "https://quill-my4xm59.svc.aped-4627-b74a.pinecone.io"
  );

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const prevMessages = db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = (await prevMessages).map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("model" as const),
    parts: [{ text: msg.text }],
  }));

  const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

  const chat = model.startChat({
    history: formattedPrevMessages,
  });

  const messageToSend = `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.
      \n----------------\n
  
                CONTEXT:
            ${results.map((r) => r.pageContent).join("\n\n")}
            
             USER INPUT: ${message}`;

  const result = await chat.sendMessageStream(messageToSend); 
  const stream = GoogleGenerativeAIStream(result, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      })
    },
  })

  return new StreamingTextResponse(stream)
}


