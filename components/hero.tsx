"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Music2, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 md:pt-20 pb-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left gap-6"
        >
          <Badge variant="outline" className="px-4 py-1 text-sm border-primary/20 bg-primary/5 text-primary rounded-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="mr-2">✨</span> The new standard for worship teams
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
            Pause. Prepare. <span className="text-primary">Worship.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-[600px] text-pretty">
            Selah is the modern home for your worship team's lyrics and chords.
            Plan setlists, transpose instantly, and step onstage with confidence.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="rounded-full h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              <Link href="/auth/sign-up">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 text-base border-primary/10 hover:bg-primary/5">
              <Link href="/songs">
                <PlayCircle className="mr-2 h-4 w-4" /> Browse Library
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p>Trusted by worship leaders worldwide</p>
          </div>
        </motion.div>

        {/* Visual Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[500px] lg:max-w-none perspective-1000"
        >
          <div className="relative z-10 rotate-y-[-5deg] rotate-x-[5deg] transform-gpu transition-transform hover:rotate-0 duration-500">
            <Card className="glass overflow-hidden border-white/40 shadow-2xl shadow-primary/10">
              <div className="border-b border-white/10 bg-muted/30 p-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="mx-auto h-6 w-1/2 rounded-md bg-white/40" />
              </div>
              <div className="p-6 space-y-6 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="h-8 w-3/4 rounded-lg bg-primary/10" />
                  <div className="h-4 w-1/2 rounded-lg bg-muted-foreground/10" />
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="secondary">Key: G</Badge>
                    <Badge variant="secondary">4/4</Badge>
                    <Badge variant="secondary">72 BPM</Badge>
                  </div>

                  <div className="rounded-lg border border-primary/10 bg-background/50 p-4 space-y-3 font-mono text-sm">
                    <div>
                      <span className="text-primary font-bold">G</span>{'                         '}<span className="text-primary font-bold">D</span>
                    </div>
                    <div className="text-foreground/80">
                      With a thousand hallelujahs
                    </div>
                    <div className="mt-4">
                      <span className="text-primary font-bold">A</span>{'                  '}<span className="text-primary font-bold">Bm</span>{'   '}<span className="text-primary font-bold">A</span>
                    </div>
                    <div className="text-foreground/80">
                      We magnify Your Name
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute right-2 top-2 rounded-xl bg-white p-3 shadow-xl dark:bg-zinc-900 border border-border/50"
            >
              <Music2 className="h-6 w-6 text-accent" />
            </motion.div>
          </div>

          {/* Background Glow */}
          <div className="absolute -inset-4 -z-10 bg-gradient-to-tr from-primary/20 via-accent/20 to-primary/10 blur-3xl opacity-50 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
