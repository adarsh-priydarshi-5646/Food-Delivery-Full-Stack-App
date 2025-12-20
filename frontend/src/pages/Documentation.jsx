import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { FaBook, FaChevronRight, FaBars, FaTimes, FaArrowUp } from "react-icons/fa";

const Documentation = () => {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetch("/docs/technical-documentation.md")
      .then((res) => res.text())
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch documentation", err);
        setLoading(false);
      });

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#E23744] border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium font-outfit">Loading Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-outfit selection:bg-[#E23744] selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E23744] rounded-lg flex items-center justify-center text-white">
              <FaBook size={16} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vingo Docs</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="/" className="text-sm font-medium text-gray-600 hover:text-[#E23744] transition-colors">Go to App</a>
          <a href="https://github.com/adarsh-priydarshi-5646/Food-Delivery-Full-Stack-App" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-all">GitHub</a>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-64px)] w-64 bg-gray-50 border-r border-gray-100 z-40 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto custom-scrollbar`}>
          <nav className="p-6">
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Introduction</h3>
              <ul className="space-y-2">
                <li><a href="#introduction" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors"><FaChevronRight size={10} /> Introduction</a></li>
                <li><a href="#overview" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors"><FaChevronRight size={10} /> Overview</a></li>
                <li><a href="#architecture" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors"><FaChevronRight size={10} /> Architecture</a></li>
              </ul>
            </div>
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core Components</h3>
              <ul className="space-y-2">
                <li><a href="#core-components" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors"><FaChevronRight size={10} /> Core Components</a></li>
                <li><a href="#frontend-documentation" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors ml-4"><FaChevronRight size={10} /> Frontend Guide</a></li>
                <li><a href="#backend-documentation" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors ml-4"><FaChevronRight size={10} /> Backend Guide</a></li>
                <li><a href="#database-models" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors"><FaChevronRight size={10} /> Database Models</a></li>
              </ul>
            </div>
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Guides</h3>
              <ul className="space-y-2">
                <li><a href="#guides" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors"><FaChevronRight size={10} /> Guides</a></li>
                <li><a href="#optimizations" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors ml-4"><FaChevronRight size={10} /> Optimizations</a></li>
                <li><a href="#deployment" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#E23744] transition-colors ml-4"><FaChevronRight size={10} /> Deployment</a></li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:px-12">
          <article className="prose prose-slate max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
            prose-h1:text-4xl prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b prose-h1:border-gray-100
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
            prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
            prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6
            prose-li:text-gray-600 prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-[#E23744] prose-blockquote:bg-red-50 prose-blockquote:px-6 prose-blockquote:py-1 prose-blockquote:italic prose-blockquote:rounded-r-lg
            prose-code:bg-gray-100 prose-code:text-[#E23744] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:shadow-lg
            prose-a:text-[#E23744] prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-xl prose-img:border prose-img:border-gray-100
            prose-hr:border-gray-100 prose-hr:my-12
            prose-table:w-full prose-table:text-sm prose-thead:bg-gray-50 prose-th:px-4 prose-th:py-3 prose-td:px-4 prose-td:py-3 prose-tr:border-b prose-tr:border-gray-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </article>

          {/* Footer inside content */}
          <footer className="mt-20 pt-12 border-t border-gray-100 text-center">
            <p className="text-gray-400 text-sm">© 2025 Vingo Technical Documentation. Built for Production.</p>
          </footer>
        </main>

        {/* Table of Contents (Desktop Sidebar Right) */}
        <aside className="hidden xl:block w-64 h-[calc(100vh-64px)] sticky top-16 p-8 overflow-y-auto">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">On this page</h4>
          <ul className="space-y-3">
            <li><a href="#overview" className="text-xs text-gray-500 hover:text-[#E23744] transition-colors">Executive Summary</a></li>
            <li><a href="#system-architecture" className="text-xs text-gray-500 hover:text-[#E23744] transition-colors">System Architecture</a></li>
            <li><a href="#frontend-documentation" className="text-xs text-gray-500 hover:text-[#E23744] transition-colors">Frontend Documentation</a></li>
            <li><a href="#backend-documentation" className="text-xs text-gray-500 hover:text-[#E23744] transition-colors">Backend Documentation</a></li>
            <li><a href="#database-schema" className="text-xs text-gray-500 hover:text-[#E23744] transition-colors">Database Schema</a></li>
            <li><a href="#api-reference" className="text-xs text-gray-500 hover:text-[#E23744] transition-colors">API Reference</a></li>
            <li><a href="#performance-optimizations" className="text-xs text-gray-500 hover:text-[#E23744] transition-colors">Optimizations</a></li>
          </ul>
        </aside>
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-[#E23744] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#c12a35] transition-colors z-50"
          >
            <FaArrowUp />
          </motion.button>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        html { scroll-behavior: smooth; }
      `}} />
    </div>
  );
};

export default Documentation;
