import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lock, Upload, Send, ImageIcon, Loader2 } from "lucide-react";
import ivanAvatar from "@/assets/ivan-avatar.jpg";
import sofiaAvatar from "@/assets/sofia-avatar.jpg";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type AgentId = "lukas" | "sofia";

const agents: Record<AgentId, { name: string; avatar: string; personality: string }> = {
  lukas: {
    name: "Лукас",
    avatar: ivanAvatar,
    personality: "Лукас — 19 лет, студент колледжа, блогер, серфер, путешественник. Романтик, душа компании, весёлый и позитивный парень.",
  },
  sofia: {
    name: "София",
    avatar: sofiaAvatar,
    personality: "София — 19 лет, студентка Академии художеств в Париже. Подрабатывает фотомоделью. Нежная, чувственная, творческая натура.",
  },
};

export default function AdminPortal() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("lukas");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const verifyPin = async () => {
    setPinLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-admin-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.valid) {
        setAuthenticated(true);
        toast({ title: "✅ Доступ разрешён" });
      } else {
        toast({ title: "❌ Неверный PIN", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка подключения", variant: "destructive" });
    } finally {
      setPinLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Только изображения", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
      setUploadedUrl(null);
      setAnalysisResult("");
    };
    reader.readAsDataURL(file);
  };

  const uploadToStorage = async () => {
    if (!imageBase64) return;
    setUploading(true);
    try {
      const blob = await fetch(imageBase64).then((r) => r.blob());
      const filename = `admin_${Date.now()}.${blob.type.split("/")[1] || "jpg"}`;

      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/admin-media/${filename}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": blob.type,
            "x-upsert": "true",
          },
          body: blob,
        }
      );
      if (res.ok) {
        const url = `${SUPABASE_URL}/storage/v1/object/admin-media/${filename}`;
        setUploadedUrl(url);
        toast({ title: "✅ Загружено в Storage" });
      } else {
        const err = await res.text();
        console.error("Upload error:", err);
        toast({ title: "Ошибка загрузки", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const analyzeImage = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setAnalysisResult("");
    try {
      const agent = agents[selectedAgent];
      const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          pin,
          imageBase64,
          agentName: agent.name,
          agentPersonality: agent.personality,
          language: "ru",
        }),
      });
      const data = await res.json();
      if (data.error) {
        setAnalysisResult(`Ошибка: ${data.error}`);
      } else {
        setAnalysisResult(data.content);
      }
    } catch {
      setAnalysisResult("Ошибка соединения");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <CardTitle>Admin Portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Введите PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyPin()}
            />
            <Button className="w-full" onClick={verifyPin} disabled={pinLoading}>
              {pinLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agent = agents[selectedAgent];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🛠 Admin Portal</h1>

      {/* Agent Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Выбор агента</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          {(Object.keys(agents) as AgentId[]).map((id) => (
            <button
              key={id}
              onClick={() => {
                setSelectedAgent(id);
                setAnalysisResult("");
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selectedAgent === id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <img
                src={agents[id].avatar}
                alt={agents[id].name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="font-medium">{agents[id].name}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Загрузка изображения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <ImageIcon className="mr-2 h-4 w-4" /> Выбрать фото
          </Button>

          {imagePreview && (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 rounded-lg border object-contain"
              />
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={uploadToStorage} disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                  Загрузить в Storage
                </Button>
                <Button onClick={analyzeImage} disabled={analyzing}>
                  {analyzing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                  Анализ от {agent.name}
                </Button>
              </div>
              {uploadedUrl && (
                <p className="text-sm text-muted-foreground break-all">
                  URL: {uploadedUrl}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <img src={agent.avatar} alt="" className="w-8 h-8 rounded-full" />
              Ответ {agent.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={analysisResult}
              readOnly
              className="min-h-[120px] resize-y"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
