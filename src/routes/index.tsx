import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RefreshCw, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LENGTH = 6;
const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 60;
const LOCK_KEY = "captcha_lock_until";

function generateCaptcha() {
  let s = "";
  for (let i = 0; i < LENGTH; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

function CaptchaCanvas({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "hsl(220, 30%, 96%)");
    grad.addColorStop(1, "hsl(260, 30%, 92%)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Noise dots
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `hsla(${Math.random() * 360}, 60%, 60%, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `hsla(${Math.random() * 360}, 50%, 55%, 0.45)`;
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      ctx.moveTo(Math.random() * W, Math.random() * H);
      ctx.bezierCurveTo(
        Math.random() * W,
        Math.random() * H,
        Math.random() * W,
        Math.random() * H,
        Math.random() * W,
        Math.random() * H,
      );
      ctx.stroke();
    }

    // Characters
    const charW = W / (text.length + 1);
    text.split("").forEach((ch, i) => {
      ctx.save();
      const x = charW * (i + 0.8) + (Math.random() - 0.5) * 6;
      const y = H / 2 + (Math.random() - 0.5) * 10;
      const rot = (Math.random() - 0.5) * 0.7;
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.font = `bold ${28 + Math.random() * 10}px ui-monospace, Menlo, monospace`;
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 35%)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={90}
      className="w-full h-auto rounded-lg border border-border"
      aria-label="CAPTCHA image"
    />
  );
}

function Index() {
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "locked" | "unlocked">(
    "idle",
  );
  const [secondsLeft, setSecondsLeft] = useState(0);

  const locked = secondsLeft > 0;

  // Restore lock state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const until = Number(localStorage.getItem(LOCK_KEY) || 0);
    const remaining = Math.ceil((until - Date.now()) / 1000);
    if (remaining > 0) {
      setSecondsLeft(remaining);
      setAttempts(MAX_ATTEMPTS);
      setStatus("locked");
    }
  }, []);

  // Countdown tick
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          localStorage.removeItem(LOCK_KEY);
          setAttempts(0);
          setInput("");
          setCaptcha(generateCaptcha());
          setStatus("unlocked");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const refresh = useCallback(() => {
    if (locked) return;
    setCaptcha(generateCaptcha());
    setInput("");
    if (status !== "success") setStatus("idle");
  }, [status, locked]);

  const verify = () => {
    if (locked) return;
    if (input.trim().toUpperCase() === captcha) {
      setStatus("success");
    } else {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCK_SECONDS * 1000;
        localStorage.setItem(LOCK_KEY, String(until));
        setSecondsLeft(LOCK_SECONDS);
        setStatus("locked");
      } else {
        setStatus("error");
        setCaptcha(generateCaptcha());
        setInput("");
      }
    }
  };

  const reset = () => {
    setAttempts(0);
    setStatus("idle");
    setCaptcha(generateCaptcha());
    setInput("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-accent px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Inson ekanligingizni tasdiqlang</h1>
            <p className="text-xs text-muted-foreground">Quyidagi belgilarni kiriting</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <CaptchaCanvas text={captcha} />
            <button
              type="button"
              onClick={refresh}
              disabled={locked}
              className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-md bg-background/80 backdrop-blur border border-border hover:bg-background transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="CAPTCHA-ni yangilash"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verify()}
            placeholder="CAPTCHA ni kiriting"
            disabled={locked || status === "success"}
            maxLength={LENGTH}
            className="text-center tracking-widest font-mono uppercase"
            aria-label="CAPTCHA kiritish maydoni"
          />

          {status === "success" && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Muvaffaqiyatli tasdiqlandi!
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">
              <XCircle className="h-4 w-4" />
              Noto'g'ri. {MAX_ATTEMPTS - attempts} ta urinish qoldi.
            </div>
          )}
          {status === "locked" && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">
              <XCircle className="h-4 w-4" />
              Juda ko'p urinish. {secondsLeft} soniyadan so'ng qayta urinib ko'ring.
            </div>
          )}
          {status === "unlocked" && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Endi qayta urinib ko'rishingiz mumkin.
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refresh}
              disabled={status === "success" || locked}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yangilash
            </Button>
            {status === "success" ? (
              <Button onClick={reset} className="flex-1">
                Qayta boshlash
              </Button>
            ) : (
              <Button onClick={verify} disabled={!input || locked} className="flex-1">
                {locked ? `${secondsLeft}s` : "Tasdiqlash"}
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Urinishlar: {attempts} / {MAX_ATTEMPTS}
          </p>
        </div>
      </Card>
    </main>
  );
}
