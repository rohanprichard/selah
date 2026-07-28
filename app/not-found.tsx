import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-24">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
