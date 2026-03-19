"use client";

import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

export interface TransactionLogEntry {
  timestamp: string;
  message: string;
  status: "info" | "success" | "error" | "loading";
  transactionId?: string;
  explorerLink?: string;
  type?: "account" | "transfer" | "contract" | "topic" | "manifest";
}

interface TransactionLogProps {
  entries: TransactionLogEntry[];
  isLoading?: boolean;
  title?: string;
  maxHeight?: string;
}

export const TransactionLog = ({
  entries,
  isLoading = false,
  title = "TRANSACTION LOG",
  maxHeight = "300px"
}: TransactionLogProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return "✓";
      case "error": return "✗";
      case "loading": return "◆";
      default: return "•";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "var(--fg)";
      case "error": return "#ff6b6b";
      case "loading": return "var(--muted-fg)";
      default: return "var(--muted-fg)";
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="card anim-up" style={{ padding: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", marginBottom: 12 }}>
        {title}
      </div>
      
      <div
        style={{
          minHeight: 170,
          maxHeight: maxHeight,
          overflow: "auto",
          fontSize: 11,
          color: "var(--muted-fg)",
          lineHeight: 1.8,
          paddingRight: 8,
        }}
      >
        {entries.length === 0 ? (
          <span style={{ color: "var(--border)" }}>// awaiting transactions...</span>
        ) : (
          entries.map((entry, i) => (
            <div
              key={i}
              className="anim-left"
              style={{
                animationDelay: `${i * 40}ms`,
                marginBottom: 12,
                padding: 10,
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                background: "var(--muted)",
              }}
            >
              {/* Header with timestamp and status */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: entry.transactionId ? 8 : 0,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span
                      style={{
                        color: getStatusColor(entry.status),
                        fontWeight: 700,
                        fontSize: 10,
                      }}
                    >
                      {getStatusIcon(entry.status)}
                    </span>
                    <span style={{ color: "var(--muted-fg)", fontSize: 10 }}>
                      {entry.timestamp}
                    </span>
                    {entry.type && (
                      <span
                        style={{
                          fontSize: 9,
                          padding: "2px 6px",
                          background: "var(--border)",
                          borderRadius: "3px",
                          color: "var(--muted-fg)",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        {entry.type}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      color: entry.status === "success" ? "var(--fg)" : "var(--muted-fg)",
                      fontWeight: entry.status === "success" ? 600 : 400,
                      marginTop: 4,
                    }}
                  >
                    {entry.message}
                  </div>
                </div>
              </div>

              {/* Transaction ID and Explorer Link */}
              {entry.transactionId && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px",
                    background: "rgba(255,255,255,.05)",
                    borderRadius: "4px",
                    fontSize: 9,
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1, fontFamily: "monospace", color: "var(--muted-fg)", wordBreak: "break-all" }}>
                      TX: {entry.transactionId}
                    </div>
                    <button
                      onClick={() => copyToClipboard(entry.transactionId!, `copy-${i}`)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted-fg)",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 10,
                        transition: "color .2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-fg)")}
                    >
                      {copiedId === `copy-${i}` ? (
                        <>
                          <Check size={12} /> COPIED
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> COPY
                        </>
                      )}
                    </button>
                  </div>

                  {/* Explorer Link */}
                  {entry.explorerLink && (
                    <a
                      href={entry.explorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        marginTop: 8,
                        padding: "6px 8px",
                        background: "rgba(100,200,255,.1)",
                        borderRadius: "4px",
                        color: "#64c8ff",
                        textDecoration: "none",
                        fontSize: 10,
                        fontWeight: 500,
                        transition: "all .2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(100,200,255,.2)";
                        e.currentTarget.style.color = "#7dd9ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(100,200,255,.1)";
                        e.currentTarget.style.color = "#64c8ff";
                      }}
                    >
                      <ExternalLink size={12} />
                      VIEW ON HEDERA EXPLORER
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            <span className="think-dot" />
            <span className="think-dot" />
            <span className="think-dot" />
          </div>
        )}
      </div>
    </div>
  );
};
