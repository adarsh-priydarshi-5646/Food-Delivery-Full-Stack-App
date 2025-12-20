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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Optional: Add toast notification here if available
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
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E23744] to-[#f42f3e] z-[70] origin-left shadow-sm"
        style={{ scaleX }}
      />

      {/* Modern Floating Header */}
      <header className="fixed top-2 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl h-16 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl z-50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-600 active:scale-95"
          >
            {isSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E23744] rounded-lg flex items-center justify-center text-white shadow-md transform hover:rotate-3 transition-transform cursor-pointer">
              <FaBook size={16} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none">Vingo Docs</h1>
              <span className="text-[9px] text-[#E23744] font-bold uppercase tracking-widest">v1.1.0 Stable</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-12 hidden lg:block relative">
          <div className="relative group">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E23744] transition-colors" size={12} />
            <input 
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E23744]/10 focus:bg-white focus:border-[#E23744]/40 transition-all placeholder:text-gray-400"
            />
          </div>

          <AnimatePresence>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-[60] max-h-96 overflow-y-auto"
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
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-all text-left group"
                  >
                    <span className="text-gray-400 group-hover:text-[#E23744]">{item.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors hidden md:block">Launch App</a>
          <a 
            href="https://github.com/adarsh-priydarshi-5646/Food-Delivery-Full-Stack-App" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-all shadow-sm transform active:scale-95"
          >
            GitHub
          </a>
        </div>
      </header>

      <div className="flex pt-24 h-full px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
        <aside className={`fixed md:sticky top-24 left-0 h-[calc(100vh-120px)] w-64 bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none z-40 transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto custom-scrollbar pr-2`}>
          <nav className="p-2 space-y-6">
            {navItems.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-3">{group.title}</h3>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a 
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToSection(item.id);
                        }}
                        className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative
                          ${activeSection === item.id 
                            ? 'bg-[#E23744]/5 text-[#E23744]' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
                          ${item.inset ? 'ml-4 border-l border-gray-100' : ''}`}
                      >
                        <span className={`transition-colors duration-200 ${activeSection === item.id ? 'text-[#E23744]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                          {React.cloneElement(item.icon, { size: 14 })}
                        </span>
                        {item.label}
                        {activeSection === item.id && (
                          <motion.div 
                            layoutId="activeSidePill"
                            className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#E23744] rounded-full"
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
              className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-30 md:hidden"
            />
          )}
        </AnimatePresence>

        <main className="flex-1 w-full max-w-3xl ml-0 md:ml-8 h-[calc(100vh-140px)] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-y-auto custom-scrollbar relative">
          <div className="p-8 md:p-12 lg:p-14">
            {sections[activeSection] && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="mb-10">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#E23744] mb-3">
                     <span>Docs</span>
                     <FaChevronRight size={7} className="opacity-40" />
                     <span>{flatNavItems.find(n => n.id === activeSection)?.label}</span>
                   </div>
                   <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                     {sections[activeSection].title}
                   </h1>
                </div>
                
                <article 
                  className="docs-content prose prose-slate max-w-none
                    prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:hidden
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-50
                    prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-4
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-[16px]
                    prose-ul:my-6 prose-li:text-gray-700 prose-li:my-1
                    prose-blockquote:border-l-4 prose-blockquote:border-[#E23744] prose-blockquote:bg-gray-50 prose-blockquote:text-gray-700 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
                    prose-code:bg-gray-100 prose-code:text-[#E23744] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-semibold prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-[#1a1c1e] prose-pre:text-gray-200 prose-pre:p-6 prose-pre:rounded-xl prose-pre:shadow-sm prose-pre:my-8 prose-pre:relative prose-pre:overflow-x-auto
                    prose-a:text-[#E23744] prose-a:font-semibold hover:prose-a:underline underline-offset-4 decoration-2
                    prose-img:rounded-xl prose-img:shadow-md prose-img:my-10
                    prose-table:text-sm prose-table:my-8 prose-table:border-collapse
                    prose-thead:bg-gray-50 prose-th:px-4 prose-th:py-3 prose-th:text-gray-900 prose-th:text-left prose-th:border-b prose-th:border-gray-100
                    prose-td:px-4 prose-td:py-3 prose-td:text-gray-600 prose-td:border-b prose-td:border-gray-50 prose-tr:hover:bg-gray-50/50 transition-colors"
                  dangerouslySetInnerHTML={{ __html: sections[activeSection].html }}
                />
              </motion.div>
            )}

            <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
              {prevSection && (
                <button 
                  onClick={() => navigateToSection(prevSection.id)}
                  className="w-full sm:w-auto flex flex-col items-start gap-1 p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-95 group text-left"
                >
                  <span className="text-[9px] uppercase font-bold text-gray-400 group-hover:text-[#E23744] transition-colors">Previous</span>
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <FaChevronRight className="rotate-180" size={10} />
                    {prevSection.label}
                  </div>
                </button>
              )}
              {nextSection && (
                <button 
                  onClick={() => navigateToSection(nextSection.id)}
                  className="ml-auto w-full sm:w-auto flex flex-col items-end gap-1 p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-[#E23744]/5 transition-all active:scale-95 group text-right"
                >
                  <span className="text-[9px] uppercase font-bold text-gray-400 group-hover:text-[#E23744] transition-colors">Next</span>
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    {nextSection.label}
                    <FaChevronRight size={10} />
                  </div>
                </button>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden xl:block w-72 h-[calc(100vh-140px)] sticky top-24 pl-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-10">
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">On This Page</h4>
              <ul className="space-y-4 border-l border-gray-100">
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
                      className={`text-xs transition-all duration-200 pl-4 block py-0.5 border-l-2 -ml-px
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
            
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#E23744] mb-2">Shortcuts</p>
              <p className="text-xs text-gray-600 leading-normal font-medium">
                Press <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-900 text-[10px]">CMD + K</code> to search and jump between sections.
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
            className="fixed bottom-8 right-8 w-12 h-12 bg-white text-[#E23744] rounded-full shadow-lg flex items-center justify-center hover:bg-[#E23744] hover:text-white transition-all duration-300 z-[60] border border-gray-100 active:scale-90"
          >
            <FaArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        
        .docs-content pre::-webkit-scrollbar { height: 4px; }
        .docs-content pre::-webkit-scrollbar-thumb { background: #374151; }
        
        .docs-content pre code { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        
        .docs-content hr { margin-top: 4rem; margin-bottom: 4rem; border-color: #f3f4f6; }
        
        /* Smooth transitions for all elements */
        * { transition-property: none; }
        .transition-all { transition-property: all; }
        .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
        
        @media (max-width: 768px) {
          .docs-content h1 { font-size: 2.25rem; }
          .docs-content p { font-size: 16px; }
          .docs-content article { padding: 1rem; }
        }
      `}} />
    </div>
  );
};

export default Documentation;
