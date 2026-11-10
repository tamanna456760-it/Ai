import React, { useState } from 'react';
import { marked } from 'marked';
import { Check, Copy } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Pre-process markdown to render formatted text and detect code blocks
  const renderFormatted = () => {
    try {
      // Split by code fences ```lang\ncode\n``` to create rich interactive code blocks
      const parts = content.split(/(```[\s\S]*?```)/g);

      return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trimStart();
          const firstLineBreak = lines.indexOf('\n');
          let lang = 'code';
          let codeBody = lines;

          if (firstLineBreak !== -1) {
            const rawLang = lines.slice(0, firstLineBreak).trim();
            if (rawLang) {
              lang = rawLang;
              codeBody = lines.slice(firstLineBreak + 1);
            }
          }

          const snippetId = `snippet-${index}`;
          const isCopied = copiedSnippet === snippetId;

          return (
            <div
              key={index}
              className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900/90 text-sm shadow-sm"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span className="uppercase font-medium tracking-wide">{lang}</span>
                <button
                  onClick={() => handleCopyCode(codeBody, snippetId)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto font-mono text-[13px] leading-relaxed text-slate-200">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Standard markdown content rendered as HTML
        const html = marked.parse(part) as string;
        return (
          <div
            key={index}
            className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-2 [&_p]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:text-white [&_strong]:font-semibold [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-100 [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-3 [&_blockquote]:text-slate-400 [&_code]:bg-slate-800/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-indigo-300 [&_code]:text-xs [&_code]:font-mono"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      });
    } catch {
      return <div className="whitespace-pre-wrap text-sm text-slate-200">{content}</div>;
    }
  };

  return <div className="space-y-1">{renderFormatted()}</div>;
};
