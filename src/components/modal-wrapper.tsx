"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export function ModalWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss, overlay, wrapper]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onKeyDown]);

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
      onClick={onClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        ref={wrapper}
        className="relative w-full max-w-4xl max-h-[90vh] bg-background border border-border shadow-2xl rounded-2xl overflow-y-auto"
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 z-50 p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}
