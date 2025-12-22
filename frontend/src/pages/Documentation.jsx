import React, { useState, useEffect } from "react";
import { marked } from "marked";
import { FaChevronRight, FaBars, FaTimes } from "react-icons/fa";

const Documentation = () => {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("introduction");

  const navItems = [
    { id: "introduction", label: "Introduction" },
    { id: "overview", label: "Overview" },
    { id: "architecture", label: "Architecture" },
    { id: "core-components", label: "Core Components" },
    { id: "frontend-guide", label: "Frontend Guide" },
    { id: "backend-guide", label: "Backend Guide" },
    { id: "database-models", label: "Database Models" },
    { id: "api-reference", label: "API Reference" },
    { id: "optimizations", label: "Optimizations" },
    { id: "deployment", label: "Deployment" },
  ];

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
        
        const parts = text.split(/^# /m);
        const sectionMap = {};
        
        parts.forEach(part => {
          if (!part.trim()) return;
          const lines = part.split("\n");
          const rawTitle = lines[0].trim();
          const content = lines.slice(1).join("\n").trim();
          
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
  }, []);

  const navigateToSection = (id) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
  };

  const currentIndex = navItems.findIndex(item => item.id === activeSection);
  const prevSection = currentIndex > 0 ? navItems[currentIndex - 1] : null;
  const nextSection = currentIndex < navItems.length - 1 ? navItems[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 rounded-full border-2 border-solid border-gray-900 border-r-transparent animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E23744] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                V
              </div>
              <span className="font-semibold text-gray-900">Vingo</span>
            </a>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/docs" className="text-sm font-medium text-gray-900">Docs</a>
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">App</a>
            <a 
              href="https://github.com/adarsh-priydarshi-5646/Food-Delivery-Full-Stack-App" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <div className="flex pt-16 max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <nav className="p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Documentation</p>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToSection(item.id);
                    }}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === item.id 
                        ? 'bg-gray-100 text-[#E23744] font-medium' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 md:px-8 py-8">
          <div className="max-w-5xl">
            {sections[activeSection] && (
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                  <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
                  <FaChevronRight size={10} />
                  <a href="/docs" className="hover:text-gray-900 transition-colors">Docs</a>
                  <FaChevronRight size={10} />
                  <span className="text-gray-900 font-medium">{sections[activeSection].title}</span>
                </div>

                {/* Content */}
                <article 
                  className="prose prose-slate prose-lg max-w-none
                    prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:tracking-tight
                    prose-h1:text-5xl prose-h1:mb-8 prose-h1:font-bold prose-h1:leading-tight
                    prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:font-semibold prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-4
                    prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h3:font-semibold
                    prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3 prose-h4:font-semibold
                    prose-p:text-gray-700 prose-p:leading-8 prose-p:mb-6 prose-p:text-lg
                    prose-a:text-[#E23744] prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:transition-all
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-em:text-gray-700 prose-em:italic
                    prose-code:text-[#E23744] prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-base prose-code:font-mono prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:my-8 prose-pre:shadow-lg
                    prose-pre:border prose-pre:border-gray-800
                    prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                    prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
                    prose-li:text-gray-700 prose-li:leading-7 prose-li:text-lg prose-li:marker:text-[#E23744]
                    prose-blockquote:border-l-4 prose-blockquote:border-[#E23744] prose-blockquote:bg-gray-50 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:rounded-r-lg
                    prose-hr:border-gray-200 prose-hr:my-12
                    prose-table:w-full prose-table:my-8 prose-table:border-collapse prose-table:text-base
                    prose-thead:bg-gray-50 prose-thead:border-b-2 prose-thead:border-gray-300
                    prose-th:px-6 prose-th:py-4 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 prose-th:border-r prose-th:border-gray-200 prose-th:last:border-r-0
                    prose-tbody:divide-y prose-tbody:divide-gray-200
                    prose-td:px-6 prose-td:py-4 prose-td:text-gray-700 prose-td:border-r prose-td:border-gray-200 prose-td:last:border-r-0
                    prose-tr:border-b prose-tr:border-gray-200
                    prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
                    [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: sections[activeSection].html }}
                />

                {/* Navigation */}
                <div className="flex items-center justify-between mt-16 pt-8 border-t border-gray-200">
                  {prevSection ? (
                    <button 
                      onClick={() => navigateToSection(prevSection.id)}
                      className="flex flex-col items-start group"
                    >
                      <span className="text-sm text-gray-500 mb-1">Previous</span>
                      <span className="text-base font-medium text-gray-900 group-hover:text-[#E23744] transition-colors">
                        {prevSection.label}
                      </span>
                    </button>
                  ) : <div />}
                  
                  {nextSection && (
                    <button 
                      onClick={() => navigateToSection(nextSection.id)}
                      className="flex flex-col items-end group"
                    >
                      <span className="text-sm text-gray-500 mb-1">Next</span>
                      <span className="text-base font-medium text-gray-900 group-hover:text-[#E23744] transition-colors">
                        {nextSection.label}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - On This Page */}
        <aside className="hidden xl:block w-56 h-[calc(100vh-4rem)] overflow-y-auto sticky top-16 px-4 py-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">On this page</p>
          <ul className="space-y-3 text-sm border-l border-gray-200">
            {navItems.slice(0, 8).map((item) => (
              <li key={item.id}>
                <a 
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToSection(item.id);
                  }}
                  className={`block pl-4 py-1 border-l-2 -ml-px transition-colors ${
                    activeSection === item.id
                      ? 'border-[#E23744] text-[#E23744] font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Documentation;
