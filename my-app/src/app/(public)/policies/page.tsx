"use client";

import { useState, useEffect, JSX } from "react";
import { getPoliciesPage, CmsPoliciesPage } from "@/lib/api";

type TabKey = "privacy" | "terms" | "exchange" | "community";

const TABS: { key: TabKey; label: string }[] = [
  { key: "privacy",   label: "Privacy Policy"      },
  { key: "terms",     label: "Terms of Service"     },
  { key: "exchange",  label: "Exchange Policy"      },
  { key: "community", label: "Community Guidelines" },
];

function renderInline(children: any[]): JSX.Element[] {
  return (children ?? []).map((c: any, j: number) => {
    const text = c.text ?? "";
    if (c.bold && c.italic) return <strong key={j}><em>{text}</em></strong>;
    if (c.bold)             return <strong key={j}>{text}</strong>;
    if (c.italic)           return <em key={j}>{text}</em>;
    if (c.underline)        return <u key={j}>{text}</u>;
    if (c.code)             return <code key={j} className="bg-gray-100 px-1 rounded text-xs">{text}</code>;
    return <span key={j}>{text}</span>;
  });
}

function renderBlocks(blocks: any): JSX.Element {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return <p className="text-sm text-gray-400 italic">No content added yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block: any, i: number) => {
        const type = block.type;

        if (type === "paragraph") {
          return <p key={i} className="text-sm text-gray-600 leading-relaxed">{renderInline(block.children)}</p>;
        }
        if (type === "heading") {
          const level = block.level ?? 3;
          const cls   = level <= 2
            ? "mt-8 text-[11px] font-extrabold tracking-wide uppercase text-green-700"
            : "mt-6 text-sm font-extrabold text-gray-800";
          const Tag = `h${level}` as keyof JSX.IntrinsicElements;
          return <Tag key={i} className={cls}>{renderInline(block.children)}</Tag>;
        }
        if (type === "list") {
          const ordered = block.format === "ordered";
          const ListTag = ordered ? "ol" : "ul";
          return (
            <ListTag key={i} className={`text-sm text-gray-600 pl-5 space-y-1.5 ${ordered ? "list-decimal" : "list-disc"}`}>
              {(block.children ?? []).map((item: any, j: number) => (
                <li key={j}>{renderInline(item.children)}</li>
              ))}
            </ListTag>
          );
        }
        if (type === "quote") {
          return (
            <div key={i} className="mt-4 bg-green-50 border-l-4 border-green-600 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{renderInline(block.children)}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }): JSX.Element {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
        isActive ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}>
      {label}
    </button>
  );
}

function PolicyPanel({ title, content, lastUpdated }: { title: string; content: any; lastUpdated: string }): JSX.Element {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-8">
      <h2 className="text-xl md:text-2xl font-extrabold text-green-900 pb-3 border-b border-gray-100">{title}</h2>
      <div className="mt-5">{renderBlocks(content)}</div>
      <p className="mt-10 pt-5 border-t border-gray-100 text-center text-xs text-gray-400 italic">
        Last Updated: {lastUpdated}
      </p>
    </section>
  );
}

export default function PoliciesPage(): JSX.Element {
  const [active,  setActive]  = useState<TabKey>("privacy");
  const [data,    setData]    = useState<CmsPoliciesPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPoliciesPage()
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Content unavailable. Please try again later.</p>
      </main>
    );
  }

  const contentMap: Record<TabKey, { title: string; content: any }> = {
    privacy:   { title: "Privacy Policy",        content: data.privacy_policy        },
    terms:     { title: "Terms of Service",       content: data.terms_of_service      },
    exchange:  { title: "Skills Exchange Policy", content: data.exchange_policy       },
    community: { title: "Community Guidelines",   content: data.community_guidelines  },
  };

  return (
    <main className="bg-gray-50 text-gray-800">
      <section className="bg-linear-to-br from-green-700 to-green-500 text-white py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">Our Policies</h1>
          <p className="mt-3 text-sm md:text-base opacity-90">
            Learn about our community guidelines, privacy practices, and terms of service.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-5 py-10 md:py-14">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3 mb-6">
          {TABS.map(({ key, label }) => (
            <TabButton key={key} label={label} isActive={active === key} onClick={() => setActive(key)} />
          ))}
        </div>
        <PolicyPanel
          title={contentMap[active].title}
          content={contentMap[active].content}
          lastUpdated={data.last_updated ?? ""}
        />
      </div>
    </main>
  );
}
