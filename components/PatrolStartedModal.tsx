"use client";

import { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PatrolStartedModalProps {
  isOpen: boolean;
  zoneId?: string;
  droneId?: string;
  onClose?: () => void;
}

export function PatrolStartedModal({
  isOpen,
  zoneId = "Zone-01",
  droneId = "CAIRN-01",
  onClose,
}: PatrolStartedModalProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(30);
  const [isVisible, setIsVisible] = useState(isOpen);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setIsVisible(true);
    setTimeLeft(30);

    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Countdown timer - auto-navigate when complete
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-navigate to dashboard when timer ends
          setTimeout(() => {
            setIsVisible(false);
            onClose?.();
            router.push("/dashboard");
          }, 300);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, onClose, router]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        className="anim-scale"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 40,
          maxWidth: 500,
          width: "90%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Timer Icon */}
        <div
          style={{
            fontSize: 48,
            marginBottom: 24,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 64,
          }}
        >
          <Clock size={48} style={{ color: "var(--fg)" }} />
          <div
            style={{
              position: "absolute",
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "2px solid var(--fg)",
              animation: `spin ${30}s linear forwards`,
              opacity: 0.3,
            }}
          />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: "-.01em" }}>
          ✓ Patrol Started
        </h2>

        {/* Description */}
        <p style={{ fontSize: 12, color: "var(--muted-fg)", marginBottom: 24, lineHeight: 1.6 }}>
          Your drone <strong>{droneId}</strong> is now actively surveying <strong>{zoneId}</strong>. The mission will continue automatically. Check mission status anytime from the dashboard.
        </p>

        {/* Countdown */}
        <div
          style={{
            background: "var(--muted)",
            padding: 20,
            borderRadius: "var(--radius)",
            marginBottom: 24,
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--muted-fg)",
              marginBottom: 8,
              fontWeight: 600,
              letterSpacing: ".08em",
            }}
          >
            AUTO-CLOSE IN
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              fontFamily: "monospace",
              color: timeLeft <= 10 ? "#fbbf24" : "var(--fg)",
              transition: "color 0.2s ease",
            }}
          >
            {String(timeLeft).padStart(2, "0")}s
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: 3,
            background: "var(--border)",
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, var(--fg), #22c55e)",
              width: `${((30 - timeLeft) / 30) * 100}%`,
              transition: "width 0.1s linear",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
              router.push("/dashboard");
            }}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "var(--fg)",
              color: "var(--bg)",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
              letterSpacing: ".05em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            GO TO DASHBOARD →
          </button>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "transparent",
              color: "var(--fg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
              letterSpacing: ".05em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            CLOSE
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
