import { clsx, type ClassValue } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  return `${process.env.PUBLIC_URL!}${path}`;
}


export function constructMetadata({
  title = "Quill - the SaaS for research",
  description = "Quill is an open source software to make chatting to your pdfs easy and convenieint",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false
} : {
  title?: string,
  description?: string,
  image?: string,
  icons?: string,
  noIndex?: boolean,
} = {}) : Metadata{
  return {
    title, description, openGraph : {
      title,
      description,
      images: [
        {url : image}
      ]
    },
    twitter : {
      card : "summary_large_image",
      title,
      description,
      images:[image],
      creator : "@PixPerk_"
    },
    icons,
    metadataBase : new URL("https://quill-two-ochre.vercel.app"),
    ...(noIndex && {
      robots : {
        index  : false,
        follow : false
      }
    })
  }
}