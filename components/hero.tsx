"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Music2, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left"
        >
          <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-4 py-1 text-primary">
            Worship planning, in one place
          </Badge>
          <div className="space-y-5">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Pause. Prepare. <span className="text-primary">Worship.</span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Organize charts, build a setlist, and prepare each musician before rehearsal.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/20">
              <Link href="/auth/sign-up">
                Create a team space <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base">
              <Link href="/songs">
                <PlayCircle className="mr-2 h-4 w-4" /> Browse charts
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Use Selah for planning, rehearsal, and live performance.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <Card className="overflow-hidden border-primary/15 bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-3 border-b bg-muted/50 px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Music2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Sunday worship</p>
                <p className="text-xs text-muted-foreground">Four songs · Key D</p>
              </div>
              <Badge className="ml-auto">Ready</Badge>
            </div>
            <div className="space-y-3 p-5 sm:p-6">
              <PreviewRow number="01" title="With a Thousand Hallelujahs" keyName="D" current />
              <PreviewRow number="02" title="Build My Life" keyName="E" />
              <PreviewRow number="03" title="Goodness of God" keyName="G" />
            </div>
          </Card>
          <div className="absolute -inset-8 -z-10 rounded-full bg-primary/15 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}

function PreviewRow({
  number,
  title,
  keyName,
  current = false,
}: {
  number: string;
  title: string;
  keyName: string;
  current?: boolean;
}) {
  return (
    <div className={current ? "flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3" : "flex items-center gap-3 rounded-xl p-3"}>
      <span className="text-sm font-semibold tabular-nums text-muted-foreground">{number}</span>
      <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
      <Badge variant={current ? "default" : "secondary"}>Key {keyName}</Badge>
    </div>
  );
}
