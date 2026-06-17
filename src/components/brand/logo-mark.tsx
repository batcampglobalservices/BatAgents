import Image from "next/image";
import Link from "next/link";

type LogoMarkProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export default function LogoMark({
  href = "/",
  compact = false,
  className = "",
}: LogoMarkProps) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <Image
          src="/logo-main.png"
          alt="BatAgents"
          fill
          sizes="40px"
          className="object-contain p-1.5"
          priority={false}
        />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block text-sm font-semibold tracking-[0.14em] text-white">
            BAT AGENTS
          </span>
          <span className="block text-[11px] font-medium tracking-[0.24em] text-slate-400">
            AI MARKETPLACE
          </span>
        </span>
      ) : null}
    </span>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  ) : (
    content
  );
}
