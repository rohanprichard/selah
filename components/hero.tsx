"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const rotatingWords = [
  "cymbals",
  "harp",
  "strings",
  "bass",
  "keyboard",
  "your voice",
  "the chart",
  "the click",
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28 md:py-36">
      <div className="mb-10 space-y-3">
        <p className="text-lg text-muted-foreground sm:text-xl">
          Praising with the{" "}
          <span className="relative inline-block min-w-[7ch] text-left">
            {prefersReducedMotion ? (
              <span className="font-medium text-foreground">
                {rotatingWords[0]}
              </span>
            ) : (
              rotatingWords.map((word, index) => (
                <span
                  key={word}
                  className={`absolute left-0 top-0 font-medium text-foreground transition-opacity duration-500 ${
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={index !== currentIndex}
                >
                  {word}
                </span>
              ))
            )}
            {!prefersReducedMotion && (
              <span className="invisible font-medium">your voice</span>
            )}
          </span>
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Let everything that has breath praise the Lord.
        </h1>
      </div>

      <div className="mb-12 max-w-xl space-y-4">
        <p className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          Charts for the version you actually play.
        </p>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Upload chords and lyrics. Keep every take straight. Share the
          arrangement that matches the recording — not a random PDF from last
          year.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button asChild size="lg" className="h-11 px-6 text-base">
          <Link href="/auth/login">Upload a song</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11 px-6 text-base">
          <Link href="/songs">Browse charts</Link>
        </Button>
      </div>
    </section>
  );
}
