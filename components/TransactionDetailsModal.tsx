"use client";

import { ExternalLink, Copy, Check, AlertCircle } from "lucide-react";
import { useState } from "react";

export interface TransactionResult {
  transactionId: string;
  explorerLink: string;
  status: "success" | "error" | "pending";
  message?: string;
  type?: "account" | "transfer" | "contract" | "topic" | "manifest";
  timestamp?: string;
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TransactionResult[];
  title?: string;
}

export const TransactionDetailsModal = ({
  isOpen,
  onClose,
  results,
  title = "Transaction Details"
}: TransactionDetailsModalProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "#4ade80";
      case "error": return "#ff6b6b";
      case "pending": return "#fbbf24";
      default: return "var(--muted-fg)";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: 600,
          width: "100%",
          padding: 32,
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "var(--muted-fg)",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {results.length === 0 ? (
            <div
              style={{
                padding: 20,
                background: "var(--muted)",
                borderRadius: "var(--radius)",
                textAlign: "center",
                color: "var(--muted-fg)",
                fontSize: 12,
              }}
            >
              No transactions to display
            </div>
          ) : (
            results.map((result, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  border: `1px solid ${getStatusColor(result.status)}40`,
                  background: `${getStatusColor(result.status)}10`,
                  borderRadius: "var(--radius)",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: getStatusColor(result.status),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "#000",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {result.status === "success" ? "✓" : result.status === "error" ? "✕" : "◆"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>
                      {result.message || `Transaction ${result.status}`}
                    </div>
                    {result.type && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--muted-fg)",
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                        }}
                      >
                        Type: {result.type}
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction ID */}
                <div
                  style={{
                    background: "rgba(0,0,0,.2)",
                    padding: 12,
                    borderRadius: "4px",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted-fg)",
                      marginBottom: 6,
                      fontWeight: 600,
                      letterSpacing: ".05em",
                    }}
                  >
                    TRANSACTION ID
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <code
                      style={{
                        fontSize: 11,
                        color: "var(--fg)",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      {result.transactionId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.transactionId, `copy-${i}`)}
                      style={{
                        background: "none",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        color: "var(--muted-fg)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 10,
                        flexShrink: 0,
                      }}
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
                </div>

                {/* Explorer Link */}
                <a
                  href={result.explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "rgba(100,200,255,.1)",
                    border: "1px solid rgba(100,200,255,.3)",
                    borderRadius: "4px",
                    color: "#64c8ff",
                    textDecoration: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    transition: "all .2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(100,200,255,.2)";
                    e.currentTarget.style.borderColor = "rgba(100,200,255,.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(100,200,255,.1)";
                    e.currentTarget.style.borderColor = "rgba(100,200,255,.3)";
                  }}
                >
                  <ExternalLink size={12} />
                  VIEW ON HEDERA EXPLORER
                </a>
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
