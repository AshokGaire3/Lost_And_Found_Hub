import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Lightbulb, Heart, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyContent {
  type: "quote" | "tip" | "story" | "fact";
  title: string;
  content: string;
  author?: string;
}

const DailyContent = () => {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch daily content from AI or API
  const fetchDailyContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get cached content for today first
      const today = new Date().toDateString();
      const cached = localStorage.getItem(`daily-content-${today}`);
      
      if (cached) {
        setContent(JSON.parse(cached));
        setLoading(false);
        return;
      }

      // Fetch from AI API (using OpenAI or similar)
      // For now, using a fallback with local content that rotates
      // In production, replace this with actual AI API call
      const response = await generateDailyContent();
      
      if (response) {
        setContent(response);
        // Cache for today
        localStorage.setItem(`daily-content-${today}`, JSON.stringify(response));
      }
    } catch (err) {
      console.error("Error fetching daily content:", err);
      setError("Unable to load content");
      // Use fallback content
      setContent(getFallbackContent());
    } finally {
      setLoading(false);
    }
  };

  // Generate daily content using AI or quotes API
  const generateDailyContent = async (): Promise<DailyContent | null> => {
    try {
      // Try to fetch from AI API first (if configured)
      const aiApiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY;
      
      if (aiApiKey) {
        const aiContent = await generateWithAI(aiApiKey);
        if (aiContent) return aiContent;
      }

      // Fallback to quotes API (free, no key required)
      const quoteContent = await fetchFromQuotesAPI();
      if (quoteContent) return quoteContent;

      // Final fallback to rotating local content
      return getRotatingContent();
    } catch (error) {
      console.error("Error generating content:", error);
      return getRotatingContent();
    }
  };

  // Generate content using AI (OpenAI or Anthropic)
  const generateWithAI = async (apiKey: string): Promise<DailyContent | null> => {
    try {
      const isOpenAI = import.meta.env.VITE_OPENAI_API_KEY;
      const apiUrl = isOpenAI 
        ? "https://api.openai.com/v1/chat/completions"
        : "https://api.anthropic.com/v1/messages";

      const prompt = `Generate a daily content piece for a lost and found service at a university. 
      Create ONE of the following types (rotate daily):
      1. An inspirational quote about reuniting lost items with owners
      2. A helpful tip about preventing loss or finding lost items
      3. An interesting fact about lost and found services
      4. A brief success story about reuniting someone with their lost item
      
      Return ONLY a JSON object with this exact structure:
      {
        "type": "quote" | "tip" | "fact" | "story",
        "title": "Brief title (max 30 characters)",
        "content": "Content text (max 200 characters)",
        "author": "Author name or source"
      }
      
      Make it relevant to university students and campus life.`;

      if (isOpenAI) {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200,
            temperature: 0.7
          })
        });

        if (!response.ok) throw new Error("OpenAI API error");
        
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return content as DailyContent;
      } else {
        // Anthropic Claude API
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 200,
            messages: [{ role: "user", content: prompt }]
          })
        });

        if (!response.ok) throw new Error("Anthropic API error");
        
        const data = await response.json();
        const content = JSON.parse(data.content[0].text);
        return content as DailyContent;
      }
    } catch (error) {
      console.error("AI API error:", error);
      return null;
    }
  };

  // Fetch from free quotes API
  const fetchFromQuotesAPI = async (): Promise<DailyContent | null> => {
    try {
      // Use quotable.io - free, no API key required
      const response = await fetch("https://api.quotable.io/random?tags=wisdom|success|life");
      
      if (!response.ok) throw new Error("Quotes API error");
      
      const data = await response.json();
      
      // Transform quote to match our content format with lost & found context
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const contentTypes = ["quote", "tip", "fact", "story"];
      const type = contentTypes[dayOfYear % contentTypes.length] as DailyContent["type"];

      if (type === "quote") {
        return {
          type: "quote",
          title: "Daily Inspiration",
          content: `"${data.content}" - This reminds us that every lost item has a story, and we're here to help write happy endings.`,
          author: data.author
        };
      }

      // For other types, use rotating content
      return getRotatingContent();
    } catch (error) {
      console.error("Quotes API error:", error);
      return null;
    }
  };

  // Get rotating local content (fallback)
  const getRotatingContent = (): DailyContent => {
    const contentTypes: DailyContent[] = [
      {
        type: "quote",
        title: "Daily Inspiration",
        content: "Every lost item has a story, and every found item brings a smile. Together, we reunite what matters most.",
        author: "Lost & Found NKU"
      },
      {
        type: "tip",
        title: "Daily Tip",
        content: "Add a label with your contact information to your belongings. It's the fastest way to get your items back!",
        author: "Lost & Found NKU"
      },
      {
        type: "fact",
        title: "Did You Know?",
        content: "Over 90% of lost items with contact information are successfully returned to their owners within 48 hours.",
        author: "Lost & Found Statistics"
      },
      {
        type: "story",
        title: "Success Story",
        content: "Last week, we helped reunite a student with their lost laptop containing important research. The owner had labeled it with their email, making the reunion quick and easy!",
        author: "NKU Community"
      },
      {
        type: "tip",
        title: "Prevention Tip",
        content: "Take a photo of your valuable items and save it. If you lose something, having a photo helps staff identify it faster.",
        author: "Lost & Found NKU"
      },
      {
        type: "fact",
        title: "Campus Stat",
        content: "The most commonly lost items on campus are: keys, phones, water bottles, and backpacks. Label them to increase your chances of recovery!",
        author: "NKU Lost & Found"
      },
      {
        type: "tip",
        title: "Quick Tip",
        content: "Check multiple lost & found locations on campus: Student Union, Library, and main academic buildings. Items are often turned in to the nearest location.",
        author: "Lost & Found NKU"
      }
    ];

    // Rotate content based on day of year to ensure daily variety
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return contentTypes[dayOfYear % contentTypes.length];
  };

  // Fallback content if API fails
  const getFallbackContent = (): DailyContent => {
    return {
      type: "tip",
      title: "Daily Tip",
      content: "Always check the Lost & Found within 48 hours of losing an item. Most items are found and reported quickly!",
      author: "Lost & Found NKU"
    };
  };

  useEffect(() => {
    fetchDailyContent();
  }, []);

  const handleRefresh = () => {
    // Clear cache and fetch new content
    const today = new Date().toDateString();
    localStorage.removeItem(`daily-content-${today}`);
    fetchDailyContent();
  };

  const getIcon = () => {
    switch (content?.type) {
      case "quote":
        return <Heart className="h-6 w-6" />;
      case "tip":
        return <Lightbulb className="h-6 w-6" />;
      case "story":
        return <Sparkles className="h-6 w-6" />;
      case "fact":
        return <TrendingUp className="h-6 w-6" />;
      default:
        return <Lightbulb className="h-6 w-6" />;
    }
  };

  const getBgColor = () => {
    switch (content?.type) {
      case "quote":
        return "bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200";
      case "tip":
        return "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200";
      case "story":
        return "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200";
      case "fact":
        return "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200";
      default:
        return "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading daily content...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !content) {
    return (
      <Card className="border-2">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${getBgColor()}`}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background/50 rounded-lg">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{content?.title}</h3>
              {content?.author && (
                <p className="text-sm text-muted-foreground">— {content.author}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="shrink-0"
            title="Refresh content"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-lg text-foreground leading-relaxed">{content?.content}</p>
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            💡 This content updates daily to bring you tips, stories, and inspiration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyContent;

