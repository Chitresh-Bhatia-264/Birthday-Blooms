'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Cake,
  Check,
  Languages,
  PartyPopper,
  QrCode,
  Sparkles,
  Sticker,
  Wand2,
} from 'lucide-react';

const features = [
  {
    icon: Wand2,
    title: 'AI Birthday Card Art',
    description:
      'Generate custom illustrated cards—from Mickey Mouse & Spider-Man to floral cakes and castles—using open-source AI models.',
  },
  {
    icon: Sticker,
    title: 'Custom Birthday Stickers',
    description:
      'Turn any fun idea or character into a vibrant die-cut birthday sticker card in seconds.',
  },
  {
    icon: Languages,
    title: 'Multi-Language Wishes & Shayari',
    description:
      'Craft heartfelt, funny, poetic, or shayari wishes and translate them accurately into Hindi, Urdu, Spanish, French, and German.',
  },
  {
    icon: QrCode,
    title: 'Instant QR Code Sharing',
    description:
      'Every card gets a shareable QR code and high-resolution download ready for WhatsApp, print, or digital gifting.',
  },
  {
    icon: PartyPopper,
    title: 'No Sign-Up Required',
    description:
      'Jump straight into the studio and start designing immediately—no account, no login, and no setup needed.',
  },
  {
    icon: Sparkles,
    title: '100% Free Forever',
    description:
      'No subscriptions, no paywalls, and no credit limits—create and download as many birthday cards and stickers as you like.',
  },
];

export default function LandingPage() {
  const router = useRouter();

  // Preserve shared card links like /?theme=... by forwarding them straight to /create
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('theme=')) {
      router.replace(`/create${window.location.search}`);
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-card/60 to-background py-16 md:py-24 px-4">
        <div className="container max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              100% Free • No Login Required
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Craft Magical{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Birthday Cards
              </span>{' '}
              in Seconds
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Design personalized AI birthday cards, custom character stickers, and multilingual
              wishes completely free—no sign-up needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20">
                <Link href="/create">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Open Card Studio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> Free unlimited generations
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> No login or sign-up
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> Instant QR sharing
              </span>
            </div>
          </div>

          {/* Visual Showcase Matching Birthday Bloom Palette */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-accent/20 to-primary/10 blur-2xl" />
            <Card className="relative border-primary/25 bg-card/90 backdrop-blur shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary to-accent text-white pb-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                    <PartyPopper className="h-3.5 w-3.5" />
                    Birthday Bloom Studio
                  </span>
                  <Cake className="h-6 w-6 opacity-90" />
                </div>
                <CardTitle className="text-2xl pt-3 text-white">
                  &ldquo;Happy Birthday, Aarav!&rdquo;
                </CardTitle>
                <CardDescription className="text-white/90">
                  Custom AI illustration • Calligraphy • Hindi &amp; English Wishes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4 bg-background/80">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-primary/15 bg-card p-3">
                    <p className="text-xl font-bold text-primary">Free</p>
                    <p className="text-[11px] text-muted-foreground">Unlimited</p>
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-card p-3">
                    <p className="text-xl font-bold text-primary">6</p>
                    <p className="text-[11px] text-muted-foreground">Languages</p>
                  </div>
                  <div className="rounded-xl border border-primary/15 bg-card p-3">
                    <p className="text-xl font-bold text-primary">QR</p>
                    <p className="text-[11px] text-muted-foreground">Shareable</p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground leading-relaxed">
                  &ldquo;May your year ahead bloom with laughter, bold adventures, and cake worth
                  sharing. Here&apos;s to celebrating you today!&rdquo;
                </div>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/create">Start Creating Free</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-background">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything You Need to Celebrate
            </h2>
            <p className="text-muted-foreground">
              Built with the signature Birthday Bloom warmth—combining AI creativity and effortless
              translation, completely free with no login required.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} className="border-primary/15 bg-card/50 hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{feat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free CTA Banner */}
      <section className="py-16 px-4 bg-gradient-to-b from-secondary/30 to-background border-t border-border/50">
        <div className="container max-w-5xl mx-auto rounded-3xl border border-primary/20 bg-card/80 p-8 md:p-12 text-center shadow-lg space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to Create? It&apos;s <span className="text-primary">100% Free</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Jump straight into the Birthday Card &amp; Sticker Studio—no sign-up or login needed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/create">Launch Card Studio</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-background py-8 px-4">
        <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Birthday Bloom — Free AI Birthday Cards &amp; Stickers
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/create" className="hover:text-primary transition-colors">
              Card Studio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
