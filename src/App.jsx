// App.js
import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import profileImage from "./components/public/vishal profile.jpeg";

// ─── Utility ──────────────────────────────────────────────────────
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ─── Gradient Background ──────────────────────────────────────────
function GradientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-sky-50/30 to-white" />
      <div 
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #fde68a, transparent)" }}
      />
      <div 
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #fed7aa, transparent)" }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5 blur-3xl"
        style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }}
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
        if (charIndex < currentText.length) {
          setDisplayText(currentText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
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
      <span className="animate-pulse text-sky-500">|</span>
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
      className="group p-4 rounded-2xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm hover:border-sky-500/70 hover:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:shadow-sky-900/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl filter drop-shadow-lg">{icon}</span>
          <span className="font-semibold text-gray-100 text-sm">{name}</span>
        </div>
        <span className="text-xs font-bold text-sky-400">
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{
            width: `${filled}%`,
            background: `linear-gradient(90deg, ${color}, #06b6d4)`,
          }}
        >
          <div
            className="absolute inset-0 animate-pulse opacity-50 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${color}, #e0f2fe)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Skill Card (Icon Grid) - Dark Version ───────────────────────
function SkillCard({ name, color, icon }) {
  return (
    <div
      className="group relative flex flex-col items-center justify-center p-2 rounded-lg border border-gray-300 bg-transparent hover:scale-105 transition-all duration-300 cursor-default h-20 overflow-hidden"
      style={{
        boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 0 25px ${color}60, 0 0 50px ${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.2)";
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(0, 0, 0, 0.1)";
      }}
    >
      <img src={icon} alt={name} className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform duration-300 object-contain brightness-90 group-hover:brightness-100" />
      <span className="text-center text-xs font-semibold uppercase tracking-widest text-gray-700 group-hover:text-gray-900 transition-colors line-clamp-1">
        {name}
      </span>
    </div>
  );
}

// ─── Project Card - Dark Version ─────────────────────────────────
function ProjectCard({ title, desc, tags, photo, gradient, link, github }) {
  const handleViewProject = () => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  const handleViewGithub = () => {
    if (github) {
      window.open(github, '_blank');
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-300 bg-transparent hover:border-sky-600 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-sky-200/40 cursor-pointer">
      <div
        className={`h-44 flex items-center justify-center ${gradient} relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-black/60 to-transparent" />
        {photo ? (
          <img src={photo} alt={title} className="relative z-10 w-full h-full object-cover" />
        ) : (
          <div className="relative z-10 text-gray-500 text-sm">No image</div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <div className="flex gap-2">
            <button onClick={handleViewProject} className="text-xs px-3 py-1.5 rounded-full bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors shadow-lg shadow-sky-900/30">
              View Project →
            </button>
            <button onClick={handleViewGithub} className="text-xs px-3 py-1.5 rounded-full bg-gray-700 text-gray-200 font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!github}>
              {github ? 'GitHub' : 'No GitHub'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Loading Screen Component (Simple Dotted Spinner) ────────────
function LoadingScreen() {
  const [dotCount, setDotCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Loading");
  const messages = ["Loading", "Loading.", "Loading..", "Loading..."];

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 300);

    const messageInterval = setInterval(() => {
      setLoadingMessage(messages[dotCount]);
    }, 300);

    return () => {
      clearInterval(dotInterval);
      clearInterval(messageInterval);
    };
  }, [dotCount, messages]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        fontFamily: "'Poppins', 'Segoe UI', 'Inter', sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Circular Spinning Loader */}
        <div
          style={{
            position: "relative",
            width: "100px",
            height: "100px",
            margin: "0 auto 30px",
          }}
        >
          {/* Spinning circular ring */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "4px solid #e0f2fe",
              borderTop: "4px solid #0ea5e9",
              borderRight: "4px solid #0ea5e9",
              borderRadius: "50%",
              animation: "spinCircle 2s linear infinite",
            }}
          />

          {/* Inner ring */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              width: "80px",
              height: "80px",
              border: "3px solid transparent",
              borderBottom: "3px solid #06b6d4",
              borderRadius: "50%",
              animation: "spinCircleReverse 2s linear infinite",
            }}
          />
        </div>

        {/* Loading Message with Dots */}
        <p
          style={{
            color: "#0ea5e9",
            fontSize: "1.2rem",
            fontWeight: 500,
            letterSpacing: "1px",
            marginTop: "20px",
          }}
        >
          {loadingMessage}
        </p>
      </div>

      <style>{`
        @keyframes spinCircle {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes spinCircleReverse {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
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
  const [isLoading, setIsLoading] = useState(true);

  // 3-second loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const timeoutId = setTimeout(() => {
        console.warn("EmailJS init timed out - continuing without email service");
      }, 5000);
      
      emailjs.init("fqMsNZ37QPQz37ks0");
      clearTimeout(timeoutId);
    } catch (err) {
      console.error("EmailJS initialization failed:", err);
    }
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
      const contactParams = {
        from_name: formState.name,
        from_email: formState.email,
        message: formState.message,
      };

      await emailjs.send(
        "service_lky3k0h",
        "template_fh9njyc",
        contactParams
      );
      console.log("✓ Contact message sent to admin");

      const autoReplyParams = {
        email: formState.email,
        name: formState.name,
        message: formState.message,
      };

      await emailjs.send(
        "service_lky3k0h",
        "template_2hbc9q4",
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
    const element = document.getElementById(id);
    if (!element) return;
    
    setMenuOpen(false);
    
    const targetPosition = element.offsetTop;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 350;
    let start = null;
    
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    const smoothScroll = (currentTime) => {
      if (start === null) start = currentTime;
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(smoothScroll);
      }
    };
    
    requestAnimationFrame(smoothScroll);
  };

  const skills = [
    { name: "Python", color: "#f0b37b", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "SQL", color: "#90cdf4", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "Power BI", color: "#f0b37b", icon: "https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg" },
    { name: "Data Visualization", color: "#f687b3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/d3js/d3js-original.svg" },
    { name: "Data Analysis", color: "#90cdf4", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" },
    { name: "React", color: "#81e6d9", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "HTML5", color: "#fbbf24", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS3", color: "#60a5fa", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "JavaScript", color: "#fcd34d", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "Tailwind", color: "#5ee0a4", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
    { name: "MongoDB", color: "#6ee7b7", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "FireBase", color: "#fcd34d", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg" },
    { name: "Figma", color: "#0ea5e9", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  ];

  const softSkills = [
    "Problem Solving",
    "Communication",
    "Team Collaboration",
    "Time Management",
    "Adaptability",
    "Leadership",
    "Creativity",
    "Quick Learner",
  ];

  const projects = [
    {
      title: "Portfolio Website",
      desc: "My personal portfolio showcasing projects, skills, and experience. Built with React, Tailwind CSS, and Vite. Hosted on Firebase. Features smooth animations, responsive design, and interactive UI components.",
      tags: ["React", "Tailwind CSS", "Vite", "Firebase"],
      photo: "",
      gradient: "bg-gradient-to-br from-sky-700 to-sky-900",
      cat: "Frontend",
      link: "https://vishalm.web.app/",
      github: "https://github.com/MVISHAL0123/Portfolio_Vishal",
    },
    {
      title: "Task Management App",
      desc: "Streamline your day with an intuitive task manager that keeps you on track. Clean, user-friendly interface that makes task organization simple and satisfying.",
      tags: ["TypeScript", "React", "Frontend"],
      photo: "",
      gradient: "bg-gradient-to-br from-sky-700 to-sky-900",
      cat: "Frontend",
      github: "https://github.com/MVISHAL0123/TASK--MANAGEMENT-APP",
    },
    {
      title: "Billing Software",
      desc: "Automated billing system that generates accurate invoices and manages customer transactions seamlessly. Reduces errors and transforms manual billing into a 5-minute process.",
      tags: ["JavaScript", "Invoice Management", "Automation"],
      photo: "",
      gradient: "bg-gradient-to-br from-sky-700 to-sky-900",
      cat: "Full Stack",
      github: "https://github.com/MVISHAL0123/Billing-Software",
    },
    {
      title: "Ecommerce Sales Analysis",
      desc: "Comprehensive data analysis project identifying trends, patterns, and actionable business insights. Distills complex sales data into clear, visually compelling insights.",
      tags: ["SQL", "Power BI", "Data Visualization"],
      photo: "",
      gradient: "bg-gradient-to-br from-sky-700 to-sky-900",
      cat: "Data",
      github: "https://github.com/MVISHAL0123/ecommerce-sales-analysis",
    },
  ];

  const categories = ["All", "Frontend", "Full Stack", "Data"];
  const filtered =
    filter === "All" ? projects : projects.filter((p) => p.cat === filter);

  const subtext = "text-gray-400";

  // Show loading screen for 3 seconds
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden bg-gradient-to-br from-sky-50 via-sky-50/30 to-white text-gray-900">
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
        @keyframes pulse-glow-dark {
          0%, 100% {
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.3), inset 0 0 10px rgba(14, 165, 233, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(14, 165, 233, 0.5), inset 0 0 20px rgba(14, 165, 233, 0.2);
          }
        }
        @keyframes moving-border {
          0% {
            box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.6), 0 0 20px rgba(14, 165, 233, 0.4);
          }
          25% {
            box-shadow: 8px 0 20px rgba(14, 165, 233, 0.4), 0 0 30px rgba(14, 165, 233, 0.3);
          }
          50% {
            box-shadow: 0 8px 20px rgba(14, 165, 233, 0.4), 0 0 30px rgba(14, 165, 233, 0.3);
          }
          75% {
            box-shadow: -8px 0 20px rgba(14, 165, 233, 0.4), 0 0 30px rgba(14, 165, 233, 0.3);
          }
          100% {
            box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.6), 0 0 20px rgba(14, 165, 233, 0.4);
          }
        }
        
        /* Hero Fade-In Animations */
        @keyframes fadeInFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-150px);
            filter: blur(15px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0px);
          }
        }
        
        @keyframes fadeInFromRight {
          0% {
            opacity: 0;
            transform: translateX(150px);
            filter: blur(15px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
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
          animation: fadeInFromLeft 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0s both;
        }
        
        .hero-greeting {
          animation: fadeInFromRight 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
        }
        
        .hero-name {
          animation: fadeInFromRight 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both, glitchFlicker 0.6s ease-out 1.5s;
        }
        
        .hero-role {
          animation: fadeInFromRight 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s both;
        }
        
        .hero-bio {
          animation: fadeInFromRight 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s both;
        }
        
        .btn-primary {
          animation: fadeInFromRight 1s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s both;
        }
        
        .btn-secondary {
          animation: fadeInFromRight 1s cubic-bezier(0.34, 1.56, 0.64, 1) 1.3s both;
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
          background: linear-gradient(135deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%);
        }
        .cta-btn {
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(14,165,233,0.4);
        }
        .cta-btn:hover {
          transform: translateY(-4px) scale(1.05) rotateX(2deg);
          box-shadow: 0 20px 40px rgba(14,165,233,0.4), 0 0 80px rgba(34,197,233,0.2);
        }
        .glass {
          background: rgba(0,0,0,0.3);
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
          text-shadow: 0 0 40px rgba(14,165,233,0.6), 0 0 80px rgba(34,197,233,0.4);
        }
        .gradient-border {
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          padding: 2px;
          border-radius: 1rem;
        }
        .nav-link { position: relative; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, #0ea5e9, #06b6d4);
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        .nav-link:hover::after { width: 100%; }
        .section-badge {
          background: linear-gradient(135deg, rgba(14,165,233,0.2), rgba(34,197,233,0.2));
          border: 1px solid rgba(14,165,233,0.4);
          color: #0ea5e9;
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
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: #0ea5e9; border-radius: 3px; }
        
        /* Scroll Performance Optimizations */
        body, html {
          perspective: 1000px;
          will-change: scroll-position;
        }
        
        @media (prefers-reduced-motion: no-preference) {
          html {
            scroll-behavior: smooth;
          }
        }
        
        section {
          will-change: transform;
        }
        
        .animate-float,
        .animate-subtle-scale,
        .animate-gradient-glow,
        .animate-slide-in-left,
        .animate-slide-in-right,
        .animate-stagger-up,
        .animate-float-rotate {
          will-change: transform, opacity;
        }
        
        @media (hover: none) and (pointer: coarse) {
          html {
            scroll-behavior: auto;
            overscroll-behavior: contain;
          }
        }
      `}</style>

      <GradientBackground />

      {/* Ambient blobs - subtle for light background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 animate-gradient-glow"
          style={{
            background: "radial-gradient(circle, #fde68a, #fed7aa, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 animate-gradient-glow"
          style={{
            background: "radial-gradient(circle, #fbbf24, transparent 70%)",
            filter: "blur(100px)",
            animationDelay: "1s",
          }}
        />
      </div>

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-2 sm:py-3 backdrop-blur-xl bg-gray-900/95 shadow-lg shadow-gray-900/50 border-b border-gray-800"
            : "py-3 sm:py-4 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="font-black text-xl sm:text-2xl md:text-3xl bg-gradient-to-r from-sky-400 to-sky-500 bg-clip-text text-transparent glow-text">
            Vishal M
          </div>
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {["home", "about", "skills", "projects", "contact"].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="nav-link capitalize text-sm md:text-base lg:text-lg font-medium transition-colors text-black hover:text-black"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-sky-600 hover:text-sky-700 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-2 mx-4 p-3 flex flex-col gap-2 rounded-xl backdrop-blur-sm bg-sky-100/80 border border-sky-200/50 shadow-lg shadow-sky-200/30">
            {["home", "about", "skills", "projects", "contact"].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="capitalize text-base font-medium text-left py-2 px-4 rounded-lg hover:bg-sky-200/60 hover:text-sky-700 transition-all text-gray-800 border border-transparent hover:border-sky-300"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-sky-50/30 to-white pt-20 md:pt-16"
      >
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-8 sm:gap-12 md:gap-16 lg:gap-24 items-center justify-center py-8 md:py-0">
            {/* Left - Profile Photo with Glowing Border */}
            <div className="flex justify-center items-center hero-img flex-shrink-0">
              <div 
                className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-sky-500/60 shadow-xl shadow-sky-500/20"
                style={{
                  boxShadow: "0 0 30px rgba(14, 165, 233, 0.3), inset 0 0 20px rgba(14, 165, 233, 0.1)",
                }}
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right - Content */}
            <div className="text-center sm:text-left max-w-xl w-full flex-shrink-0">
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light mb-2 hero-greeting">Hi, I'm</p>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 hero-name" style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", textShadow: "0 0 30px rgba(14, 165, 233, 0.5)" }}>
                VISHAL M
              </h1>
              
              <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold text-gray-700 mb-6 h-10 sm:h-12 flex items-center justify-center sm:justify-start hero-role">
                <TypeWriter
                  texts={[
                    "Problem Solver",
                    "Data Analyst",
                    "Frontend Developer",
                  ]}
                />
              </p>
              
              <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 md:mb-8 leading-relaxed max-w-md hero-bio">
                I analyze data to uncover insights and build intuitive frontends that turn those insights into meaningful user experiences.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mt-8 w-full sm:w-auto">
                <button
                  onClick={() => scrollTo("projects")}
                  className="px-4 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 rounded-full font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 btn-primary hover:scale-105 active:scale-95 w-full sm:flex-1 md:w-auto shadow-lg shadow-sky-600/30"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(14, 165, 233, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(14, 165, 233, 0.4)";
                  }}
                >
                  View My Work
                </button>
                <button
                  onClick={() => scrollTo("contact")}
                  className="px-4 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 rounded-full font-semibold text-sm sm:text-base md:text-lg border-2 transition-all duration-300 btn-secondary hover:scale-105 active:scale-95 w-full sm:flex-1 md:w-auto"
                  style={{
                    borderColor: "#10b981",
                    color: "#059669",
                    background: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
                    e.currentTarget.style.borderColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#10b981";
                  }}
                >
                  Hire Me
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-sky-500/60 flex items-start justify-center pt-2">
            <div className="w-1 h-2.5 rounded-full bg-sky-500 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── ABOUT (Dark Card on Light Background) ── */}
      <section id="about" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent">
        <div className="max-w-7xl mx-auto relative z-10">
          <div>
            <div className="text-center mb-16 about-header animate-corner-right-to-center">
              <h1 className="text-6xl md:text-7xl font-black mb-3 h-20 md:h-24 flex items-center justify-center">
                <span className="text-sky-600 inline-block">About</span>
                <span className="text-gray-800 ml-2 inline-block">Me</span>
              </h1>
              <div className="flex justify-center mb-6">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-sky-600 to-transparent rounded-full animate-pulse" />
              </div>
              <p className="text-xl text-gray-600">Let me introduce myself</p>
            </div>

            {/* Dark Card */}
            <div className="bg-transparent rounded-2xl p-5 md:p-8 mb-12 about-card transition-all duration-300 animate-corner-to-center">
              <h2 className="text-3xl font-black text-gray-800 mb-1">My self Vishal</h2>
              
              <p className="text-lg font-semibold text-sky-600 mb-4 h-7 overflow-hidden">
                <span id="typewriter-text" className="inline-block"></span>
                <span className="animate-pulse text-sky-600">Data analyst | Frontend developer</span>
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-3 about-text">
                I'm a passionate developer and data enthusiast combining analytics with beautiful user interfaces. Currently exploring frontend development and creating solutions that transform complex data into meaningful insights.
              </p>
              
              <p className="text-gray-700 leading-relaxed about-text">
                Based in Coimbatore, India. I specialize in building data visualization dashboards, frontend applications, and creating seamless user experiences. With expertise in SQL, Python, Power BI, and modern web technologies, I'm committed to turning ideas into impactful digital solutions.
              </p>
            </div>

            {/* Info Cards - Dark Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" id="about-cards-container">
              {[
                { 
                  icon: (
                    <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                  label: "Name",
                  value: "Vishal M"
                },
                { 
                  icon: (
                    <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  label: "Email",
                  value: "vishalm102005@gmail.com"
                },
                { 
                  icon: (
                    <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  label: "Location",
                  value: "Coimbatore, Tamil Nadu"
                },
                { 
                  icon: (
                    <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  label: "Age",
                  value: "20"
                }
              ].map((info, i) => (
                <div 
                  key={info.label}
                  className="bg-transparent rounded-xl p-4 md:p-6 transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 group cursor-pointer border border-gray-300 hover:border-sky-600"
                  style={{
                    animation: i % 2 === 0 ? "corner-to-center 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" : "corner-right-to-center 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    animationDelay: `${i * 0.15}s`,
                    animationFillMode: "both",
                    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.borderColor = "#0ea5e9";
                    e.currentTarget.style.boxShadow = "0 0 25px rgba(14, 165, 233, 0.4), 0 0 50px rgba(14, 165, 233, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgb(209, 213, 219)";
                    e.currentTarget.style.boxShadow = "0 0 0 1px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div className="group-hover:scale-110 transition-transform text-5 sm:text-6 md:text-8">{info.icon}</div>
                  <div className="w-full">
                    <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-0.5 group-hover:text-sky-600 transition-colors">{info.label}</p>
                    <p className="text-gray-800 font-semibold text-xs sm:text-sm line-clamp-2">{info.value}</p>
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
            
            setTimeout(() => {
              const rect = section.getBoundingClientRect();
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                animateElements();
              }
            }, 100);
          })();
        `}</script>
      </section>

      {/* ── SKILLS (Dark Cards on Light Background) ── */}
      <section id="skills" className="relative z-10 py-28 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="section-badge">Skills & Tools</div>
              <h2 className="text-5xl md:text-5xl font-black">
                My{" "}
                <span className="bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
                  Skills
                </span> 
              </h2>
              <p className={`mt-4 ${subtext} max-w-1xl mx-auto`}>
              </p>
            </div>
          </FadeIn>

          {/* Technical Skills Section - Dark Cards */}
          <div className="mb-16">
            <FadeIn delay={100}>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">Technical Skills</h3>
            </FadeIn>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 max-w-5xl mx-auto" id="skills-grid">
              {skills.map((s, i) => (
                <FadeIn key={s.name} delay={150 + i * 50}>
                  <SkillCard {...s} />
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Soft Skills Section - Dark Cards with Animation */}
          <div className="mt-20">
            <FadeIn delay={200}>
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Soft Skills</h3>
            </FadeIn>
            <div className="max-w-5xl mx-auto overflow-hidden">
              <style>{`
                @keyframes staggered-pulse {
                  0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                  }
                  50% {
                    transform: scale(1.15);
                    opacity: 0.7;
                  }
                }
                .skills-scroll-container {
                  display: flex;
                  gap: 1rem;
                  flex-wrap: wrap;
                  justify-content: center;
                }
                .skills-scroll-container:hover {
                  animation-play-state: paused;
                }
              `}</style>
              
              {/* Soft Skills - Staggered Pulse Animation */}
              <div className="skills-scroll-container mb-6">
                {softSkills.map((skill, i) => (
                  <div 
                    key={`skill-${i}`} 
                    className="flex-shrink-0 px-6 py-3 rounded-full border border-gray-300 bg-transparent hover:border-sky-600 transition-all duration-300 text-center group cursor-default whitespace-nowrap"
                    style={{
                      animation: `staggered-pulse 1s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  >
                    <p className="text-gray-700 text-sm font-semibold group-hover:text-sky-600 transition-colors">
                      {skill}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS (Dark Cards on Light Background) ── */}
      <section id="projects" className="relative z-10 py-28 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="section-badge">Featured Work</div>
              <h2 className="text-4xl md:text-5xl font-black">
                <span className="bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
                  My Projects
                </span>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="text-center mb-8">
              <p className="text-gray-600">Explore my featured projects</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 border border-sky-500 text-white font-semibold hover:scale-105 hover:shadow-lg hover:shadow-sky-400/40 transition-all shadow-md"
              >
                View All Projects on GitHub
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CONTACT (Dark Form on Light Background) ── */}
      <section id="contact" className="relative z-10 py-28 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="section-badge">Get In Touch</div>
              <h2 className="text-4xl md:text-5xl font-black">
                Let&apos;s build something{" "}
                <span className="bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
                  amazing
                </span>
              </h2>
              <p className={`mt-4 ${subtext} max-w-xl mx-auto`}>
                Reach out through any of these channels and I&apos;ll respond as soon as possible.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">

            {/* LEFT CARD - Contact Info (Transparent) */}
            <FadeIn delay={100}>
              <div className="rounded-2xl border border-gray-300 hover:border-sky-600 transition-all duration-300 h-full">
                <div className="rounded-2xl p-4 sm:p-6 md:p-8 bg-transparent h-full flex flex-col">

                  <div className="text-xs uppercase tracking-widest mb-4 sm:mb-6 text-sky-600 font-semibold">
                    Contact Information
                  </div>

                  <div className="space-y-3 sm:space-y-4 flex-1">

                    {/* Email */}
                    <a
                      href="mailto:vishalm102005@gmail.com"
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-300 hover:border-sky-600 hover:bg-sky-100/30 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="bg-gradient-to-br from-sky-600 to-sky-700 rounded-lg sm:rounded-xl w-10 sm:w-14 h-10 sm:h-14 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sky-600/40 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-7 h-5 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-widest mb-1 font-semibold text-gray-600 group-hover:text-sky-600 transition-colors">
                          EMAIL
                        </div>
                        <div className="font-semibold text-gray-800 text-xs sm:text-sm group-hover:text-sky-700 transition-colors line-clamp-1">
                          vishalm102005@gmail.com
                        </div>
                      </div>
                    </a>

                    {/* Phone */}
                    <a
                      href="tel:+919003481354"
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-300 hover:border-sky-600 hover:bg-sky-100/30 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="bg-gradient-to-br from-sky-600 to-sky-700 rounded-lg sm:rounded-xl w-10 sm:w-14 h-10 sm:h-14 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sky-600/40 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-7 h-5 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-widest mb-1 font-semibold text-gray-600 group-hover:text-sky-600 transition-colors">
                          PHONE
                        </div>
                        <div className="font-semibold text-gray-800 text-xs sm:text-sm group-hover:text-sky-700 transition-colors line-clamp-1">
                          +91 9003481354
                        </div>
                      </div>
                    </a>

                    {/* Location */}
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-300 hover:border-sky-600 hover:bg-sky-100/30 transition-all duration-300 group cursor-pointer">
                      <div className="bg-gradient-to-br from-sky-600 to-sky-700 rounded-lg sm:rounded-xl w-10 sm:w-14 h-10 sm:h-14 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sky-600/40 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-7 h-5 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-widest mb-1 font-semibold text-gray-600 group-hover:text-sky-600 transition-colors">
                          LOCATION
                        </div>
                        <div className="font-semibold text-gray-800 text-xs sm:text-sm group-hover:text-sky-700 transition-colors line-clamp-1">
                          Coimbatore, Tamil Nadu, India
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Icons - Transparent */}
                  <div className="border-t border-gray-300 mt-4 sm:mt-6 pt-4 sm:pt-6">
                    <div className="text-xs uppercase tracking-widest mb-3 sm:mb-4 text-sky-600 font-semibold">
                      Connect With Me
                    </div>
                    <div className="flex gap-2 sm:gap-3">

                      {/* GitHub */}
                      <a
                        href="https://github.com/MVISHAL0123"
                        target="_blank"
                        rel="noreferrer"
                        title="GitHub"
                        className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-gray-900/50 hover:bg-gray-900 transition-all duration-200 active:scale-95 group"
                      >
                        <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23A11.52 11.52 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                      </a>

                      {/* LinkedIn */}
                      <a
                        href="https://www.linkedin.com/in/vishal-m-201098378/"
                        target="_blank"
                        rel="noreferrer"
                        title="LinkedIn"
                        className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-blue-600 border border-blue-700 flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-blue-600/50 hover:bg-blue-700 transition-all duration-200 active:scale-95 group"
                      >
                        <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* RIGHT CARD - Contact Form (Transparent) */}
            <FadeIn delay={200}>
              <div className="rounded-2xl border border-gray-300 hover:border-sky-600 transition-all duration-300 h-full">
                <div className="rounded-2xl p-8 bg-transparent h-full flex flex-col justify-between">
                  {submitted ? (
                    <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                      <div className="text-6xl mb-4 text-sky-600 font-bold">✓</div>
                      <h3 className="text-2xl font-bold mb-2 text-sky-700">
                        Message Sent!
                      </h3>
                      <p className="text-gray-700">I&apos;ll get back to you within 24 hours.</p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-sky-600 to-sky-700 text-white text-sm font-semibold shadow-lg"
                      >
                        Send Another
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-5">
                      {[
                        { key: "name", label: "Your Name", type: "text", placeholder: "Vishal" },
                        { key: "email", label: "Email Address", type: "email", placeholder: "your@gmail.com" },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className={`block text-xs uppercase tracking-wider mb-1 sm:mb-2 font-semibold text-sky-600`}>
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formState[field.key]}
                            onChange={(e) =>
                              setFormState({ ...formState, [field.key]: e.target.value })
                            }
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 bg-white/80 focus:border-sky-600 focus:outline-none focus:shadow-lg focus:shadow-sky-200/30 transition-all placeholder:text-gray-500 text-sm text-gray-800"
                          />
                        </div>
                      ))}
                      <div>
                        <label className={`block text-xs uppercase tracking-wider mb-1 sm:mb-2 font-semibold text-sky-600`}>
                          Your Message
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Hello..."
                          value={formState.message}
                          onChange={(e) =>
                            setFormState({ ...formState, message: e.target.value })
                          }
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 bg-white/80 focus:border-sky-600 focus:outline-none transition-all placeholder:text-gray-500 text-sm resize-none text-gray-800"
                        />
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-sky-600 to-sky-700 py-3 sm:py-4 rounded-lg sm:rounded-xl text-white font-bold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-lg shadow-sky-400/30"
                      >
                        {loading ? "Sending..." : "Send Message"}
                      </button>
                      {error && (
                        <p className="text-red-600 text-xs sm:text-sm mt-2">{error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── FOOTER (Light) ── */}
      <footer className="relative z-10 py-10 px-6 border-t border-gray-300 bg-white backdrop-blur-sm shadow-lg shadow-gray-300/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
          <p className={`text-xs sm:text-sm text-gray-700`}>
            © 2025 Vishal M. All rights reserved.
          </p>
          <button
            onClick={() => scrollTo("home")}
            className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gradient-to-r from-sky-600 to-sky-700 flex items-center justify-center text-white hover:scale-110 transition-transform text-sm sm:text-base shadow-md"
          >
            ↑
          </button>
        </div>
      </footer>
    </div>
  );
}