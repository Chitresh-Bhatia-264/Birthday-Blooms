
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Film, Share2, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { getCreations, Creation } from '@/services/creations';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getCreations(user.uid)
        .then(data => {
          setCreations(data);
          setLoading(false);
        })
        .catch(error => {
            console.error("Failed to fetch creations:", error);
            setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">My Creations</h1>
                <Button asChild>
                    <Link href="/">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Creation
                    </Link>
                </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <Skeleton className="w-full aspect-video rounded-t-lg" />
                        <CardContent className="p-4">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-16" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Creations</h1>
        <Button asChild>
            <Link href="/">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Creation
            </Link>
        </Button>
      </div>
      
      {creations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creations.map((creation) => (
            <Card key={creation.id} className="flex flex-col">
              <CardHeader className="p-0">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <Image src={creation.imageUrl} alt={creation.title} width={600} height={400} className="object-cover w-full h-full transition-transform hover:scale-105" />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                 <CardTitle className="text-lg">{creation.title}</CardTitle>
                <CardDescription>Created on {new Date(creation.createdAt).toLocaleDateString()}</CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4"/>Share</Button>
                <Button size="sm"><Edit className="mr-2 h-4 w-4" />Edit</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/20 p-12 text-center mt-16 bg-card">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Film className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">No creations yet</h3>
            <p className="text-muted-foreground mb-4">You haven&apos;t created any birthday images.</p>
            <Button asChild>
                <Link href="/">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create your first image
                </Link>
            </Button>
        </div>
      )}
    </div>
  );
}
