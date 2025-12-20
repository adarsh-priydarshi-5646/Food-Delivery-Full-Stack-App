import React, { useState, useEffect, useMemo } from "react";
import { marked } from "marked";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  FaBook, FaChevronRight, FaBars, FaTimes, FaArrowUp, 
  FaSearch, FaCode, FaServer, FaDatabase, FaRocket, 
  FaLightbulb, FaInfoCircle, FaProjectDiagram
} from "react-icons/fa";

const Documentation = () => {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const navItems = useMemo(() => [
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
        { id: "frontend-guide", label: "Frontend Guide", icon: <FaCode />, inset: true },
        { id: "backend-guide", label: "Backend Guide", icon: <FaServer />, inset: true },
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
  ], []);

  // Flatten navItems for pagination
  const flatNavItems = useMemo(() => {
    return navItems.flatMap(group => group.items);
  }, [navItems]);

  const currentIndex = flatNavItems.findIndex(item => item.id === activeSection);
  const prevSection = currentIndex > 0 ? flatNavItems[currentIndex - 1] : null;
  const nextSection = currentIndex < flatNavItems.length - 1 ? flatNavItems[currentIndex + 1] : null;

  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false,
    });

    const fetchDocs = async () => {
      try {
        const response = await fetch("/docs/technical-documentation.md");
        const text = await response.text();
        
        // Split text by H1 headers (# Section Name)
        const parts = text.split(/^# /m);
        const sectionMap = {};
        
        parts.forEach(part => {
          if (!part.trim()) return;
          const lines = part.split("\n");
          const rawTitle = lines[0].trim();
          const content = lines.slice(1).join("\n").trim();
          
          // Map Title to ID (lowercase, kebab-case)
          const id = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          sectionMap[id] = {
            title: rawTitle,
            html: marked.parse(content)
          };
        });

        setSections(sectionMap);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch documentation", err);
        setLoading(false);
      }
    };

    fetchDocs();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToSection = (id) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="inline-block h-12 w-12 rounded-full border-4 border-solid border-[#E23744] border-r-transparent"
          />
          <p className="mt-4 text-lg text-gray-700 font-medium font-outfit">Preparing Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#fafafa] font-outfit selection:bg-[#E23744]/20 selection:text-[#E23744] overflow-hidden">
      {/* Premium Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E23744] to-[#f42f3e] z-[70] origin-left shadow-sm"
        style={{ scaleX }}
      />

      {/* Modern Floating Header */}
      <header className="fixed top-2 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl h-16 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl z-50 flex items-center justify-between px-6 shadow-xl shadow-gray-200/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-600 active:scale-95"
          >
            {isSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E23744] to-[#ff4d2d] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#E23744]/30 transform hover:rotate-12 transition-transform cursor-pointer">
              <FaBook size={18} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">Vingo Docs</h1>
              <span className="text-[10px] text-[#E23744] font-bold uppercase tracking-wider">v1.0.0 Stable</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-12 hidden lg:block relative">
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E23744] transition-colors" size={14} />
            <input 
              type="text"
              placeholder="Search guides, components, or APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-gray-100/50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E23744]/20 focus:bg-white focus:border-[#E23744]/20 transition-all placeholder:text-gray-400"
            />
          </div>

          <AnimatePresence>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-[60] max-h-96 overflow-y-auto"
              >
                {flatNavItems.filter(item => 
                  item.label.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateToSection(item.id);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all text-left group"
                  >
                    <span className="text-gray-400 group-hover:text-[#E23744]">{item.icon}</span>
                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-bold text-gray-500 hover:text-[#E23744] transition-colors hidden md:block">App</a>
          <a 
            href="https://github.com/adarsh-priydarshi-5646/Food-Delivery-Full-Stack-App" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-300 transform active:scale-95"
          >
            GitHub
          </a>
        </div>
      </header>

      <div className="flex pt-24 h-full px-4 md:px-8 max-w-[1600px] mx-auto overflow-hidden">
        <aside className={`fixed md:sticky top-24 left-0 h-[calc(100vh-120px)] w-72 bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border border-gray-100 md:border-none rounded-3xl z-40 transition-all duration-500 shadow-2xl md:shadow-none transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)] md:translate-x-0'} overflow-y-auto custom-scrollbar pr-4`}>
          <nav className="p-4 space-y-8">
            {navItems.map((group, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-4">{group.title}</h3>
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a 
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToSection(item.id);
                        }}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden
                          ${activeSection === item.id 
                            ? 'bg-gradient-to-r from-[#E23744]/10 to-transparent text-[#E23744] shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}
                          ${item.inset ? 'ml-5 border-l border-gray-100' : ''}`}
                      >
                        <span className={`transition-all duration-300 transform group-hover:scale-110 ${activeSection === item.id ? 'text-[#E23744]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                          {item.icon}
                        </span>
                        {item.label}
                        {activeSection === item.id && (
                          <motion.div 
                            layoutId="activeSidePill"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-[#E23744] rounded-r-full"
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

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-30 md:hidden"
            />
          )}
        </AnimatePresence>

        <main className="flex-1 w-full max-w-4xl mx-auto h-[calc(100vh-140px)] bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-y-auto custom-scrollbar relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#E23744] via-[#ff4d2d] to-[#E23744] opacity-50 sticky top-0 z-[20]"></div>
          
          <div className="p-8 md:p-14 lg:p-16">
            {sections[activeSection] && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="mb-12">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#E23744] mb-4">
                     <span className="opacity-50">Docs</span>
                     <FaChevronRight size={8} className="opacity-30" />
                     <span>{flatNavItems.find(n => n.id === activeSection)?.label}</span>
                   </div>
                   <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                     {sections[activeSection].title}
                   </h1>
                </div>
                
                <article 
                  className="docs-content prose prose-slate max-w-none 
                    prose-headings:font-black prose-headings:tracking-[-0.03em] prose-headings:text-gray-900
                    prose-h1:hidden
                    prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pt-8 prose-h2:text-gray-900 prose-h2:tracking-tight
                    prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:font-black prose-h3:text-gray-800
                    prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-[18px] prose-p:font-medium
                    prose-ul:list-none prose-ul:ml-0 prose-ul:mb-10
                    prose-li:text-gray-600 prose-li:mb-5 prose-li:pl-10 prose-li:relative prose-li:font-medium prose-li:text-[17px]
                    prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[12px] prose-li:before:w-2.5 prose-li:before:h-2.5 prose-li:before:bg-gradient-to-br prose-li:before:from-[#E23744] prose-li:before:to-[#ff4d2d] prose-li:before:rounded-full
                    prose-blockquote:border-l-[8px] prose-blockquote:border-[#E23744] prose-blockquote:bg-[#E23744]/5 prose-blockquote:px-10 prose-blockquote:py-10 prose-blockquote:italic prose-blockquote:rounded-[2rem] prose-blockquote:text-[#E23744] prose-blockquote:font-bold prose-blockquote:my-16 prose-blockquote:shadow-sm
                    prose-code:bg-gray-100 prose-code:text-[#E23744] prose-code:px-2.5 prose-code:py-1 prose-code:rounded-lg prose-code:font-black prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-[#0d1117] prose-pre:text-gray-300 prose-pre:p-10 prose-pre:rounded-[1.5rem] prose-pre:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] prose-pre:my-14 prose-pre:border prose-pre:border-white/10 prose-pre:relative
                    prose-a:text-[#E23744] prose-a:font-black prose-a:no-underline border-b-2 border-[#E23744]/20 hover:border-[#E23744] transition-all
                    prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-16 prose-img:mx-auto prose-img:border-[10px] prose-img:border-white shadow-xl
                    prose-table:w-full prose-table:text-sm prose-table:my-14 prose-table:rounded-[2rem] prose-table:border-collapse prose-table:shadow-2xl prose-table:shadow-gray-100
                    prose-thead:bg-[#1a1c1e] prose-th:px-8 prose-th:py-6 prose-th:text-white prose-th:font-black prose-th:text-left prose-th:uppercase prose-th:tracking-[0.15em] prose-th:text-[10px] prose-th:border-none
                    prose-td:px-8 prose-td:py-6 prose-td:text-gray-600 prose-td:font-bold prose-tr:border-b last:prose-tr:border-none prose-tr:border-gray-50 hover:prose-tr:bg-gray-50 transition-colors"
                  dangerouslySetInnerHTML={{ __html: sections[activeSection].html }}
                />
              </motion.div>
            )}

            <div className="mt-24 pt-16 border-t-[3px] border-dotted border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-8">
              {prevSection && (
                <button 
                  onClick={() => navigateToSection(prevSection.id)}
                  className="w-full sm:w-auto flex flex-col items-start gap-2 p-7 bg-[#fafafa] text-gray-400 font-bold rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-gray-200 transition-all active:scale-95 group border border-transparent hover:border-gray-100"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#E23744]">Previous Section</span>
                  <div className="flex items-center gap-4 text-gray-900 text-lg">
                    <FaChevronRight className="rotate-180 group-hover:-translate-x-2 transition-transform" size={12} />
                    {prevSection.label}
                  </div>
                </button>
              )}
              {nextSection && (
                <button 
                  onClick={() => navigateToSection(nextSection.id)}
                  className="ml-auto w-full sm:w-auto flex flex-col items-end gap-2 p-7 bg-gradient-to-br from-[#E23744]/5 to-[#ff4d2d]/5 text-gray-400 font-bold rounded-3xl shadow-xl shadow-gray-100 hover:shadow-2xl hover:bg-white transition-all active:scale-95 group border border-gray-100"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#E23744]">Next Section</span>
                  <div className="flex items-center gap-4 text-gray-900 text-lg">
                    {nextSection.label}
                    <FaChevronRight className="group-hover:translate-x-2 transition-transform" size={12} />
                  </div>
                </button>
              )}
            </div>
            
            <div className="mt-20 pt-12 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] leading-loose text-center md:text-left">
                © 2025 Vingo Technical Portal. <br className="md:hidden" /> Crafted for Developers.
              </p>
              <div className="flex gap-10">
                <a href="#" className="text-[10px] font-black text-gray-400 hover:text-[#E23744] transition-colors tracking-widest uppercase">Twitter</a>
                <a href="#" className="text-[10px] font-black text-gray-400 hover:text-[#E23744] transition-colors tracking-widest uppercase">Discord</a>
                <a href="#" className="text-[10px] font-black text-gray-400 hover:text-[#E23744] transition-colors tracking-widest uppercase">Terms</a>
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden xl:block w-80 h-[calc(100vh-140px)] sticky top-24 p-8 overflow-y-auto pl-12 border-l border-gray-100">
          <div className="space-y-10">
            <div>
              <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
                <span className="w-2 h-4 bg-gradient-to-b from-[#E23744] to-[#ff4d2d] rounded-full"></span> 
                On This Page
              </h4>
              <ul className="space-y-6">
                {[
                  { id: "overview", label: "Executive Summary" },
                  { id: "architecture", label: "System Architecture" },
                  { id: "core-components", label: "Core Components" },
                  { id: "frontend-guide", label: "Frontend Documentation" },
                  { id: "backend-guide", label: "Backend Documentation" },
                  { id: "database-models", label: "Database Schema" },
                  { id: "api-reference", label: "API Reference" },
                  { id: "optimizations", label: "Performance Optimizations" }
                ].map((link) => (
                  <li key={link.id}>
                    <a 
                      href={`#${link.id}`} 
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToSection(link.id);
                      }}
                      className={`text-[12px] transition-all duration-500 border-l-[3px] py-1.5 pl-6 block uppercase tracking-wider
                        ${activeSection === link.id 
                          ? 'text-[#E23744] border-[#E23744] font-black translate-x-3 scale-105 shadow-sm' 
                          : 'text-gray-400 border-transparent hover:text-gray-950 hover:border-gray-300'}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E23744]/10 rounded-full blur-2xl group-hover:bg-[#E23744]/20 transition-all duration-700"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E23744] mb-4">Pro Tip</p>
              <p className="text-xs font-bold leading-relaxed text-gray-300">
                Use <code className="bg-white/10 px-2 py-0.5 rounded text-[#E23744] font-black transition-colors group-hover:bg-white/20">CMD + K</code> to search documentation instantly.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0, rotate: 45 }}
            onClick={scrollToTop}
            title="Scroll to top"
            className="fixed bottom-10 right-10 w-16 h-16 bg-white text-[#E23744] rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-[#E23744] hover:text-white hover:-translate-y-2 transition-all duration-500 z-[60] border border-gray-100 group"
          >
            <FaArrowUp size={20} className="group-hover:scale-125 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #E2374440; }
        
        html { scroll-behavior: smooth; }
        
        .docs-content pre { overflow-x: auto; tab-size: 2; scrollbar-width: none; }
        .docs-content pre::-webkit-scrollbar { display: none; }
        .docs-content pre code { color: inherit; background: transparent; padding: 0; font-size: 0.95em; font-weight: normal; font-family: 'JetBrains Mono', monospace; }
        .docs-content pre::before { 
          content: 'TERMINAL'; position: absolute; right: 2rem; top: 1.2rem; 
          font-size: 0.65rem; color: #E23744; font-weight: 900; letter-spacing: 0.4em;
          opacity: 0.8;
        }
        
        .docs-content a { position: relative; }
        .docs-content a:hover::after { width: 100%; }
        .docs-content a::after {
          content: ''; position: absolute; bottom: -2px; left: 0; width: 0; h-0.5 bg-[#E23744] transition-all duration-300;
        }
        
        /* Mermaid Diagram Styling Overlay */
        .docs-content .mermaid { background: white; padding: 2rem; border-radius: 2rem; border: 1px solid #f1f1f1; margin: 3rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }

        @media (max-width: 768px) {
          .docs-content h1 { font-size: 2.5rem; }
          .docs-content p { font-size: 16px; }
          .docs-content article { padding: 1rem; }
        }
      `}} />
    </div>
  );
};

export default Documentation;
