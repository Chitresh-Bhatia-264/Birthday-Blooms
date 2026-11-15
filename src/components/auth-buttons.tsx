'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

export function AuthButtons() {
  return (
    <Button asChild size="sm">
      <Link href="/create">
        <Wand2 className="mr-2 h-4 w-4" />
        Open Studio
      </Link>
    </Button>
  );
}
