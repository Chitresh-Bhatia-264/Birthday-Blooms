
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { generateImage, GenerateImageInput } from '@/ai/flows/generate-image';
import { generateWishes, GenerateWishesInput } from '@/ai/flows/generate-wishes';
import { generateCardIdea, GenerateCardIdeaInput } from '@/ai/flows/generate-card-idea';
import { generateTimelineCard, GenerateTimelineCardInput } from '@/ai/flows/generate-timeline-card';
import { generateTranslation, GenerateTranslationInput } from '@/ai/flows/generate-translation';
import { generatePersonalityCard, GeneratePersonalityCardInput } from '@/ai/flows/generate-personality-card';
import { generateStickerCard, GenerateStickerCardInput } from '@/ai/flows/generate-sticker-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2, MessagesSquare, Lightbulb, Type, Languages, QrCode, Download, Image as ImageIcon, Plus, Trash2, CalendarDays, UserCheck, Sticker, PartyPopper, Cake, Gift, Clapperboard, Users, Heart, HeartPulse, Paintbrush, CircleDot, Flower2, Gamepad2, Trees, Castle } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QRCode from 'qrcode.react';
import { useAuth } from '@/hooks/use-auth';
import { addCreation } from '@/services/creations';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const recipientTypes = ['friend', 'mother', 'father', 'sibling', 'partner', 'crush', 'teacher', 'colleague'] as const;
const moodTypes = ['funny', 'emotional', 'poetic', 'formal', 'casual', 'inspirational', 'shayari', 'ghazal'] as const;
type Recipient = typeof recipientTypes[number];
type Mood = typeof moodTypes[number];

type FontStyle = 'calligraphy' | 'handwritten' | 'playful' | 'modern';
const fontStyles: { name: FontStyle, label: string }[] = [
    { name: 'calligraphy', label: 'Calligraphy' },
    { name: 'handwritten', label: 'Handwritten' },
    { name: 'playful', label: 'Playful' },
    { name: 'modern', label: 'Modern' },
];

const languages = ['English', 'Spanish', 'Hindi', 'Urdu', 'French', 'German'] as const;
type Language = typeof languages[number];

type TimelineEvent = {
    id: number;
    year: string;
    description: string;
}

const personalityTypes = ['Introvert', 'Extrovert', 'Ambivert'];
const humorTypes = ['Witty', 'Silly', 'Sarcastic', 'Dark'];

const themes: { name: string; label: string; icon: React.ReactNode; hint: string; }[] = [
    // Classic & Popular
    { name: 'Confetti and Balloons', label: 'Confetti & Balloons', icon: <PartyPopper />, hint: 'confetti balloons' },
    { name: 'Cakes and Candles', label: 'Cakes & Candles', icon: <Cake />, hint: 'birthday cake' },
    { name: 'Birthday Presents', label: 'Birthday Presents', icon: <Gift />, hint: 'gift boxes' },
    { name: 'Party Hats and Streamers', label: 'Party Hats & Streamers', icon: <Clapperboard />, hint: 'party streamers' },
    { name: 'Colorful Typography', label: 'Colorful Typography', icon: <Type />, hint: 'happy birthday typography' },
    // Relationship-Based
    { name: 'Best Friend Forever', label: 'Best Friend Forever', icon: <Users />, hint: 'best friends' },
    { name: 'For Mom/Dad', label: 'For Mom/Dad', icon: <Heart />, hint: 'loving parents' },
    { name: 'Romantic', label: 'Romantic', icon: <HeartPulse />, hint: 'romantic hearts' },
    // Artistic & Aesthetic
    { name: 'Watercolor Backgrounds', label: 'Watercolor Backgrounds', icon: <Paintbrush />, hint: 'watercolor background' },
    { name: 'Minimalistic White Space', label: 'Minimalistic', icon: <CircleDot />, hint: 'minimalist design' },
    { name: 'Floral Elegance', label: 'Floral Elegance', icon: <Flower2 />, hint: 'elegant flowers' },
    // Modern & Fun
    { name: 'Gaming Theme', label: 'Gaming Theme', icon: <Gamepad2 />, hint: 'video game' },
    // Fantasy & Whimsical
    { name: 'Starry Night Galaxy', label: 'Starry Galaxy', icon: <Sparkles />, hint: 'galaxy stars' },
    { name: 'Magical Forest', label: 'Magical Forest', icon: <Trees />, hint: 'magical forest' },
    { name: 'Fairy Tale Castle', label: 'Fairy Tale Castle', icon: <Castle />, hint: 'fairy tale castle' },
];

export default function Home() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<string>('A vibrant cake explosion');
  const [recipient, setRecipient] = useState<Recipient>('friend');
  const [mood, setMood] = useState<Mood>('casual');
  const [age, setAge] = useState<number | undefined>();
  const [fontStyle, setFontStyle] = useState<FontStyle>('modern');
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [stickerPrompt, setStickerPrompt] = useState('');
  const [stickerMessage, setStickerMessage] = useState('Happy Birthday!');
  const [language, setLanguage] = useState<Language>('English');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([{id: 1, year: '2010', description: 'First met'}]);

  // Personality Quiz State
  const [hobby, setHobby] = useState('');
  const [personality, setPersonality] = useState(personalityTypes[0]);
  const [humor, setHumor] = useState(humorTypes[0]);
  const [snack, setSnack] = useState('');
  
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  const [isGeneratingPersonality, setIsGeneratingPersonality] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSticker, setIsGeneratingSticker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('Brewing up some magic...');
  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const themeParam = params.get('theme');
        const messageParam = params.get('message');
        const fontStyleParam = params.get('fontStyle');

        if (themeParam && messageParam && fontStyleParam) {
            const decodedMessage = decodeURIComponent(messageParam);
            const generationParams = {
                theme: decodeURIComponent(themeParam),
                message: decodedMessage,
                fontStyle: fontStyleParam as FontStyle,
            };
            setTheme(generationParams.theme);
            setMessage(generationParams.message);
            setFontStyle(generationParams.fontStyle);
            handleGenerateImage(generationParams);
        }
        setShareUrl(`${window.location.origin}${window.location.pathname}?theme=${encodeURIComponent(theme)}&message=${encodeURIComponent(message)}&fontStyle=${encodeURIComponent(fontStyle)}`);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setShareUrl(`${window.location.origin}${window.location.pathname}?theme=${encodeURIComponent(theme)}&message=${encodeURIComponent(message)}&fontStyle=${encodeURIComponent(fontStyle)}`);
    }
  }, [theme, message, fontStyle]);

  const handleGenerateWish = async () => {
    setIsGeneratingWish(true);
    try {
      const input: GenerateWishesInput = { recipient, mood };
      if (age) {
        input.age = age;
      }
      const result = await generateWishes(input);
      if (result?.wish) {
        setMessage(result.wish);
      } else {
        throw new Error("Could not generate a wish.");
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: "Wish Generation Failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsGeneratingWish(false);
    }
  };

  const handleGenerateIdea = async () => {
    if (!ideaPrompt) {
        toast({ title: "Prompt is empty", description: "Please describe your card idea.", variant: "destructive" });
        return;
    }
    setIsGeneratingIdea(true);
    try {
      const result = await generateCardIdea({ prompt: ideaPrompt });
      if (result?.theme && result?.message) {
        setTheme(result.theme);
        setMessage(result.message);
        toast({ title: "Idea Generated!", description: "Theme and message have been updated." });
      } else {
        throw new Error("Could not generate an idea.");
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: "Idea Generation Failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const handleGenerateTimeline = async () => {
    const validEvents = timelineEvents.filter(e => e.year && e.description);
    if (validEvents.length === 0) {
        toast({ title: "No events", description: "Please add at least one timeline event.", variant: "destructive" });
        return;
    }
    setIsGeneratingTimeline(true);
    try {
      const result = await generateTimelineCard({ events: validEvents });
      if (result?.theme && result?.message) {
        setTheme(result.theme);
        setMessage(result.message);
        toast({ title: "Timeline Idea Generated!", description: "Theme and message have been updated." });
      } else {
        throw new Error("Could not generate a timeline idea.");
      }
    } catch (error: any) {
        console.error(error);
        toast({ title: "Timeline Generation Failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
        setIsGeneratingTimeline(false);
    }
  }

  const handleGeneratePersonalityCard = async () => {
    if (!hobby || !personality || !humor || !snack) {
      toast({ title: "Quiz Incomplete", description: "Please answer all personality quiz questions.", variant: "destructive" });
      return;
    }
    setIsGeneratingPersonality(true);
    try {
      const input: GeneratePersonalityCardInput = { hobby, personality, humor, snack };
      const result = await generatePersonalityCard(input);
      if (result?.theme && result?.message) {
        setTheme(result.theme);
        setMessage(result.message);
        toast({ title: "Personality Card Generated!", description: "Theme and message have been updated based on the quiz." });
      } else {
        throw new Error("Could not generate a personality-based card.");
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: "Personality Card Generation Failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsGeneratingPersonality(false);
    }
  };

  const handleTranslate = async () => {
    if (!message) {
        toast({ title: "Message is empty", description: "Please write a message to translate.", variant: "destructive" });
        return;
    }
    setIsTranslating(true);
    try {
        const input: GenerateTranslationInput = { message, language };
        const result = await generateTranslation(input);
        if (result?.translatedMessage) {
            setMessage(result.translatedMessage);
            toast({ title: "Message Translated!", description: `Your message has been translated to ${language}.` });
        } else {
            throw new Error("Could not translate the message.");
        }
    } catch (error: any) {
        console.error(error);
        toast({ title: "Translation Failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
        setIsTranslating(false);
    }
  };

  const handleGenerateImage = async (urlParams: GenerateImageInput | null = null) => {
    const currentMessage = urlParams ? urlParams.message : message;
    if (!currentMessage) {
      toast({ title: "Message is empty", description: "Please write a birthday message or generate one with AI.", variant: "destructive" });
      return;
    }

    const currentTheme = urlParams ? urlParams.theme : theme;
     if (!currentTheme) {
      toast({ title: "Theme is empty", description: "Please describe a theme for your card.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setProgressText('Brewing up some magic...');
    const generationInput = urlParams ? urlParams : { theme: currentTheme, message: currentMessage, fontStyle };
    runGeneration(generationInput);
  };
  
  const handleGenerateStickerImage = async () => {
    if (!stickerPrompt) {
      toast({ title: "Sticker description is empty", description: "Please describe the sticker you want to create.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setProgressText('Creating your sticker card...');
    setIsGeneratingSticker(true);
    
    try {
        const result = await generateStickerCard({ description: stickerPrompt, message: stickerMessage });
        if (!result?.imageDataUri) {
          throw new Error("Image generation failed to return data.");
        }
        
        if (user && user.uid === 'demouser123') {
            setGeneratedImageUri(result.imageDataUri);
            setIsLoading(false);
            setProgress(100);
            toast({ title: "Sticker Card Generated!", description: "As a demo user, your image is displayed here but not saved." });
            return;
        }

        if (user) {
          try {
            setProgress(60);
            setProgressText('Uploading sticker securely...');
            const imageUrl = await uploadImageToStorage(result.imageDataUri);

            setProgress(80);
            setProgressText('Saving your creation...');
            const creationTitle = stickerPrompt.substring(0, 30) + (stickerPrompt.length > 30 ? '...' : '');
            await addCreation({
                title: creationTitle,
                imageUrl: imageUrl,
                theme: 'sticker', // Special theme type for stickers
                message: stickerMessage,
                fontStyle: 'playful', // Default font for stickers
            }, user.uid);
            
            setProgress(100);
            toast({ title: "Creation Saved!", description: "Your sticker card has been saved to your dashboard." });
            router.push('/dashboard');
          } catch (uploadError) {
            console.warn("Cloud storage upload not configured or failed, showing image directly:", uploadError);
            setGeneratedImageUri(result.imageDataUri);
            setIsLoading(false);
            setProgress(100);
            toast({ title: "Sticker Card Generated!", description: "Your card is ready to download or share!" });
          }
        } else {
             setGeneratedImageUri(result.imageDataUri);
             setIsLoading(false);
             setProgress(100);
             toast({ title: "Sticker Card Generated!", description: "Sign in to save your creations." });
        }

    } catch (error: any) {
        console.error(error);
        toast({ title: "Sticker Generation Failed", description: error.message || "Something went wrong.", variant: "destructive" });
        setIsLoading(false);
        setProgress(0);
    } finally {
        setIsGeneratingSticker(false);
    }
  };

  const uploadImageToStorage = async (dataUri: string): Promise<string> => {
      if (!user) throw new Error("User not authenticated for upload.");
      
      const authToken = user.uid;
      
      const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ dataUri }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
      }

      const { url } = await response.json();
      return url;
  };

  const runGeneration = async (input: GenerateImageInput) => {
    try {
        setProgress(30);
        setProgressText('Generating image with AI...');
        
        const imageResult = await generateImage(input);
        
        if (!imageResult?.imageDataUri) {
          throw new Error("Image generation failed to return data.");
        }

        if (!user || user.uid === 'demouser123') {
            setGeneratedImageUri(imageResult.imageDataUri);
            setIsLoading(false);
            setProgress(100);
            const description = !user 
                ? "Sign in to save your creations." 
                : "As a demo user, your image is displayed here but not saved.";
            toast({ title: "Image Generated!", description });
            return;
        }
        
        try {
          setProgress(60);
          setProgressText('Uploading image securely...');
          
          const imageUrl = await uploadImageToStorage(imageResult.imageDataUri);

          setProgress(80);
          setProgressText('Saving your creation...');
          
          const creationTitle = input.message.substring(0, 30) + (input.message.length > 30 ? '...' : '');
          await addCreation({
              title: creationTitle,
              imageUrl: imageUrl,
              theme: input.theme,
              message: input.message,
              fontStyle: input.fontStyle,
          }, user.uid);

          setProgress(100);
          toast({ title: "Creation Saved!", description: "Your card has been saved to your dashboard." });
          router.push('/dashboard');
        } catch (uploadError) {
          console.warn("Cloud storage upload not configured or failed, showing image directly:", uploadError);
          setGeneratedImageUri(imageResult.imageDataUri);
          setIsLoading(false);
          setProgress(100);
          toast({ title: "Image Generated!", description: "Your card is ready to download or share!" });
        }

      } catch (error: any) {
        console.error(error);
        toast({ title: "Generation Failed", description: error.message || "Something went wrong. Please try again.", variant: "destructive" });
        setIsLoading(false);
        setProgress(0);
      }
  }

  const handleFullReset = () => {
    if (typeof window !== 'undefined') {
        setMessage('');
        setTheme('A vibrant cake explosion');
        setRecipient('friend');
        setMood('casual');
        setFontStyle('modern');
        setIdeaPrompt('');
        setLanguage('English');
        setGeneratedImageUri(null);
        setProgress(0);
        setIsLoading(false);
        const currentUrl = new URL(window.location.href);
        if (currentUrl.search !== '') {
            currentUrl.search = '';
            window.history.pushState({}, '', currentUrl.toString());
        }
    }
  };

  const handleDownload = (uri: string, filename: string) => {
    if (typeof window !== "undefined") {
        const link = document.createElement("a");
        link.href = uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };
  
    const addTimelineEvent = () => {
        setTimelineEvents([...timelineEvents, { id: Date.now(), year: '', description: ''}]);
    }
    const removeTimelineEvent = (id: number) => {
        setTimelineEvents(timelineEvents.filter(e => e.id !== id));
    }
    const updateTimelineEvent = (id: number, field: 'year' | 'description', value: string) => {
        setTimelineEvents(timelineEvents.map(e => e.id === id ? {...e, [field]: value} : e));
    }


  if (generatedImageUri) {
    return (
      <div className="container py-10 flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-center">Your Birthday Image is Ready!</h1>
        <Card className="w-full max-w-2xl overflow-hidden shadow-2xl">
            <CardContent className="p-0 relative">
                <Image src={generatedImageUri} alt="Generated birthday image" width={1024} height={1024} className="w-full aspect-square bg-black" />
            </CardContent>
            <CardFooter className="p-4 bg-muted/50 flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => handleDownload(generatedImageUri, 'birthday_bloom_image.png')}><Download className="mr-2" /> Download Image</Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button disabled={!shareUrl}>Share</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                        <DialogTitle>Share your creation</DialogTitle>
                        <DialogDescription>
                            Anyone with this link or QR code will be able to see your generated card.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center gap-4 p-4">
                           {shareUrl && <QRCode value={shareUrl} size={256} />}
                           <p className="text-sm text-muted-foreground mt-2">Scan this code to view the card.</p>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Input id="share-link" value={shareUrl} readOnly />
                            <Button onClick={() => {
                                if (typeof navigator !== 'undefined') {
                                    navigator.clipboard.writeText(shareUrl);
                                    toast({ title: "Link Copied!"});
                                }
                            }}>Copy</Button>
                        </div>
                    </DialogContent>
                </Dialog>
                <Button variant="ghost" onClick={handleFullReset}>Create Another</Button>
            </CardFooter>
        </Card>
      </div>
    )
  }

  if (isLoading) {
      return (
        <div className="container py-10 flex flex-col items-center justify-center gap-8 h-[calc(100vh-4rem)]">
            <Wand2 className="h-16 w-16 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold">{progressText}</h2>
            <p className="text-muted-foreground">Your birthday image is being generated.</p>
            <Progress value={progress} className="w-full max-w-md" />
        </div>
      );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-accent">
                Create a Magical Birthday Image
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Describe your idea, choose a theme, add a message and let our AI do the rest!
            </p>
        </div>

        <Card className="shadow-xl bg-card/70">
          <CardContent className="p-6 grid gap-8">
            <div className="grid gap-4">
              <Label className="text-lg font-semibold flex items-center gap-2"><Lightbulb /> Card Idea Generator</Label>
              <p className="text-sm text-muted-foreground">How are you feeling? Describe the sentiment you want to express, and we'll design a card. E.g., "I want to say sorry and happy birthday together."</p>
              <div className="flex gap-2">
                <Input 
                  id="idea-prompt" 
                  placeholder="Enter a feeling or an idea..." 
                  value={ideaPrompt} 
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                  disabled={isGeneratingIdea}
                />
                <Button onClick={handleGenerateIdea} disabled={isGeneratingIdea || !ideaPrompt}>
                  <Wand2 className="mr-2" />
                  {isGeneratingIdea ? 'Generating...' : 'Generate Idea'}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-4">
              <Label className="text-lg font-semibold flex items-center gap-2"><Sticker /> Sticker Card Generator</Label>
              <p className="text-sm text-muted-foreground">Describe a sticker you want to create, and we'll generate a card with it. E.g., "a cute cat wearing a party hat".</p>
              <div className="grid gap-2">
                 <Label htmlFor="sticker-prompt">Sticker Description</Label>
                <Input 
                  id="sticker-prompt" 
                  placeholder="e.g., A happy unicorn eating a birthday cake" 
                  value={stickerPrompt} 
                  onChange={(e) => setStickerPrompt(e.target.value)}
                  disabled={isGeneratingSticker}
                />
              </div>
               <div className="grid gap-2">
                 <Label htmlFor="sticker-message">Message</Label>
                 <Input 
                    id="sticker-message" 
                    value={stickerMessage} 
                    onChange={(e) => setStickerMessage(e.target.value)}
                    disabled={isGeneratingSticker}
                 />
               </div>
              <Button onClick={handleGenerateStickerImage} disabled={isGeneratingSticker || !stickerPrompt}>
                  <Wand2 className="mr-2" />
                  {isGeneratingSticker ? 'Generating...' : 'Generate Sticker Card'}
              </Button>
            </div>

            <Separator />

            <div className="grid gap-4">
                <Label className="text-lg font-semibold flex items-center gap-2"><CalendarDays /> Timeline Card Generator</Label>
                <p className="text-sm text-muted-foreground">Add memorable years and events to create a nostalgic timeline card.</p>
                <div className="grid gap-3">
                    {timelineEvents.map((event, index) => (
                        <div key={event.id} className="flex items-center gap-2">
                           <Input 
                             type="text"
                             placeholder="Year"
                             value={event.year}
                             onChange={(e) => updateTimelineEvent(event.id, 'year', e.target.value)}
                             className="w-24"
                           />
                           <Input 
                             type="text"
                             placeholder={`Event ${index + 1} description`}
                             value={event.description}
                             onChange={(e) => updateTimelineEvent(event.id, 'description', e.target.value)}
                           />
                           <Button variant="ghost" size="icon" onClick={() => removeTimelineEvent(event.id)} disabled={timelineEvents.length <= 1}>
                                <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={addTimelineEvent}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                    </Button>
                     <Button onClick={handleGenerateTimeline} disabled={isGeneratingTimeline}>
                        <Wand2 className="mr-2" />
                        {isGeneratingTimeline ? 'Generating...' : 'Generate Timeline Idea'}
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="grid gap-4">
                <Label className="text-lg font-semibold flex items-center gap-2"><UserCheck /> Personality Quiz</Label>
                <p className="text-sm text-muted-foreground">Answer a few questions about the person to generate a card tailored to their personality.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="hobby">Favorite Hobby?</Label>
                        <Input id="hobby" value={hobby} onChange={(e) => setHobby(e.target.value)} placeholder="e.g., Reading, gaming, hiking" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="personality">Introvert or Extrovert?</Label>
                         <Select value={personality} onValueChange={(v) => setPersonality(v)}>
                           <SelectTrigger id="personality">
                             <SelectValue placeholder="Select personality" />
                           </SelectTrigger>
                           <SelectContent>
                             {personalityTypes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                           </SelectContent>
                         </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="humor">Favorite type of humor?</Label>
                         <Select value={humor} onValueChange={(v) => setHumor(v)}>
                           <SelectTrigger id="humor">
                             <SelectValue placeholder="Select humor type" />
                           </SelectTrigger>
                           <SelectContent>
                             {humorTypes.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                           </SelectContent>
                         </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="snack">Go-to snack?</Label>
                        <Input id="snack" value={snack} onChange={(e) => setSnack(e.target.value)} placeholder="e.g., Popcorn, chocolate, chips" />
                    </div>
                </div>
                <Button onClick={handleGeneratePersonalityCard} disabled={isGeneratingPersonality}>
                    <Wand2 className="mr-2" />
                    {isGeneratingPersonality ? 'Generating...' : 'Generate from Personality'}
                </Button>
            </div>
            
            <Separator />

            <div className="grid gap-4">
                <Label htmlFor="theme" className="text-lg font-semibold flex items-center gap-2"><Sparkles /> Describe or Pick a Theme</Label>
                <Input 
                    id="theme"
                    placeholder="e.g., A watercolor painting of a starry night"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                />
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {themes.map((t) => (
                        <Button 
                            key={t.name}
                            variant="outline" 
                            className={cn("flex-col h-20", theme === t.name && "border-primary ring-2 ring-primary")}
                            onClick={() => setTheme(t.name)}
                            data-ai-hint={t.hint}
                        >
                            {t.icon}
                            <span className="mt-1 text-xs text-center">{t.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6">
                <div className="grid gap-4">
                    <Label htmlFor="message" className="text-lg font-semibold flex items-center gap-2"><MessagesSquare /> Write or Generate a Message</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       <div>
                         <Label className="font-normal text-muted-foreground">For who is this message?</Label>
                         <Select value={recipient} onValueChange={(v) => setRecipient(v as Recipient)}>
                           <SelectTrigger>
                             <SelectValue placeholder="Select recipient" />
                           </SelectTrigger>
                           <SelectContent>
                             {recipientTypes.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                           </SelectContent>
                         </Select>
                       </div>
                        <div>
                          <Label className="font-normal text-muted-foreground">What's the mood?</Label>
                           <Select value={mood} onValueChange={(v) => setMood(v as Mood)}>
                           <SelectTrigger>
                             <SelectValue placeholder="Select mood" />
                           </SelectTrigger>
                           <SelectContent>
                             {moodTypes.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                           </SelectContent>
                         </Select>
                       </div>
                       <div>
                         <Label htmlFor="age" className="font-normal text-muted-foreground">Age (optional)</Label>
                         <Input 
                            id="age"
                            type="number"
                            placeholder="e.g., 25"
                            value={age === undefined ? '' : age}
                            onChange={(e) => setAge(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                         />
                       </div>
                    </div>
                     <Button variant="outline" onClick={handleGenerateWish} disabled={isGeneratingWish}>
                        <Wand2 className="mr-2" />
                        {isGeneratingWish ? 'Generating...' : 'Generate with AI'}
                    </Button>
                    <Textarea id="message" placeholder="Happy Birthday, Sarah! Hope you have a wonderful day..." rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
            </div>

            <div className="grid gap-4">
                <Label className="text-lg font-semibold flex items-center gap-2"><Languages /> Translate Message</Label>
                <div className="flex gap-2">
                    <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleTranslate} disabled={isTranslating || !message}>
                        <Wand2 className="mr-2" />
                        {isTranslating ? 'Translating...' : 'Translate'}
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <Label className="text-lg font-semibold flex items-center gap-2"><Type /> Choose a Font Style</Label>
               <Select value={fontStyle} onValueChange={(v) => setFontStyle(v as FontStyle)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font style" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontStyles.map(s => <SelectItem key={s.name} value={s.name} className="capitalize">{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>

          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full text-lg" onClick={() => handleGenerateImage()} disabled={isLoading || authLoading || isGeneratingSticker}>
                <ImageIcon className="mr-2" />
                Generate Themed Image
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
