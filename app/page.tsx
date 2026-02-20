import Link from "next/link";
import {
  Leaf,
  Clock,
  FileX,
  DollarSign,
  Camera,
  Shield,
  Building2,
  TreePine,
  Scale,
  Briefcase,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a1a0f] text-white">
      {/* Topographic background pattern */}
      <style>{`
        .topo-bg {
          background-color: #0a1a0f;
          background-image: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(34,197,94,0.07) 39px,
              rgba(34,197,94,0.07) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              rgba(34,197,94,0.07) 39px,
              rgba(34,197,94,0.07) 40px
            );
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="topo-bg min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-green-400" />
            <span className="text-xl font-bold tracking-tight">BoundaryTruth</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-lg border border-green-500 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/10 transition">
              Connect Wallet
            </button>
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition"
            >
              Sign In
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="flex flex-1 flex-col items-center justify-center text-center px-4 pb-24">
          <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Tamper-Proof Evidence for Every Boundary Inspection
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-400">
            Autonomous drone patrols. Hedera-anchored records.
            <br />
            Legal-grade evidence for forest and plantation disputes.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-green-500 px-7 py-3 text-base font-semibold text-black hover:bg-green-400 transition"
            >
              Start Inspection
            </Link>
            <button className="rounded-lg border border-white/20 px-7 py-3 text-base font-semibold text-white hover:bg-white/10 transition">
              View Demo Zone
            </button>
          </div>
        </div>
      </section>

      {/* PROBLEM STRIP */}
      <section className="border-y border-white/10 bg-[#0d1f12]">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-8 py-14 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <Clock className="h-8 w-8 text-amber-400 mb-3" />
            <span className="text-4xl font-extrabold text-amber-400">18 months</span>
            <p className="mt-2 text-sm text-gray-400">average dispute resolution time today</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FileX className="h-8 w-8 text-red-400 mb-3" />
            <span className="text-4xl font-extrabold text-red-400">0</span>
            <p className="mt-2 text-sm text-gray-400">verifiable records in current manual inspection systems</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <DollarSign className="h-8 w-8 text-orange-400 mb-3" />
            <span className="text-4xl font-extrabold text-orange-400">₹2L per case</span>
            <p className="mt-2 text-sm text-gray-400">average investigation cost per dispute</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-5xl px-8 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              icon: <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
              title: "Drone Patrol",
              desc: "Scheduled autonomous checkpoint inspection across zone boundaries",
            },
            {
              step: "2",
              icon: <Camera className="h-8 w-8 text-green-400" />,
              title: "Evidence Capture",
              desc: "GPS-tagged photo + condition classification at every checkpoint",
            },
            {
              step: "3",
              icon: <Shield className="h-8 w-8 text-green-400" />,
              title: "Hedera Anchoring",
              desc: "Tamper-proof hash submitted to Hedera Consensus Service (HCS)",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-8 text-center"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15 text-lg font-bold text-green-400">
                {item.step}
              </div>
              {item.icon}
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHO IT SERVES */}
      <section className="bg-[#0d1f12] px-8 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Who It Serves</h2>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <TreePine className="h-8 w-8 text-green-400" />, title: "Forest Department", desc: "Monitor protected zones and generate court-admissible evidence" },
            { icon: <Building2 className="h-8 w-8 text-green-400" />, title: "Plantation Estate", desc: "Track boundary compliance and resolve encroachment disputes" },
            { icon: <Briefcase className="h-8 w-8 text-green-400" />, title: "Insurance Company", desc: "Verify claims with immutable on-chain evidence records" },
            { icon: <Scale className="h-8 w-8 text-green-400" />, title: "Legal Body", desc: "Access tamper-proof inspection records for dispute adjudication" },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-6 text-center"
            >
              {card.icon}
              <h3 className="mt-4 font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-8 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center text-sm text-gray-500 sm:flex-row sm:justify-between">
          <span>© 2025 BoundaryTruth. All rights reserved.</span>
          <span className="rounded-full border border-green-500/40 px-3 py-1 text-xs text-green-400">
            Hedera Testnet
          </span>
          <a
            href="https://github.com/jonathanvineet/cairn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}
