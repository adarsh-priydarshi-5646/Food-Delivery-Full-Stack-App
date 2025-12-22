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
    const mainContent = document.querySelector("main");
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToSection = (id) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
    const mainContent = document.querySelector("main");
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-sans">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="inline-block h-12 w-12 rounded-full border-4 border-solid border-[#E23744] border-r-transparent"
          />
          <p className="mt-4 text-lg text-gray-700 font-medium">Preparing Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#fafafa] font-sans selection:bg-[#E23744]/20 selection:text-[#E23744] overflow-hidden">
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

        <main className="flex-1 w-full h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
            <div className="bg-white border border-gray-100 rounded-[3rem] shadow-2xl shadow-gray-200/40 relative overflow-hidden mt-8 mb-16 px-8 md:px-16 lg:p-20 py-12 md:py-20">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#E23744] via-[#ff4d2d] to-[#E23744] opacity-40"></div>
              
              {sections[activeSection] && (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="mb-16">
                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-[#E23744] mb-6">
                      <span className="bg-[#E23744]/10 px-3 py-1 rounded-full">Documentation</span>
                      <FaChevronRight size={10} className="opacity-30" />
                      <span className="text-gray-400">{flatNavItems.find(n => n.id === activeSection)?.label}</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[1.1]">
                      {sections[activeSection].title}
                    </h1>
                  </div>
                  
                  <article 
                    className="docs-content prose prose-slate max-w-none
                      prose-headings:text-gray-900 prose-headings:font-extrabold prose-headings:tracking-tight
                      prose-h1:hidden
                      prose-h2:text-4xl prose-h2:mt-32 prose-h2:mb-10 prose-h2:pb-8 prose-h2:border-b prose-h2:border-gray-100 prose-h2:tracking-tight
                      prose-h3:text-2xl prose-h3:mt-16 prose-h3:mb-8 prose-h3:font-bold prose-h3:text-gray-800
                      prose-p:text-gray-600 prose-p:leading-[1.9] prose-p:mb-12 prose-p:text-[18px]
                      prose-ul:my-10 prose-ul:list-disc prose-ul:pl-8
                      prose-li:text-gray-600 prose-li:my-4 prose-li:leading-relaxed prose-li:text-[17px]
                      prose-strong:text-gray-900 prose-strong:font-black prose-strong:bg-yellow-100/30 prose-strong:px-1 prose-strong:rounded
                      prose-blockquote:border-l-8 prose-blockquote:border-[#E23744] prose-blockquote:bg-gray-50 prose-blockquote:text-gray-700 prose-blockquote:py-10 prose-blockquote:px-12 prose-blockquote:rounded-r-3xl prose-blockquote:italic prose-blockquote:my-16 prose-blockquote:shadow-sm
                      prose-code:bg-[#E23744]/10 prose-code:text-[#E23744] prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:font-bold prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-[#0f172a] prose-pre:text-gray-300 prose-pre:p-10 prose-pre:rounded-[2rem] prose-pre:shadow-2xl prose-pre:my-16 prose-pre:border prose-pre:border-white/5
                      prose-a:text-[#E23744] prose-a:font-bold prose-a:no-underline border-b-2 border-[#E23744]/10 hover:border-[#E23744] transition-all
                      prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:my-20 prose-img:border-[12px] prose-img:border-white
                      prose-table:text-[16px] prose-table:my-16 prose-table:border-collapse prose-table:w-full prose-table:shadow-xl prose-table:shadow-gray-100/50 prose-table:rounded-3xl prose-table:overflow-hidden
                      prose-thead:bg-gray-900 prose-th:px-8 prose-th:py-6 prose-th:text-white prose-th:font-extrabold prose-th:text-left prose-th:uppercase prose-th:tracking-widest prose-th:text-[10px] prose-th:border-none
                      prose-td:px-8 prose-td:py-6 prose-td:text-gray-600 prose-td:border-b prose-td:border-gray-50 prose-tr:hover:bg-gray-50/80 transition-colors"
                    dangerouslySetInnerHTML={{ __html: sections[activeSection].html }}
                  />
                </motion.div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-10 mb-24 px-4">
              {prevSection && (
                <button 
                  onClick={() => navigateToSection(prevSection.id)}
                  className="w-full sm:w-auto flex flex-col items-start gap-2 pb-4 group text-left border-b-[3px] border-transparent hover:border-[#E23744] transition-all"
                >
                  <span className="text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] group-hover:text-[#E23744] transition-colors">Previous Section</span>
                  <div className="flex items-center gap-4 text-gray-900 font-black text-xl">
                    <FaChevronRight className="rotate-180 group-hover:-translate-x-2 transition-transform" size={16} />
                    {prevSection.label}
                  </div>
                </button>
              )}
              {nextSection && (
                <button 
                  onClick={() => navigateToSection(nextSection.id)}
                  className="ml-auto w-full sm:w-auto flex flex-col items-end gap-2 pb-4 group text-right border-b-[3px] border-transparent hover:border-[#E23744] transition-all"
                >
                  <span className="text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] group-hover:text-[#E23744] transition-colors">Next Section</span>
                  <div className="flex items-center gap-4 text-gray-900 font-black text-xl">
                    {nextSection.label}
                    <FaChevronRight className="group-hover:translate-x-2 transition-transform" size={16} />
                  </div>
                </button>
              )}
            </div>
            
            <div className="pt-12 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 mb-20 px-4">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] leading-loose text-center md:text-left">
                © 2025 Vingo Technical Portal. <br className="md:hidden" /> Crafted for the Next Generation of Developers.
              </p>
              <div className="flex gap-12">
                <a href="#" className="text-[10px] font-black text-gray-400 hover:text-[#E23744] transition-colors tracking-widest uppercase">Twitter</a>
                <a href="#" className="text-[10px] font-black text-gray-400 hover:text-[#E23744] transition-colors tracking-widest uppercase">Discord</a>
                <a href="#" className="text-[10px] font-black text-gray-400 hover:text-[#E23744] transition-colors tracking-widest uppercase">GitHub</a>
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden xl:block w-72 h-[calc(100vh-140px)] sticky top-24 pl-12 overflow-y-auto custom-scrollbar">
          <div className="space-y-12">
            <div>
              <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.2em] mb-6">On This Page</h4>
              <ul className="space-y-5 border-l border-gray-100">
                {[
                  { id: "overview", label: "Executive Summary" },
                  { id: "architecture", label: "System Architecture" },
                  { id: "core-components", label: "Core Components" },
                  { id: "frontend-guide", label: "Frontend Internals" },
                  { id: "backend-guide", label: "Backend Internals" },
                  { id: "database-models", label: "Database Models" },
                  { id: "api-reference", label: "REST API Docs" },
                  { id: "optimizations", label: "Performance" }
                ].map((link) => (
                  <li key={link.id}>
                    <a 
                      href={`#${link.id}`} 
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToSection(link.id);
                      }}
                      className={`text-[13px] transition-all duration-300 pl-5 block py-1 border-l-2 -ml-px font-medium
                        ${activeSection === link.id 
                          ? 'text-[#E23744] border-[#E23744] font-bold' 
                          : 'text-gray-400 border-transparent hover:text-gray-700 hover:border-gray-200'}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#E23744] mb-3">Developer Help</p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Use <code className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[#E23744] text-[11px] font-bold">CMD + K</code> to instantly jump between sections.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 w-14 h-14 bg-white text-[#E23744] rounded-2xl shadow-2xl flex items-center justify-center hover:bg-[#E23744] hover:text-white transition-all duration-500 z-[60] border border-gray-100 active:scale-95 group"
          >
            <FaArrowUp size={18} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f3f4f6; border-radius: 20px; border: 4px solid white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e5e7eb; }
        
        .docs-content pre::-webkit-scrollbar { height: 6px; }
        .docs-content pre::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        
        .docs-content pre code { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        
        .docs-content hr { margin-top: 6rem; margin-bottom: 6rem; border-color: #f3f4f6; border-style: dotted; border-width: 2px; }
        
        /* Smooth transitions for all elements */
        * { transition-property: none; }
        .transition-all { transition-property: all; transition-duration: 300ms; }
        .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-duration: 200ms; }
        
        @media (max-width: 768px) {
          .docs-content h1 { font-size: 2.25rem; }
          .docs-content p { font-size: 17px; }
          .docs-content article { padding: 1rem; }
        }
      `}} />
    </div>
  );
};

export default Documentation;
