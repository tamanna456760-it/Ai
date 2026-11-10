import React, { useState } from 'react';
import { X, Copy, Check, Code, FileDown, Upload, Share2 } from 'lucide-react';
import { BotConfig } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: BotConfig;
  onImportBot: (imported: BotConfig) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  bot,
  onImportBot,
}) => {
  const [activeTab, setActiveTab] = useState<'embed' | 'react' | 'json'>('embed');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = window.location.origin;

  const embedSnippet = `<!-- Boot AI Web Widget for ${bot.name} -->
<script>
  window.BootAIConfig = {
    botId: "${bot.id}",
    botName: "${bot.name}",
    apiEndpoint: "${currentOrigin}/api/chat",
    tone: "${bot.tone}"
  };
</script>
<script src="${currentOrigin}/widget.js" async></script>
<!-- Or embed as responsive iframe -->
<iframe
  src="${currentOrigin}?bot=${bot.id}&embed=true"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #1e293b;"
></iframe>`;

  const reactSnippet = `// React Integration for ${bot.name}
import React, { useState } from 'react';

export function ${bot.name.replace(/[^a-zA-Z0-9]/g, '')}Widget() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    const res = await fetch('${currentOrigin}/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: input }],
        botConfig: ${JSON.stringify(
          {
            name: bot.name,
            systemPrompt: bot.systemPrompt,
            tone: bot.tone,
            knowledgeBase: bot.knowledgeBase || '',
          },
          null,
          2
        )},
        stream: false
      })
    });
    const data = await res.json();
    setResponse(data.text);
    setLoading(false);
  };

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-white">
      <h3 className="font-bold text-sm">${bot.name}</h3>
      <p className="text-xs text-slate-400 mb-3">${bot.tagline}</p>
      {response && <div className="text-xs p-3 bg-slate-950 rounded mb-3">{response}</div>}
      <div className="flex gap-2">
        <input 
          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask ${bot.name}..." 
        />
        <button 
          onClick={sendMessage} 
          disabled={loading}
          className="bg-indigo-600 px-3 py-1 rounded text-xs"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}`;

  const jsonExport = JSON.stringify(bot, null, 2);

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bot.name.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed.name || !parsed.systemPrompt) {
        throw new Error('Invalid bot JSON: "name" and "systemPrompt" are required.');
      }
      const importedBot: BotConfig = {
        ...parsed,
        id: `custom-imported-${Date.now()}`,
        isCustom: true,
        createdAt: Date.now(),
      };
      onImportBot(importedBot);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">
              Export & Integrate {bot.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 px-6 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('embed')}
            className={`py-3 transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'embed'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            HTML & IFrame Snippet
          </button>
          <button
            onClick={() => setActiveTab('react')}
            className={`py-3 transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'react'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            React Component Code
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON Blueprint
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'embed' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Copy this HTML code snippet into your site to embed {bot.name} directly as an interactive widget or iframe.
              </p>
              <div className="relative">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  {embedSnippet}
                </pre>
                <button
                  onClick={() => handleCopy(embedSnippet, 'embed')}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors cursor-pointer"
                >
                  {copiedType === 'embed' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'react' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                A plug-and-play React functional component to query this bot using our server-side proxy route.
              </p>
              <div className="relative">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  {reactSnippet}
                </pre>
                <button
                  onClick={() => handleCopy(reactSnippet, 'react')}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors cursor-pointer"
                >
                  {copiedType === 'react' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Component</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Export or import bot definitions in structured JSON format.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={() => handleCopy(jsonExport, 'json')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs cursor-pointer"
                  >
                    {copiedType === 'json' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 max-h-40 overflow-y-auto leading-relaxed">
                {jsonExport}
              </pre>

              {/* Import Section */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Import Bot from JSON</span>
                </span>
                <textarea
                  rows={3}
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder="Paste bot blueprint JSON here to import into your library..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                {importError && (
                  <p className="text-[11px] text-rose-400">{importError}</p>
                )}
                <button
                  onClick={handleProcessImport}
                  disabled={!importJson.trim()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Import Blueprint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
