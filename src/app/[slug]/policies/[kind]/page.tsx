"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { POLICY_ORDER, useStoreContext, usePublicPolicies, type PolicyKind } from "@/lib/policies";

/** One of the restaurant's written policies (portal Settings > Policies). The HTML is sanitized by the backend when saved. */
export default function PolicyPage() {
  const { slug: routeSlug, kind } = useParams<{ slug: string; kind: string }>();
  const { home } = useStoreContext();
  const data = usePublicPolicies(routeSlug);
  const policy = POLICY_ORDER.includes(kind as PolicyKind) ? data?.policies[kind as PolicyKind] : undefined;

  if (data === undefined) {
    return <div className="mx-auto max-w-[760px] px-4 py-10"><div className="h-64 animate-pulse rounded-2xl bg-sf-surface-container-low" /></div>;
  }
  if (!policy) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-16 text-center font-sf-body">
        <p className="text-[14px] font-semibold text-sf-on-surface">This page isn&apos;t available.</p>
        <Link href={home} className="mt-3 inline-block text-[13px] font-semibold text-sf-primary hover:underline">
          Back to {data?.restaurant_name ?? "the restaurant"}
        </Link>
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-[760px] px-4 py-10 font-sf-body">
      <Link href={home} className="text-[13px] font-semibold text-sf-primary hover:underline">← {data!.restaurant_name}</Link>
      <h1 className="mb-6 mt-3 font-sf-headline text-[28px] font-extrabold text-sf-on-surface">{policy.title}</h1>
      <div
        className="text-[15px] leading-relaxed text-sf-text-body [&_a]:text-sf-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-[22px] [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-[19px] [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-[16px] [&_h3]:font-bold [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_table]:mb-3 [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
        // eslint-disable-next-line react/no-danger -- allowlist-sanitized by the backend (core/rich_text.py) on save
        dangerouslySetInnerHTML={{ __html: policy.body_html }}
      />
    </article>
  );
}
