import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

/** A paper card with a QR code, its purpose, and the plain URL for anyone who cannot scan. */
export function QrCard({
  url,
  title,
  caption,
  size = 196,
  className,
  qrClassName,
}: {
  url: string;
  title: string;
  caption: string;
  size?: number;
  className?: string;
  qrClassName?: string;
}) {
  const display = url.replace(/^https?:\/\//, "");
  return (
    <figure className={cn("sheet flex flex-col items-center gap-3 p-5 text-center", className)}>
      <figcaption className="flex flex-col gap-0.5">
        <span className="font-display text-[1.15rem] leading-tight font-bold">{title}</span>
        <span className="text-ink-soft text-sm">{caption}</span>
      </figcaption>
      <div className="border-ink rounded-xl border-2 bg-white p-2.5">
        <QRCodeSVG value={url} size={size} fgColor="#1d2b64" bgColor="#ffffff" level="M" marginSize={0} className={cn("h-auto max-w-full", qrClassName)} />
      </div>
      <span className="text-ink-soft tabular max-w-full text-[0.82rem] font-medium break-all">{display}</span>
    </figure>
  );
}
