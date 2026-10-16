import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  Gem,
  Menu,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import BrandMark from "@/components/BrandMark";

const braceletImage = "/images/bracelet.jpg";
const orderMessage = encodeURIComponent("مرحبًا، حابة أستفسر عن سوار الخرز البنفسجي من براند تقى.");
const whatsappLink = `https://wa.me/?text=${orderMessage}`;

const pieces = [
  { title: "أقراط بنفسجية", note: "تفاصيل صغيرة، حضور كبير", art: "earrings" },
  { title: "عقد من الحكاية", note: "ألوان تختارينها بنفسك", art: "necklace" },
  { title: "سوار على ذوقك", note: "قطعة تتصمّم لك", art: "bracelet" },
];

function PieceIllustration({ type }: { type: string }) {
  return (
    <div className={`piece-art piece-art--${type}`} aria-hidden="true">
      <div className="art-halo" />
      {type === "earrings" && (
        <div className="earring-pair">
          <span className="earring"><i /><b /><em /></span>
          <span className="earring earring--second"><i /><b /><em /></span>
        </div>
      )}
      {type === "necklace" && (
        <div className="necklace-art">
          {Array.from({ length: 13 }, (_, index) => <i key={index} />)}
          <b />
        </div>
      )}
      {type === "bracelet" && (
        <div className="mini-bracelet">
          {Array.from({ length: 16 }, (_, index) => <i key={index} />)}
          <b />
        </div>
      )}
      <span className="art-sparkle art-sparkle--one">✳</span>
      <span className="art-sparkle art-sparkle--two">✦</span>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell" dir="rtl">
      <div className="announcement-bar">
        <span className="announcement-dot" />
        كل قطعة تُصنع يدويًا… وعلى مهل
        <span className="announcement-star">✳</span>
      </div>

      <header className="site-header">
        <a className="brand-lockup" href="#home" aria-label="تقى، إلى الصفحة الرئيسية" onClick={closeMenu}>
          <BrandMark />
          <span className="brand-name-wrap">
            <span className="brand-name">تقى</span>
            <span className="brand-caption">مجوهرات هاند ميد</span>
          </span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`main-nav${menuOpen ? " main-nav--open" : ""}`} aria-label="القائمة الرئيسية">
          <a href="#story" onClick={closeMenu}>حكايتنا</a>
          <a href="#collection" onClick={closeMenu}>قطع من تقى</a>
          <a href="#details" onClick={closeMenu}>تفاصيل السوار</a>
        </nav>

        <a className="header-order" href={whatsappLink} target="_blank" rel="noreferrer">
          احكي لنا عن قطعتك <ArrowUpLeft size={15} />
        </a>
      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <p className="eyebrow"><span /> حكاية تُلبَس</p>
            <h1>تفاصيل صغيرة،<br /><span>تترك تقى</span> كبيرة.</h1>
            <p className="hero-description">
              إكسسوارات تُصنع باليد، وتُختار بالقلب. أحجار طبيعية وألوان هادئة تتحوّل لقطعة تشبهك.
            </p>
            <div className="hero-actions">
              <a className="button button--plum" href="#details">اكتشفي السوار <ArrowLeft size={17} /></a>
              <a className="text-link" href="#collection">تصفّحي قطعنا <span>←</span></a>
            </div>
            <div className="hero-note">
              <span className="note-icon"><Sparkles size={17} /></span>
              <span>قطعة واحدة في كل مرة.<br /><b>تفاصيلها لا تتكرر.</b></span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-outline" />
            <div className="photo-frame">
              <img src={braceletImage} alt="سوار خرز بأحجار بنفسجية وتفاصيل ذهبية على قماش حريري فاتح" />
              <div className="photo-label"><span>01 / قطعة مميزة</span><span>صُنعت بحب</span></div>
            </div>
            <div className="floating-seal"><BrandMark small /><span>صنع<br />بحب</span></div>
            <span className="visual-star visual-star--one">✳</span>
            <span className="visual-star visual-star--two">✦</span>
          </div>

          <div className="hero-bottomline">
            <span>أحجار • ألوان • حكايات</span>
            <a href="#story">انزلي واكتشفي <span>↓</span></a>
            <span>القاهرة، مصر · صنع يدويًا</span>
          </div>
        </section>

        <section
          className="project-note section-wrap"
          aria-label="ملاحظة خاصة بالمشروع"
          style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              border: "1px dashed var(--color-plum, #76506f)",
              borderRadius: "1.25rem",
              padding: "1.5rem clamp(1rem, 4vw, 2.5rem)",
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(242, 231, 239, 0.75), rgba(255, 250, 244, 0.9))",
            }}
          >
            <p style={{ margin: 0, fontSize: "clamp(1.05rem, 2.5vw, 1.45rem)", lineHeight: 1.9, fontWeight: 600 }}>
              دا هيبقى واحد من أجمل الويبسايتس بتاعة الهاند ميد في مصر كلها لو جبنا فوق الـ 80% :)
            </p>
            <p style={{ margin: "0.65rem 0 0", fontSize: "0.95rem", lineHeight: 1.8, opacity: 0.82 }}>
              وأول يوم مناسب بعدها هننزل نشتري إكسسوارات ✨
            </p>
          </div>
        </section>

        <section className="story-section" id="story">
          <div className="story-inner section-wrap">
            <div className="story-kicker"><BrandMark small /> حكاية تقى</div>
            <div className="story-main">
              <h2>مش مجرد إكسسوار.<br /><span>دي حكاية بتكمّل حكايتك.</span></h2>
              <p>في «تقى» بنحب التفاصيل اللي بتحسّيها قبل ما تلاحظيها. كل قطعة بتتعمل بإيدينا، بحب واهتمام، عشان تبقى قريبة منك وتفضل فاكرة لحظة حلوة.</p>
              <a className="text-link text-link--light" href="#collection">شوفي أفكارنا <span>←</span></a>
            </div>
            <div className="story-stamp"><span>صُنع<br />بيدين<br />تحبّان</span><i>✳</i></div>
          </div>
          <div className="story-decoration" aria-hidden="true">✳</div>
        </section>

        <section className="details-section section-wrap" id="details">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> اختيرت لكِ</p>
              <h2>سوار الخرز<br /><em>البنفسجي</em></h2>
            </div>
            <p className="heading-note">لون يهدّي العين، ولمعة ذهبية تكمّل الحكاية.</p>
          </div>

          <div className="details-card">
            <div className="details-card-aside">
              <span className="aside-number">01</span>
              <span className="aside-vertical">تفاصيل القطعة</span>
              <span className="aside-flower">✳</span>
            </div>
            <div className="details-content">
              <div className="product-meta"><span className="availability-dot" /> قطعة مصنوعة يدويًا</div>
              <h3>سوار حكاية البنفسج</h3>
              <p>خرز بأحجار بنفسجية بتكوين طبيعي غير متطابق، تتخلله فواصل معدنية بلون ذهبي وإغلاق أنيق. كل سوار له تفاصيله الخاصة — قطعة قريبة منك، مش نسخة من حد.</p>
              <div className="material-list">
                <div><span className="material-swatch material-swatch--violet" /><span><b>اللون</b> درجات بنفسجية</span></div>
                <div><span className="material-swatch material-swatch--gold" /><span><b>التفاصيل</b> لمسات ذهبية</span></div>
                <div><span className="material-swatch material-swatch--cream" /><span><b>الصنع</b> تجميع يدوي</span></div>
              </div>
              <a className="button button--plum" href={whatsappLink} target="_blank" rel="noreferrer">اسألي عن السوار <MessageCircle size={17} /></a>
              <span className="order-caption">نحدّد السعر والتفاصيل معك قبل تأكيد الطلب.</span>
            </div>
            <div className="detail-illustration">
              <div className="detail-orbit"><span /><span /><span /><span /><span /><span /></div>
              <div className="detail-center"><Gem size={29} strokeWidth={1.2} /><span>one of a kind</span></div>
              <span className="detail-caption">كل قطعة…<br />بروح مختلفة</span>
            </div>
          </div>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-wrap">
            <div className="collection-heading">
              <div>
                <p className="eyebrow"><span /> أفكار من عالمنا</p>
                <h2>قطع تشبهك،<br /><em>وتبدأ من فكرتك.</em></h2>
              </div>
              <p>دي مجرد بداية. اختاري لونك المفضل أو احكي لنا عن شكل في بالك — ونصمّم سوا قطعة على ذوقك.</p>
            </div>

            <div className="piece-grid">
              {pieces.map((piece, index) => (
                <article className="piece-card" key={piece.title}>
                  <div className="piece-card-top"><span>0{index + 1}</span><span>فكرة قابلة للتخصيص</span></div>
                  <PieceIllustration type={piece.art} />
                  <div className="piece-card-bottom">
                    <div><h3>{piece.title}</h3><p>{piece.note}</p></div>
                    <a href={whatsappLink} target="_blank" rel="noreferrer" aria-label={`استفسري عن ${piece.title}`}><ArrowUpLeft size={18} /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="closing-section section-wrap">
          <BrandMark />
          <p className="eyebrow"><span /> حكايتك تبدأ من هنا</p>
          <h2>عندك فكرة؟<br /><em>خلّيها تنبض تقى.</em></h2>
          <p className="closing-copy">احكي لنا عن لون بتحبيه، ذكرى قريبة لقلبك، أو قطعة نفسك تلبسيها.</p>
          <a className="button button--light" href={whatsappLink} target="_blank" rel="noreferrer">كلّمينا على واتساب <MessageCircle size={17} /></a>
          <span className="closing-spark closing-spark--one">✳</span>
          <span className="closing-spark closing-spark--two">✦</span>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand-lockup" href="#home"><BrandMark small /><span className="brand-name-wrap"><span className="brand-name">تقى</span><span className="brand-caption">مجوهرات هاند ميد</span></span></a>
        <span className="footer-note">كل قطعة فيها حكاية صغيرة.</span>
        <a href="#home" className="back-to-top">للأعلى ↑</a>
        <span className="copyright">© تقى 2026 · Toqa</span>
        {/* The discreet entrance to the hidden wishes page: a tiny dot at the very
            end of the page. Only the people who know about it will notice it. */}
        <button
          type="button"
          className="secret-trigger"
          onClick={() => setLocation("/wishes")}
          aria-label="نقطة"
        />
      </footer>
    </div>
  );
}
