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
          <div className="max-w-6xl mx-auto">
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
                  className="prose prose-slate prose-xl max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                    prose-h1:text-6xl prose-h1:mb-12 prose-h1:mt-4 prose-h1:font-black prose-h1:leading-[1.1] prose-h1:text-gray-900
                    prose-h2:text-4xl prose-h2:mt-24 prose-h2:mb-10 prose-h2:font-bold prose-h2:border-b-2 prose-h2:border-gray-300 prose-h2:pb-6
                    prose-h3:text-3xl prose-h3:mt-20 prose-h3:mb-8 prose-h3:font-bold prose-h3:text-gray-800
                    prose-h4:text-2xl prose-h4:mt-16 prose-h4:mb-6 prose-h4:font-semibold prose-h4:text-gray-800
                    prose-p:text-gray-700 prose-p:leading-[1.9] prose-p:mb-10 prose-p:text-xl
                    prose-a:text-[#E23744] prose-a:no-underline prose-a:font-semibold hover:prose-a:underline prose-a:transition-all prose-a:decoration-2
                    prose-strong:text-gray-900 prose-strong:font-black prose-strong:bg-yellow-100 prose-strong:px-2 prose-strong:py-0.5 prose-strong:rounded-md prose-strong:shadow-sm
                    prose-em:text-gray-700 prose-em:italic prose-em:font-medium
                    prose-code:text-[#E23744] prose-code:bg-red-50 prose-code:px-3 prose-code:py-1.5 prose-code:rounded-lg prose-code:text-lg prose-code:font-mono prose-code:font-semibold prose-code:border prose-code:border-red-200 prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-8 prose-pre:rounded-2xl prose-pre:overflow-x-auto prose-pre:my-12 prose-pre:shadow-2xl prose-pre:border-2 prose-pre:border-gray-800
                    prose-ul:my-10 prose-ul:list-disc prose-ul:pl-8 prose-ul:space-y-4
                    prose-ol:my-10 prose-ol:list-decimal prose-ol:pl-8 prose-ol:space-y-4
                    prose-li:text-gray-700 prose-li:leading-[1.8] prose-li:text-xl prose-li:marker:text-[#E23744] prose-li:marker:font-bold
                    prose-blockquote:border-l-[6px] prose-blockquote:border-[#E23744] prose-blockquote:bg-red-50 prose-blockquote:pl-8 prose-blockquote:pr-6 prose-blockquote:py-6 prose-blockquote:my-12 prose-blockquote:italic prose-blockquote:text-gray-800 prose-blockquote:rounded-r-2xl prose-blockquote:shadow-md
                    prose-hr:border-gray-300 prose-hr:my-20 prose-hr:border-t-2
                    prose-table:w-full prose-table:my-12 prose-table:border-collapse prose-table:text-lg prose-table:shadow-xl prose-table:rounded-2xl prose-table:overflow-hidden
                    prose-thead:bg-gray-900 prose-thead:border-b-4 prose-thead:border-[#E23744]
                    prose-th:px-8 prose-th:py-6 prose-th:text-left prose-th:font-black prose-th:text-white prose-th:uppercase prose-th:tracking-wide prose-th:text-base prose-th:border-r-2 prose-th:border-gray-700 prose-th:last:border-r-0
                    prose-tbody:bg-white prose-tbody:divide-y-2 prose-tbody:divide-gray-200
                    prose-td:px-8 prose-td:py-6 prose-td:text-gray-700 prose-td:border-r prose-td:border-gray-200 prose-td:last:border-r-0 prose-td:align-top
                    prose-tr:hover:bg-gray-50 prose-tr:transition-colors prose-tr:border-b-2 prose-tr:border-gray-200
                    prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-12 prose-img:border-4 prose-img:border-gray-200
                    [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                    [&_mark]:bg-yellow-300 [&_mark]:px-2 [&_mark]:py-0.5 [&_mark]:rounded [&_mark]:font-bold [&_mark]:text-gray-900 [&_mark]:shadow-sm"
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
