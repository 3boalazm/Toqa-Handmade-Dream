import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, Copy, Lock, LockOpen, Quote, Send, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import BrandMark from "@/components/BrandMark";
import { trpc } from "@/lib/trpc";

/**
 * The hidden wishes page.
 *
 * It is not linked from anywhere: the only way in is the discreet dot at the
 * very end of the footer on the home page. On top of that every request needs
 * the shared code, so a visitor who only guesses the address sees nothing.
 */

const CODE_STORAGE_KEY = "toqa_wishes_code";
const MAX_MESSAGE_LENGTH = 500;
const MAX_NAME_LENGTH = 80;

type WishItem = {
  id: string;
  message: string;
  name: string | null;
  createdAt: string | Date;
};

function timeAgo(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { locale: ar, addSuffix: true });
}

function readStoredCode(): string {
  try {
    return window.sessionStorage.getItem(CODE_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeCode(code: string): void {
  try {
    window.sessionStorage.setItem(CODE_STORAGE_KEY, code);
  } catch {
    /* sessionStorage unavailable */
  }
}

function forgetCode(): void {
  try {
    window.sessionStorage.removeItem(CODE_STORAGE_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

export default function Wishes() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [quote, setQuote] = useState<WishItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredCode();
    if (stored) {
      setCode(stored);
      setUnlocked(true);
    }
  }, []);

  const wishes = trpc.wishes.list.useQuery(
    { code },
    { enabled: unlocked && code.length > 0, retry: false },
  );
  const unlock = trpc.wishes.unlock.useMutation();
  const add = trpc.wishes.add.useMutation();

  // A rejected code puts the page back under the lock.
  useEffect(() => {
    if (!wishes.error) return;
    setUnlocked(false);
    setError(wishes.error.message || "الكود مش مظبوط، جرّب تاني.");
  }, [wishes.error]);

  const items: WishItem[] = wishes.data ?? [];

  const handleUnlock = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    unlock.mutate(
      { code: code.trim() },
      {
        onSuccess: () => {
          storeCode(code.trim());
          setUnlocked(true);
        },
        onError: (mutationError) => {
          setError(mutationError.message || "الكود مش مظبوط، جرّب تاني.");
        },
      },
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 3) {
      setError("اكتب أمنيتك الأول — ٣ حروف على الأقل.");
      return;
    }
    setError(null);
    setNotice(null);
    add.mutate(
      {
        code,
        message: trimmed,
        name: name.trim() ? name.trim() : undefined,
      },
      {
        onSuccess: () => {
          setMessage("");
          setName("");
          setNotice("اتسجّلت… شكرًا إنك كتبت.");
          void wishes.refetch();
        },
        onError: (mutationError) => {
          setError(mutationError.message || "مقدرتش أسجّل الأمنية، جرّب تاني.");
        },
      },
    );
  };

  const handleCopy = async (wish: WishItem) => {
    try {
      await navigator.clipboard.writeText(wish.message);
      setCopiedId(wish.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* clipboard blocked by the browser */
    }
  };

  const handleQuote = () => {
    if (!items.length) return;
    const pick = items[Math.floor(Math.random() * items.length)];
    setQuote(pick);
  };

  const handleLock = () => {
    forgetCode();
    setUnlocked(false);
    setCode("");
    setQuote(null);
    setNotice(null);
    setError(null);
  };

  return (
    <div className="wishes-shell" dir="rtl">
      <header className="wishes-topbar">
        <a className="brand-lockup" href="/" onClick={event => { event.preventDefault(); setLocation("/"); }}>
          <BrandMark small />
          <span className="brand-name-wrap">
            <span className="brand-name">تقى</span>
            <span className="brand-caption">مجوهرات هاند ميد</span>
          </span>
        </a>
        <span className="wishes-topbar-note">صفحة داخلية</span>
      </header>

      <main className="wishes-main">
        {!unlocked ? (
          <section className="wishes-lock">
            <span className="wishes-lock-icon"><Lock size={18} strokeWidth={1.4} /></span>
            <h1>أمنيات</h1>
            <p>صفحة داخلية… قول الكود الأول</p>
            <form className="wishes-lock-form" onSubmit={handleUnlock}>
              <input
                type="password"
                value={code}
                onChange={event => setCode(event.target.value)}
                placeholder="الكود"
                aria-label="كود الصفحة"
                autoComplete="off"
              />
              <button className="button button--plum" type="submit" disabled={unlock.isPending || !code.trim()}>
                {unlock.isPending ? "بنفتح…" : "افتح"}
              </button>
            </form>
            {error && <p className="wishes-error">{error}</p>}
          </section>
        ) : (
          <>
            <section className="wishes-head">
              <p className="eyebrow"><span /> حكايات من قلوب</p>
              <h1>أمنيات <span>✳</span></h1>
              <p className="wishes-sub">
                اكتب أمنيتك… وهفضل هنا طول ما الصفحة مفتوحة. كل كلمة بتفرق معانا.
              </p>
            </section>

            <section className="wishes-panel">
              <div className="wishes-panel-head">
                <h2><Sparkles size={15} /> اكتب أمنيتك</h2>
                <span className="wishes-count">{items.length} {items.length === 1 ? "أمنية" : "أمنيات"}</span>
              </div>
              <form onSubmit={handleSubmit}>
                <textarea
                  className="wishes-textarea"
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  maxLength={MAX_MESSAGE_LENGTH}
                  placeholder="اكتب هنا… أي حاجة في بالك"
                  aria-label="نص الأمنية"
                />
                <div className="wishes-form-row">
                  <input
                    className="wishes-input"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    maxLength={MAX_NAME_LENGTH}
                    placeholder="اسمك (اختياري)"
                    aria-label="اسمك"
                  />
                  <span className="wishes-counter">{message.length}/{MAX_MESSAGE_LENGTH}</span>
                  <button className="button button--plum" type="submit" disabled={add.isPending}>
                    <Send size={15} /> {add.isPending ? "بنكتب…" : "سجّل"}
                  </button>
                </div>
              </form>
              {notice && <p className="wishes-notice">{notice}</p>}
              {error && <p className="wishes-error">{error}</p>}
            </section>

            <section className="wishes-board">
              <div className="wishes-panel-head">
                <h2>الأمنيات المسجّلة</h2>
                <div className="wishes-board-tools">
                  <button className="wishes-quote-btn" type="button" onClick={handleQuote} disabled={!items.length}>
                    <Quote size={13} /> اقتباس
                  </button>
                  <button className="wishes-lock-btn" type="button" onClick={handleLock}>
                    <LockOpen size={13} /> اقفل
                  </button>
                </div>
              </div>

              {quote && (
                <div className="wishes-quote-card">
                  <span className="wishes-quote-mark">✳</span>
                  <p>{quote.message}</p>
                  <span className="wishes-quote-by">{quote.name || "حد مجهول"}</span>
                </div>
              )}

              {wishes.isLoading ? (
                <p className="wishes-empty">بنجيب الأمنيات…</p>
              ) : items.length === 0 ? (
                <p className="wishes-empty">لسه مفيش أمنيات… كن أول واحد يكتب.</p>
              ) : (
                <ul className="wishes-list">
                  {items.map(wish => (
                    <li className="wishes-item" key={wish.id}>
                      <span className="wishes-item-star">✳</span>
                      <div className="wishes-item-body">
                        <p className="wishes-item-text">{wish.message}</p>
                        <div className="wishes-item-meta">
                          <span>{wish.name || "حد مجهول"}</span>
                          <span className="wishes-item-dot">·</span>
                          <span>{timeAgo(wish.createdAt)}</span>
                        </div>
                      </div>
                      <button
                        className="wishes-copy"
                        type="button"
                        onClick={() => handleCopy(wish)}
                        aria-label="نسخ الأمنية"
                      >
                        {copiedId === wish.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="wishes-footer">
        <a href="/" onClick={event => { event.preventDefault(); setLocation("/"); }}>رجوع للموقع</a>
        <span>© تقى 2026 · Toqa</span>
      </footer>
    </div>
  );
}
