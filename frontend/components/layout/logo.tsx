import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <Link
      href="/dashboard"
      className={cn("flex items-center gap-2.5", className)}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white p-1">
        <Image
          src="/images/comet-logo.png"
          alt="Comet"
          width={32}
          height={32}
          className="size-full object-contain"
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-base tracking-tight">
          Comet GPI
        </span>
        {showTagline ? (
          <span className="text-xs opacity-70">
            Gestion des parcs informatiques
          </span>
        ) : null}
      </div>
    </Link>
  );
}
