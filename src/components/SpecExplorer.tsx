import React, { useState } from "react";
import { specDocs, SpecDoc } from "../data/docs";
import { Search, ClipboardList, ListChecks, User, Database, Code, Network, Settings, BookOpen } from "lucide-react";

export default function SpecExplorer() {
  const [selectedId, setSelectedId] = useState<string>("prd");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "ClipboardList": return <ClipboardList className="w-5 h-5 text-indigo-500" />;
      case "ListChecks": return <ListChecks className="w-5 h-5 text-emerald-500" />;
      case "User": return <User className="w-5 h-5 text-cyan-500" />;
      case "Database": return <Database className="w-5 h-5 text-amber-500" />;
      case "Code": return <Code className="w-5 h-5 text-purple-500" />;
      case "Network": return <Network className="w-5 h-5 text-teal-500" />;
      case "Settings": return <Settings className="w-5 h-5 text-pink-500" />;
      default: return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredDocs = specDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDoc = specDocs.find(d => d.id === selectedId) || specDocs[0];

  // A very simple markdown-to-HTML parser for beautiful document layouts
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, index) => {
      // Headers
      if (line.startsWith("### ")) {
        return <h4 key={index} className="text-md font-semibold text-gray-800 mt-4 mb-2">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={index} className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-1 mt-6 mb-3">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={index} className="text-xl font-extrabold text-indigo-950 mt-2 mb-4">{line.replace("# ", "")}</h2>;
      }
      // Bullet points
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const cleanLine = line.replace(/^[-*]\s+/, "");
        // Check for inline bolding e.g. **bold**
        return (
          <li key={index} className="text-sm text-gray-600 ml-4 list-disc space-y-1 py-0.5">
            {parseInlineStyling(cleanLine)}
          </li>
        );
      }
      // Code blocks or JSON blocks
      if (line.startsWith("```") || line.startsWith("`")) {
        if (line === "```" || line === "```json" || line === "```python") return null;
        return (
          <pre key={index} className="bg-gray-50 text-xs font-mono p-3 rounded-lg border border-gray-100 text-gray-700 my-2 overflow-x-auto whitespace-pre-wrap">
            {line.replace(/`/g, "")}
          </pre>
        );
      }
      // Table rows (conceptual representation)
      if (line.startsWith("|")) {
        const cells = line.split("|").filter(c => c.trim() !== "");
        if (line.includes("---")) return <div key={index} className="border-t border-gray-100 my-1"></div>;
        return (
          <div key={index} className="flex bg-white hover:bg-gray-50 border-b border-gray-100 text-xs py-2 px-1">
            {cells.map((cell, idx) => (
              <span key={idx} className={`flex-1 text-gray-700 ${idx === 0 ? 'font-semibold text-gray-900' : ''}`}>
                {cell.trim()}
              </span>
            ))}
          </div>
        );
      }
      // Empty line
      if (line.trim() === "") return <div key={index} className="h-2"></div>;

      // Regular paragraph
      return <p key={index} className="text-sm text-gray-600 leading-relaxed mb-2">{parseInlineStyling(line)}</p>;
    });
  };

  const parseInlineStyling = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="bg-gray-50 text-rose-600 font-mono text-xs px-1.5 py-0.5 rounded border border-gray-100">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div id="spec-explorer" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[720px]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 border-r border-gray-100 bg-gray-50/50 p-4 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Specification Explorer</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedId(doc.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                selectedId === doc.id
                  ? "bg-white text-indigo-950 border border-indigo-100 shadow-sm font-medium"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              {getIcon(doc.icon)}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{doc.title}</p>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{doc.category}</span>
              </div>
            </button>
          ))}
          {filteredDocs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-gray-400">No specification files found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Document Reader Container */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {selectedDoc.category}
            </span>
            <h1 className="text-md font-bold text-gray-900 mt-1">{selectedDoc.title}</h1>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            {selectedDoc.id.toUpperCase()}.MD
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 select-text selection:bg-indigo-100">
          <div className="max-w-2xl">
            {renderMarkdown(selectedDoc.content)}
          </div>
        </div>
      </div>
    </div>
  );
}
