import { notFound } from "next/navigation";
import { config, getPage } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";
import { pageComponents } from "@/components/site/pages";

/**
 * Every page in client.config.ts is served from this one route. The page body
 * comes from components/site/pages, keyed by path. Never add a page folder by
 * hand: add the page to the config and its component to the registry.
 */

export const dynamicParams = false;

function toPath(slug?: string[]): string {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

export function generateStaticParams() {
  return config.pages.map((p) => ({ slug: p.path === "/" ? [] : p.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PageProps<"/[[...slug]]">) {
  const { slug } = await params;
  const page = getPage(toPath(slug));
  return page ? pageMetadata(page) : {};
}

export default async function Page({ params }: PageProps<"/[[...slug]]">) {
  const { slug } = await params;
  const path = toPath(slug);
  const Body = pageComponents[path];
  if (!Body || !getPage(path)) notFound();
  return <Body />;
}
