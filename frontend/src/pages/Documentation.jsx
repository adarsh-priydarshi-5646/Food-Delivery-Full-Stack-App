import React, { useState, useEffect } from "react";
import { marked } from "marked";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  FaBook, FaChevronRight, FaBars, FaTimes, FaArrowUp, 
  FaSearch, FaCode, FaServer, FaDatabase, FaRocket, 
  FaLightbulb, FaInfoCircle, FaProjectDiagram
} from "react-icons/fa";

const Documentation = () => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch("/docs/technical-documentation.md");
        const text = await response.text();
        setHtmlContent(text);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch documentation", err);
        setLoading(false);
      }
    };

    fetchDocs();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      const sections = document.querySelectorAll("h1, h2, h3");
      let currentSection = "";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          currentSection = section.id;
        }
      });
      if (currentSection) setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    {
      title: "Introduction",
      items: [
        { id: "introduction", label: "Introduction", icon: <FaInfoCircle /> },
        { id: "overview", label: "Overview", icon: <FaLightbulb /> },
        { id: "architecture", label: "Architecture", icon: <FaProjectDiagram /> },
      ]
    },
    {
      title: "Core Components",
      items: [
        { id: "core-components", label: "Core Components", icon: <FaCode /> },
        { id: "frontend-documentation", label: "Frontend Guide", icon: <FaCode />, inset: true },
        { id: "backend-documentation", label: "Backend Guide", icon: <FaServer />, inset: true },
        { id: "database-models", label: "Database Models", icon: <FaDatabase /> },
      ]
    },
    {
      title: "Guides",
      items: [
        { id: "guides", label: "Guides", icon: <FaBook /> },
        { id: "api-reference", label: "API Reference", icon: <FaServer />, inset: true },
        { id: "optimizations", label: "Optimizations", icon: <FaRocket /> },
        { id: "deployment", label: "Deployment", icon: <FaRocket /> },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="inline-block h-12 w-12 rounded-full border-4 border-solid border-[#E23744] border-r-transparent"
          />
          <p className="mt-4 text-lg text-gray-700 font-medium font-outfit">Loading Documentation Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-outfit selection:bg-[#E23744]/10 selection:text-[#E23744] overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#E23744] z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E23744] rounded-lg flex items-center justify-center text-white shadow-sm shadow-[#E23744]/20">
              <FaBook size={16} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Vingo Docs</h1>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <div className="relative group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E23744] transition-colors" size={14} />
            <input 
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E23744]/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-medium text-gray-600 hover:text-[#E23744] transition-colors hidden md:block">Go to App</a>
          <a 
            href="https://github.com/adarsh-priydarshi-5646/Food-Delivery-Full-Stack-App" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            GitHub
          </a>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-64px)] w-72 bg-white md:bg-transparent border-r border-gray-100 md:border-none z-40 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto overflow-x-hidden custom-scrollbar`}>
          <nav className="p-6 md:pr-0">
            {navItems.map((group, idx) => (
              <div key={idx} className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">{group.title}</h3>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a 
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(item.id);
                          if (el) {
                            const offset = 100;
                            const bodyRect = document.body.getBoundingClientRect().top;
                            const elementRect = el.getBoundingClientRect().top;
                            const elementPosition = elementRect - bodyRect;
                            const offsetPosition = elementPosition - offset;

                            window.scrollTo({
                              top: offsetPosition,
                              behavior: 'smooth'
                            });
                          }
                          setIsSidebarOpen(false);
                          setActiveSection(item.id);
                        }}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                          ${activeSection === item.id 
                            ? 'bg-[#E23744]/5 text-[#E23744]' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                          ${item.inset ? 'ml-4' : ''}`}
                      >
                        <span className={`transition-colors duration-200 ${activeSection === item.id ? 'text-[#E23744]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                          {item.icon}
                        </span>
                        {item.label}
                        {activeSection === item.id && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E23744]"
                          />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Backdrop for mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 md:px-12 bg-white shadow-sm min-h-screen">
          <article 
            className="docs-content prose prose-slate max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
              prose-h1:text-5xl prose-h1:mb-12 prose-h1:pb-8 prose-h1:border-b prose-h1:border-gray-100
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pt-8
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
              prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-8
              prose-li:text-gray-600 prose-li:mb-3
              prose-blockquote:border-l-4 prose-blockquote:border-[#E23744] prose-blockquote:bg-[#E23744]/5 prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:italic prose-blockquote:rounded-r-2xl prose-blockquote:text-[#E23744] prose-blockquote:my-10
              prose-code:bg-gray-100 prose-code:text-[#E23744] prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:font-medium
              prose-pre:bg-[#1a1b1e] prose-pre:text-gray-100 prose-pre:p-8 prose-pre:rounded-2xl prose-pre:shadow-2xl prose-pre:my-10 prose-pre:border prose-pre:border-gray-800
              prose-a:text-[#E23744] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline decoration-2 underline-offset-4
              prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12 prose-img:mx-auto
              prose-hr:border-gray-100 prose-hr:my-20
              prose-table:w-full prose-table:text-sm prose-table:my-10 prose-table:rounded-2xl prose-table:overflow-hidden prose-table:border prose-table:border-gray-100
              prose-thead:bg-gray-50/80 prose-th:px-6 prose-th:py-4 prose-th:text-gray-900 prose-th:font-bold prose-th:text-left
              prose-td:px-6 prose-td:py-4 prose-td:text-gray-600 prose-tr:border-b prose-tr:border-gray-50 last:prose-tr:border-none"
          >
            {htmlContent}
          </article>

          <div className="mt-24 pt-12 border-t border-gray-100 flex justify-between items-center text-sm font-medium">
            <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
              <FaChevronRight className="rotate-180" size={10} /> Previous
            </button>
            <button className="flex items-center gap-2 text-[#E23744] hover:text-[#c12a35] transition-colors">
              Next <FaChevronRight size={10} />
            </button>
          </div>

          <footer className="mt-12 text-center pb-8">
            <p className="text-gray-400 text-sm">© 2025 Vingo Technical Documentation Portal. Built with care for developers.</p>
          </footer>
        </main>

        {/* Right Table of Contents */}
        <aside className="hidden lg:block w-72 h-[calc(100vh-64px)] sticky top-16 p-8 overflow-y-auto border-l border-gray-50">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6 px-2">On this page</h4>
          <ul className="space-y-4">
            {[
              { id: "overview", label: "Overview" },
              { id: "system-architecture", label: "System Architecture" },
              { id: "frontend-documentation", label: "Frontend Documentation" },
              { id: "backend-documentation", label: "Backend Documentation" },
              { id: "database-schema", label: "Database Schema" },
              { id: "api-reference", label: "API Reference" },
              { id: "performance-optimizations", label: "Performance Optimizations" }
            ].map((link) => (
              <li key={link.id}>
                <a 
                  href={`#${link.id}`} 
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(link.id);
                    if (el) {
                      const offset = 100;
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = el.getBoundingClientRect().top;
                      const elementPosition = elementRect - bodyRect;
                      const offsetPosition = elementPosition - offset;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`text-sm transition-all duration-200 border-l-2 pl-4 block
                    ${activeSection === link.id 
                      ? 'text-[#E23744] border-[#E23744] font-medium' 
                      : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-200'}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-14 h-14 bg-white text-[#E23744] rounded-2xl shadow-2xl flex items-center justify-center hover:bg-[#E23744] hover:text-white transition-all duration-300 z-50 border border-gray-100 group"
          >
            <FaArrowUp className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f3f4f6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e5e7eb; }
        html { scroll-behavior: smooth; }
        h1, h2, h3 { scroll-margin-top: 100px; }
        
        .docs-content pre { position: relative; margin-top: 2rem; margin-bottom: 2rem; }
        .docs-content pre::before { 
          content: 'SOURCE'; position: absolute; right: 1.5rem; top: 0.8rem; 
          font-size: 0.6rem; color: #6b7280; font-weight: 800; letter-spacing: 0.1em;
        }
        
        /* Premium Typography Finishes */
        .docs-content h1 { letter-spacing: -0.025em; }
        .docs-content h2 { letter-spacing: -0.015em; }
      `}} />
    </div>
  );
};

export default Documentation;
