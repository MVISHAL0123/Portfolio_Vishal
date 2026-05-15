import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

// ─── Utility ──────────────────────────────────────────────────────
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ─── Gradient Background ──────────────────────────────────────────
function GradientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Main gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a2e] via-[#080b14] to-[#0d0221]" />
      
      {/* Accent gradients - subtle */}
      <div 
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
      />
      <div 
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
      />
    </div>
  );
}

// ─── TypeWriter ───────────────────────────────────────────────────
function TypeWriter({ texts, speed = 80, pause = 1800 }) {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    
    const handleTyping = () => {
      if (!isDeleting) {
        // Typing phase
        if (charIndex < currentText.length) {
          setDisplayText(currentText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Finished typing, wait before deleting
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        // Deleting phase
        if (charIndex > 0) {
          setDisplayText(currentText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // Finished deleting, move to next text
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
          setCharIndex(0);
        }
      }
    };

    const timer = setTimeout(
      handleTyping,
      isDeleting ? speed / 2 : speed
    );

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse text-purple-400">|</span>
    </span>
  );
}

// ─── Tilt Card ────────────────────────────────────────────────────
function TiltCard({ children, className = "" }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = clamp((-y / rect.height) * 20, -10, 10);
    const ry = clamp((x / rect.width) * 20, -10, 10);
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
  };

  const reset = () => {
    ref.current.style.transform =
      "perspective(800px) rotateX(0) rotateY(0) scale(1)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={`transition-transform duration-200 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Counter ──────────────────────────────────────────────────────
function Counter({ target, suffix = "+" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.ceil(target / 60);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 20);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ─── FadeIn ───────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Skill Bar ────────────────────────────────────────────────────
function SkillBar({ name, pct, color, icon }) {
  const ref = useRef(null);
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setFilled(pct), 200);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct]);

  return (
    <div
      ref={ref}
      className="group p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-white/90 text-sm">{name}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{
            width: `${filled}%`,
            background: `linear-gradient(90deg, ${color}, #f0abfc)`,
          }}
        >
          <div
            className="absolute inset-0 animate-pulse opacity-50 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${color}, #fca5a5)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Skill Card (Icon Grid) ───────────────────────────────────────
function SkillCard({ name, color, icon }) {
  return (
    <div
      className="group relative flex flex-col items-center justify-center p-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-default h-20 overflow-hidden"
      style={{
        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 0 20px ${color}40, 0 0 40px ${color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255, 255, 255, 0.1)";
      }}
    >
      <img src={icon} alt={name} className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform duration-300 object-contain" />
      <span className="text-center text-xs font-semibold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors line-clamp-1">
        {name}
      </span>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────
function ProjectCard({ title, desc, tags, emoji, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-purple-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
      <div
        className={`h-44 flex items-center justify-center text-7xl ${gradient} relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-black/40 to-transparent" />
        <span className="relative z-10 drop-shadow-xl">{emoji}</span>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20">
          <div className="text-center px-4">
            <p className="text-white text-sm leading-relaxed">{desc}</p>
            <button className="mt-3 px-4 py-1.5 rounded-full bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors">
              View Project →
            </button>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Splash Screen ────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a0a2e] via-[#080b14] to-[#0d0221]">
      <div className="text-center">
        <div className="mb-8 inline-block">
          <div className="w-24 h-24 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
          Portfolio
        </h1>
        <p className="text-white/50 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Show splash screen for 2 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("fqMsNZ37QPQz37ks0"); // Your public key from EmailJS
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Send contact message to admin (Contact Us template)
      const contactParams = {
        from_name: formState.name,
        from_email: formState.email,
        message: formState.message,
      };

      await emailjs.send(
        "service_lky3k0h",
        "template_fh9njyc",  // Contact Us template - goes to owner
        contactParams
      );
      console.log("✓ Contact message sent to admin");

      // Send auto-reply confirmation to user
      const autoReplyParams = {
        email: formState.email,
        name: formState.name,
        message: formState.message,
      };

      await emailjs.send(
        "service_lky3k0h",
        "template_2hbc9q4",  // Auto-Reply template - goes to user only
        autoReplyParams
      );
      console.log("✓ Auto-reply sent to " + formState.email);

      setSubmitted(true);
      setFormState({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("❌ EmailJS Error:");
      console.error("Status:", err.status);
      console.error("Response Text:", err.text);
      
      if (err.text) {
        try {
          const parsed = JSON.parse(err.text);
          console.error("Parsed Error:", parsed);
        } catch (e) {
          console.error("Raw Error Response:", err.text);
        }
      }
      
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const skills = [
    { name: "Python", color: "#3776AB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "SQL", color: "#336791", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "Power BI", color: "#F25022", icon: "https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg" },
    { name: "Data Visualization", color: "#FF6B6B", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/d3js/d3js-original.svg" },
    { name: "Data Analysis", color: "#4B8BBE", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" },
    { name: "React", color: "#61dafb", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "HTML5", color: "#E34C26", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS3", color: "#1572B6", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "JavaScript", color: "#F7DF1E", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "Tailwind", color: "#3b82f6", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
    { name: "MongoDB", color: "#15ce5c", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "FireBase", color: "#F7DF1E", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg" },
    { name: "Figma", color: "#A259FF", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  ];

  const projects = [
    {
      title: "Task Management App",
      desc: "Streamline your day with an intuitive task manager that keeps you on track. Clean, user-friendly interface that makes task organization simple and satisfying.",
      tags: ["TypeScript", "React", "Frontend"],
      emoji: "✅",
      gradient: "bg-gradient-to-br from-blue-600 to-cyan-800",
      cat: "Frontend",
    },
    {
      title: "Billing Software",
      desc: "Automated billing system that generates accurate invoices and manages customer transactions seamlessly. Reduces errors and transforms manual billing into a 5-minute process.",
      tags: ["JavaScript", "Invoice Management", "Automation"],
      emoji: "💳",
      gradient: "bg-gradient-to-br from-emerald-600 to-teal-800",
      cat: "Full Stack",
    },
    {
      title: "Ecommerce Sales Analysis",
      desc: "Comprehensive data analysis project identifying trends, patterns, and actionable business insights. Distills complex sales data into clear, visually compelling insights.",
      tags: ["SQL", "Power BI", "Data Visualization"],
      emoji: "📊",
      gradient: "bg-gradient-to-br from-amber-600 to-orange-800",
      cat: "Data",
    },
  ];

  const categories = [];
  const filtered =
    filter === "All" ? projects : projects.filter((p) => p.cat === filter);

  const subtext = "text-white/60";

  return (
    <>
      {pageLoading && <SplashScreen />}
      <div
        className="relative min-h-screen font-sans overflow-x-hidden transition-colors duration-500 bg-[#080b14] text-white"
      >
      <style>{`
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes smooth-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes subtle-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes gradient-glow {
          0%, 100% { opacity: 0.4; filter: blur(60px); }
          50% { opacity: 0.6; filter: blur(80px); }
        }
        @keyframes slide-in-left {
          from { 
            opacity: 0; 
            transform: translateX(-60px) rotateY(20deg);
          }
          to { 
            opacity: 1; 
            transform: translateX(0) rotateY(0deg);
          }
        }
        @keyframes slide-in-right {
          from { 
            opacity: 0; 
            transform: translateX(60px) rotateY(-20deg);
          }
          to { 
            opacity: 1; 
            transform: translateX(0) rotateY(0deg);
          }
        }
        @keyframes stagger-up {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95);
      }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        @keyframes float-rotate {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-8px) rotateX(2deg); }
        }
        @keyframes fade-in-left {
          0% {
            opacity: 0;
            transform: translateX(-60px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fade-in-right {
          0% {
            opacity: 0;
            transform: translateX(60px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.2);
            border-color: rgba(139, 92, 246, 0.6);
          }
          50% {
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.8), inset 0 0 30px rgba(139, 92, 246, 0.3);
            border-color: rgba(139, 92, 246, 1);
          }
        }
        @keyframes moving-border {
          0% {
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.6);
          }
          25% {
            box-shadow: 8px 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4);
          }
          50% {
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4);
          }
          75% {
            box-shadow: -8px 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4);
          }
          100% {
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.6);
          }
        }
        
        /* Hero Fade-In Animations */
        @keyframes fadeInFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-100px) rotateY(-20deg);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) rotateY(0deg);
            filter: blur(0px);
          }
        }
        
        @keyframes fadeInFromRight {
          0% {
            opacity: 0;
            transform: translateX(100px) rotateY(20deg);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) rotateY(0deg);
            filter: blur(0px);
          }
        }
        
        @keyframes glitchFlicker {
          0%, 100% { opacity: 1; transform: translateX(0) scale(1); }
          20% { opacity: 0.8; transform: translateX(-4px) scale(0.98); }
          40% { opacity: 1; transform: translateX(4px) scale(1.02); }
          60% { opacity: 0.9; transform: translateX(-2px) scale(0.99); }
          80% { opacity: 1; transform: translateX(0) scale(1); }
        }
        
        .hero-img {
          animation: fadeInFromLeft 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }
        
        .hero-greeting {
          animation: fadeInFromRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
        }
        
        .hero-name {
          animation: fadeInFromRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both, glitchFlicker 0.6s ease-out 1.3s;
        }
        
        .hero-role {
          animation: fadeInFromRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s both;
        }
        
        .hero-bio {
          animation: fadeInFromRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s both;
        }
        
        .btn-primary {
          animation: fadeInFromRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s both;
        }
        
        .btn-secondary {
          animation: fadeInFromRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.7s both;
        }
        
        .animate-float { animation: gentle-float 6s ease-in-out infinite; }
        .animate-subtle-scale { animation: subtle-scale 8s ease-in-out infinite; }
        .animate-gradient-glow { animation: gradient-glow 6s ease-in-out infinite; }
        .animate-slide-in-left { animation: slide-in-left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-slide-in-right { animation: slide-in-right 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-stagger-up { animation: stagger-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-float-rotate { animation: float-rotate 5s ease-in-out infinite; }
        .animate-corner-to-center { animation: fade-in-left 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-corner-right-to-center { animation: fade-in-right 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards; }
        .card-3d {
          perspective: 1200px;
          transform-style: preserve-3d;
        }
        .card-3d-inner {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.320, 1);
          transform-style: preserve-3d;
        }
        .card-3d:hover .card-3d-inner {
          transform: rotateX(8deg) rotateY(-8deg) scale(1.02);
        }
        .hero-gradient {
          background: linear-gradient(135deg, #0a0a2e 0%, #080b14 50%, #0d0221 100%);
        }
        .cta-btn {
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(139,92,246,0.4);
        }
        .cta-btn:hover {
          transform: translateY(-4px) scale(1.05) rotateX(2deg);
          box-shadow: 0 20px 40px rgba(139,92,246,0.4), 0 0 80px rgba(167,139,250,0.2);
        }
        .glass {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1rem;
        }
        .glass-light {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 1rem;
        }
        .glow-text {
          text-shadow: 0 0 40px rgba(139,92,246,0.6), 0 0 80px rgba(167,139,250,0.4);
        }
        .gradient-border {
          background: linear-gradient(135deg, #8b5cf6, #a78bfa, #3b82f6);
          padding: 2px;
          border-radius: 1rem;
        }
        .nav-link { position: relative; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        .nav-link:hover::after { width: 100%; }
        .section-badge {
          background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(167,139,250,0.2));
          border: 1px solid rgba(139,92,246,0.4);
          color: #8b5cf6;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          display: inline-block;
          margin-bottom: 1rem;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080b14; }
        ::-webkit-scrollbar-thumb { background: #8b5cf6; border-radius: 3px; }
      `}</style>

      {/* Gradient Background */}
      <GradientBackground />

      {/* Ambient blobs - subtle geometric gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-12 animate-gradient-glow"
          style={{
            background: "radial-gradient(circle, #8b5cf6, #7c3aed, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10 animate-gradient-glow"
          style={{
            background: "radial-gradient(circle, #3b82f6, transparent 70%)",
            filter: "blur(100px)",
            animationDelay: "1s",
          }}
        />
      </div>

      {/* ── NAVBAR ── */}
      {!pageLoading && (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-3 backdrop-blur-xl bg-black/30 shadow-lg shadow-black/20 border-b border-white/5"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="font-black text-4xl bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent glow-text">
            Vishal M
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["home", "about", "skills", "projects", "contact"].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="nav-link capitalize text-lg font-medium transition-colors text-white/70 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-10 h-10 rounded-full glass flex items-center justify-center"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden glass mt-2 mx-4 p-4 flex flex-col gap-3">
            {["home", "about", "skills", "projects", "contact"].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="capitalize text-lg font-medium text-left py-2 px-4 rounded-xl hover:bg-purple-500/20 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </nav>
      )}

      {/* ── HERO ── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a0f1a 100%)"
        }}
      >
        <div className="relative z-10 px-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center justify-center min-h-screen">
            {/* Left - Profile Photo with Glowing Border */}
            <div className="flex justify-center items-center hero-img w-full md:w-auto">
              <div 
                className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-2 border-purple-500/60"
                style={{
                  boxShadow: "0 0 30px rgba(139, 92, 246, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.1)",
                }}
              >
                <img
                  src="/vishal profile.jpeg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right - Content */}
            <div className="text-left max-w-xl w-full px-4 md:px-0">
              <p className="text-base sm:text-lg md:text-lg text-white/70 font-light mb-2 hero-greeting">Hi, I'm</p>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-2 hero-name" style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa, #3b82f6, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", textShadow: "0 0 30px rgba(139, 92, 246, 0.5)" }}>
                VISHAL M
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white/80 mb-6 h-12 flex items-center hero-role">
                <TypeWriter
                  texts={[
                    "Problem Solver",
                    "Data Analyst",
                    "Frontend Developer",
                  ]}
                />
              </p>
              
              <p className="text-white/60 text-base sm:text-lg md:text-lg mb-6 md:mb-8 leading-relaxed max-w-md hero-bio">
                I analyze data to uncover insights and build intuitive frontends that turn those insights into meaningful user experiences.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={() => scrollTo("projects")}
                  className="px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 btn-primary hover:shadow-2xl w-full sm:w-auto"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #3b82f6 100%)",
                    color: "white",
                    boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)"
                  }}
                >
                  View My Work 🚀
                </button>
                <button
                  onClick={() => scrollTo("contact")}
                  className="px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-base sm:text-lg text-white/80 border-2 transition-all duration-300 hover:text-white hover:border-opacity-100 btn-secondary w-full sm:w-auto"
                  style={{
                    borderColor: "rgba(46, 213, 115, 0.5)",
                    background: "rgba(46, 213, 115, 0.05)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#2ed573";
                    e.currentTarget.style.color = "#2ed573";
                    e.currentTarget.style.backgroundColor = "rgba(46, 213, 115, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(46, 213, 115, 0.5)";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                    e.currentTarget.style.backgroundColor = "rgba(46, 213, 115, 0.05)";
                  }}
                >
                  Hire Me ✉️
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-purple-500/40 flex items-start justify-center pt-2">
            <div className="w-1 h-2.5 rounded-full bg-purple-400 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="relative z-10 py-20 px-6 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-20 -left-32 w-80 h-80 rounded-full opacity-20 blur-3xl animate-gradient-glow"
            style={{
              background: "radial-gradient(circle, #8b5cf6, transparent)",
              transform: "translate(0, 0)",
              transition: "transform 0.3s ease-out"
            }}
            id="orb-1"
          />
          <div
            className="absolute bottom-20 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl animate-gradient-glow"
            style={{
              background: "radial-gradient(circle, #3b82f6, transparent)",
              transform: "translate(0, 0)",
              transition: "transform 0.3s ease-out",
              animationDelay: "1s"
            }}
            id="orb-2"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div>
            {/* Header with Split Animation */}
            <div className="text-center mb-16 about-header animate-corner-right-to-center">
              <h1 className="text-6xl md:text-7xl font-black mb-3 h-20 md:h-24 flex items-center justify-center">
                <span className="text-purple-600 inline-block">About</span>
                <span className="text-white ml-2 inline-block">Me</span>
              </h1>
              <div className="flex justify-center mb-6">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent rounded-full animate-pulse" />
              </div>
              <p className="text-xl text-white/70">Let me introduce myself</p>
            </div>

            {/* Main Content */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 md:p-8 mb-12 about-card hover:border-purple-500/30 transition-all duration-300 animate-corner-to-center">
              <h2 className="text-3xl font-black text-white mb-1">My self Vishal </h2>
              
              {/* Typewriter Effect on Role */}
              <p className="text-lg font-semibold text-purple-500 mb-4 h-7 overflow-hidden">
                <span id="typewriter-text" className="inline-block"></span>
                <span className="animate-pulse text-purple-500">Data analyst | Frontend developer</span>
              </p>
              
              <p className="text-white/80 leading-relaxed mb-3 about-text">
                I'm a passionate developer and data enthusiast combining analytics with beautiful user interfaces. Currently exploring frontend development and creating solutions that transform complex data into meaningful insights.
              </p>
              
              <p className="text-white/80 leading-relaxed about-text">
                Based in Coimbatore, India. I specialize in building data visualization dashboards, frontend applications, and creating seamless user experiences. With expertise in SQL, Python, Power BI, and modern web technologies, I'm committed to turning ideas into impactful digital solutions.
              </p>
            </div>

            {/* Info Cards with Staggered Animation */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" id="about-cards-container">
              {[
                { 
                  icon: (
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                  label: "Name",
                  value: "Vishal M"
                },
                { 
                  icon: (
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  label: "Email",
                  value: "vishalm102005@gmail.com"
                },
                { 
                  icon: (
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  label: "Location",
                  value: "Coimbatore, Tamil Nadu"
                },
                { 
                  icon: (
                    <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  label: "Age",
                  value: "20"
                }
              ]            .map((info, i) => (
                <div 
                  key={info.label}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6 transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 group cursor-pointer hover:border-orange-400/50"
                  style={{
                    animation: i % 2 === 0 ? "corner-to-center 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" : "corner-right-to-center 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    animationDelay: `${i * 0.15}s`,
                    animationFillMode: "both"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#f59e0b";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.1)";
                    e.currentTarget.style.transform = "translateY(-8px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="group-hover:scale-110 transition-transform">{info.icon}</div>
                  <div className="w-full">
                    <p className="text-xs uppercase tracking-widest text-white/50 font-semibold mb-1 group-hover:text-orange-400 transition-colors">{info.label}</p>
                    <p className="text-white font-semibold text-xs sm:text-sm line-clamp-2">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes slide-in-left {
            from { 
              opacity: 0; 
              transform: translateX(-100px) rotateY(20deg);
            }
            to { 
              opacity: 1; 
              transform: translateX(0) rotateY(0deg);
            }
          }
          @keyframes slide-in-right {
            from { 
              opacity: 0; 
              transform: translateX(100px) rotateY(-20deg);
            }
            to { 
              opacity: 1; 
              transform: translateX(0) rotateY(0deg);
            }
          }
          @keyframes slide-up {
            from { 
              opacity: 0; 
              transform: translateY(40px);
            }
            to { 
              opacity: 1; 
              transform: translateY(0);
            }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fade-in-delayed {
            0% { opacity: 0; }
            70% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes stagger-up {
            from { 
              opacity: 0; 
              transform: translateY(30px) scale(0.8) rotateX(10deg);
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1) rotateX(0deg);
            }
          }
          .animate-slide-in-left { animation: slide-in-left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .animate-slide-in-right { animation: slide-in-right 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; animation-delay: 0.1s; }
          .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); animation-delay: 0.3s; }
          .animate-fade-in { animation: fade-in 1s ease-in; animation-delay: 0.8s; }
          .animate-fade-in-delayed { animation: fade-in-delayed 1.5s ease-in; }
        `}</style>

        <script>{`
          (function() {
            const section = document.querySelector("#about");
            if (!section) return;

            function animateTypewriter() {
              const el = document.getElementById("typewriter-text");
              if (!el) return;
              
              el.textContent = "";
              const text = "Data Analyst & Frontend Developer";
              let i = 0;
              
              const type = () => {
                if (i < text.length) {
                  el.textContent += text[i];
                  i++;
                  setTimeout(type, 60);
                }
              };
              type();
            }

            function animateElements() {
              // Title
              const titles = section.querySelectorAll("h1 span");
              titles.forEach((t, i) => {
                t.style.opacity = "0";
                if (i === 0) t.style.transform = "translateX(-50px)";
                if (i === 1) t.style.transform = "translateX(50px)";
                
                setTimeout(() => {
                  t.style.transition = "all 0.6s ease-out";
                  t.style.opacity = "1";
                  t.style.transform = "translateX(0)";
                }, i * 150);
              });

              // Bio card
              const bioCard = section.querySelector(".about-card");
              if (bioCard) {
                bioCard.style.opacity = "0";
                bioCard.style.transform = "translateY(30px)";
                setTimeout(() => {
                  bioCard.style.transition = "all 0.6s ease-out";
                  bioCard.style.opacity = "1";
                  bioCard.style.transform = "translateY(0)";
                }, 300);
              }

              // Bio text
              const texts = section.querySelectorAll(".about-text");
              texts.forEach((t, i) => {
                t.style.opacity = "0";
                t.style.transform = "translateY(20px)";
                setTimeout(() => {
                  t.style.transition = "all 0.6s ease-out";
                  t.style.opacity = "1";
                  t.style.transform = "translateY(0)";
                }, 500 + i * 100);
              });

              // Info cards
              const container = document.getElementById("about-cards-container");
              if (container) {
                const cards = container.querySelectorAll("div");
                cards.forEach((card, i) => {
                  card.style.opacity = "0";
                  card.style.transform = "translateY(40px) scale(0.8)";
                  setTimeout(() => {
                    card.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
                    card.style.opacity = "1";
                    card.style.transform = "translateY(0) scale(1)";
                  }, 700 + i * 80);
                });
              }

              animateTypewriter();
            }

            const observer = new IntersectionObserver(entries => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  animateElements();
                }
              });
            }, { threshold: 0.2 });

            observer.observe(section);
            
            // Check if already visible
            setTimeout(() => {
              const rect = section.getBoundingClientRect();
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                animateElements();
              }
            }, 100);

            // Parallax
            const orb1 = document.getElementById("orb-1");
            const orb2 = document.getElementById("orb-2");

            section.addEventListener("mousemove", (e) => {
              const rect = section.getBoundingClientRect();
              const x = (e.clientX - rect.left - rect.width / 2) * 0.02;
              const y = (e.clientY - rect.top - rect.height / 2) * 0.02;
              
              if (orb1) orb1.style.transform = "translate(" + x + "px, " + y + "px)";
              if (orb2) orb2.style.transform = "translate(" + (-x * 0.7) + "px, " + (-y * 0.7) + "px)";
            });

            section.addEventListener("mouseleave", () => {
              if (orb1) orb1.style.transform = "translate(0, 0)";
              if (orb2) orb2.style.transform = "translate(0, 0)";
            });
          })();
        `}</script>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" className="relative z-10 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="section-badge">Skills & Tools</div>
              <h2 className="text-5xl md:text-5xl font-black">
                My{" "}
                <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Skills
                </span> 
              </h2>
              <p className={`mt-4 ${subtext} max-w-1xl mx-auto`}>
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto" id="skills-grid">
            {skills.map((s, i) => (
              <div key={s.name} className="flex-none skill-item" style={{ width: 'calc(20% - 0.6rem)' }}>
                <FadeIn delay={i * 50}>
                  <SkillCard {...s} />
                </FadeIn>
              </div>
            ))}
          </div>
          
          <FadeIn delay={300}>
            <div className="mt-16 flex flex-wrap justify-center gap-3">
              {[
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full glass text-sm font-medium hover:border-purple-500/50 hover:text-purple-300 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>

        <script>{`
          (function() {
            const grid = document.getElementById("skills-grid");
            if (!grid) return;

            function animateSkills() {
              const items = grid.querySelectorAll(".skill-item");
              items.forEach((item, i) => {
                item.style.opacity = "0";
                item.style.transform = "translateY(40px) scale(0.8)";
                
                setTimeout(() => {
                  item.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
                  item.style.opacity = "1";
                  item.style.transform = "translateY(0) scale(1)";
                }, i * 60);
              });
            }

            const observer = new IntersectionObserver(entries => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  animateSkills();
                }
              });
            }, { threshold: 0.2 });

            observer.observe(grid);

            // Check if already visible
            setTimeout(() => {
              const rect = grid.getBoundingClientRect();
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                animateSkills();
              }
            }, 100);
          })();
        `}</script>
      </section>
      <section id="projects" className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="section-badge">Featured Work</div>
              <h2 className="text-4xl md:text-5xl font-black">
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  My Projects
                </span>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    filter === cat
                      ? "cta-btn text-white shadow-lg shadow-purple-500/30"
                      : "glass hover:border-purple-500/40 hover:text-purple-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <FadeIn key={p.title} delay={i * 80}>
                <ProjectCard {...p} />
              </FadeIn> 
            ))}
          </div>

          <FadeIn delay={400}>
            <div className="text-center mt-12">
              <a 
                href="https://github.com/MVISHAL0123"
                target="_blank"
                rel="noreferrer"
                className="inline-block px-8 py-3 rounded-full glass border border-purple-500/30 text-purple-300 font-semibold hover:bg-purple-500/10 hover:scale-105 transition-all"
              >
                View All Projects on GitHub 🐙
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

{/* ── CONTACT ── */}
<section id="contact" className="relative z-10 py-28 px-6">
  <div className="max-w-5xl mx-auto">
    <FadeIn>
      <div className="text-center mb-16">
        <div className="section-badge">Get In Touch</div>
        <h2 className="text-4xl md:text-5xl font-black">
          Let&apos;s build something{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            amazing
          </span>
        </h2>
        <p className={`mt-4 ${subtext} max-w-xl mx-auto`}>
          Reach out through any of these channels and I&apos;ll respond as soon as possible.
        </p>
      </div>
    </FadeIn>

    <div className="grid md:grid-cols-2 gap-10">

      {/* LEFT CARD - Contact Info */}
      <FadeIn delay={100}>
        <div className="gradient-border hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 h-full">
          <div className="rounded-[calc(1rem-2px)] p-8 bg-[#0d1117] h-full flex flex-col">

            <div className="text-xs uppercase tracking-widest mb-6 text-white/40 font-semibold">
              Contact Information
            </div>

            <div className="space-y-4 flex-1">

              {/* Email */}
              <a
                href="mailto:vishalm102005@gmail.com"
                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl w-14 h-14 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/40 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest mb-1 font-semibold text-white/50 group-hover:text-blue-300 transition-colors">
                    EMAIL
                  </div>
                  <div className="font-semibold text-white text-sm group-hover:text-blue-200 transition-colors">
                    vishalm102005@gmail.com
                  </div>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+919003481354"
                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl w-14 h-14 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/40 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest mb-1 font-semibold text-white/50 group-hover:text-purple-300 transition-colors">
                    PHONE
                  </div>
                  <div className="font-semibold text-white text-sm group-hover:text-purple-200 transition-colors">
                    +91 9003481354
                  </div>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 group cursor-pointer">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl w-14 h-14 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/40 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest mb-1 font-semibold text-white/50 group-hover:text-purple-300 transition-colors">
                    LOCATION
                  </div>
                  <div className="font-semibold text-white text-sm group-hover:text-purple-200 transition-colors">
                    Coimbatore, Tamil Nadu, India
                  </div>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="border-t border-white/10 mt-6 pt-6">
              <div className="text-xs uppercase tracking-widest mb-4 text-white/40 font-semibold">
                Connect With Me
              </div>
              <div className="flex gap-3">

                {/* GitHub */}
                <a
                  href="https://github.com/MVISHAL0123"
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub"
                  className="w-12 h-12 rounded-xl bg-[#24292e] border border-white/10 flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-white/20 hover:border-white/30 transition-all duration-200 active:scale-95 group"
                >
                  <svg className="w-6 h-6 text-white group-hover:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23A11.52 11.52 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/vishal-m-201098378/"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="w-12 h-12 rounded-xl bg-[#0077B5] border border-white/10 flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-blue-500/40 hover:border-blue-400/50 transition-all duration-200 active:scale-95 group"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* RIGHT CARD - Contact Form */}
      <FadeIn delay={200}>
        <div className="gradient-border hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 h-full">
          <div className="rounded-[calc(1rem-2px)] p-8 bg-[#0d1117] h-full flex flex-col justify-between">
            {submitted ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Message Sent!
                </h3>
                <p className={subtext}>I&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2 rounded-full cta-btn text-white text-sm font-semibold"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {[
                  { key: "name", label: "Your Name", type: "text", placeholder: "Vishal" },
                  { key: "email", label: "Email Address", type: "email", placeholder: "your@gmail.com" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className={`block text-xs uppercase tracking-wider mb-2 font-semibold ${subtext}`}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formState[field.key]}
                      onChange={(e) =>
                        setFormState({ ...formState, [field.key]: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/60 focus:outline-none focus:shadow-lg focus:shadow-purple-500/10 transition-all placeholder:text-white/20 text-sm bg-white/5 backdrop-blur-sm text-white"
                    />
                  </div>
                ))}
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-2 font-semibold ${subtext}`}>
                    Your Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Hello..."
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/60 focus:outline-none transition-all placeholder:text-white/20 text-sm resize-none bg-white/5 backdrop-blur-sm text-white"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full cta-btn py-4 rounded-xl text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message 🚀"}
                </button>
                {error && (
                  <p className="text-purple-400 text-sm mt-2">{error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </FadeIn>

    </div>
  </div>
</section>
      {/* ── FOOTER ── */}
      <footer className="relative z-10 py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-black text-lg bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            
          </div>
          <p className={`text-sm ${subtext}`}>
            @ 2025 Vishal M. All rights reserved.
          </p>
          <button
            onClick={() => scrollTo("home")}
            className="w-10 h-10 rounded-full cta-btn flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            ↑
          </button>
        </div>
      </footer>
    </div>
    </>
  );
}