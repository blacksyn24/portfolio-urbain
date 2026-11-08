"use client";

import { track } from "@/lib/track";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: Parameters<typeof track>[0];
  label?: string;
};

export function TrackedLink({ event, label, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        track(event, label ?? rest.href ?? "");
        onClick?.(e);
      }}
    />
  );
}
