/** Minimal markdown-lite renderer for CMS/blog content (##, ###, **bold**, - lists, paragraphs). */
export function Prose({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const inline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p
    );
  };

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="list-disc pl-6 my-4 space-y-2 text-[var(--color-muted)]">
          {list.map((li, i) => <li key={i}>{inline(li)}</li>)}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    if (line.startsWith("### ")) { flushList(); blocks.push(<h3 key={key++} className="font-display text-xl mt-8 mb-3">{inline(line.slice(4))}</h3>); }
    else if (line.startsWith("## ")) { flushList(); blocks.push(<h2 key={key++} className="font-display text-2xl sm:text-3xl mt-10 mb-4">{inline(line.slice(3))}</h2>); }
    else if (line.startsWith("# ")) { flushList(); blocks.push(<h1 key={key++} className="font-display text-3xl mt-8 mb-4">{inline(line.slice(2))}</h1>); }
    else if (line.startsWith("- ")) { list.push(line.slice(2)); }
    else { flushList(); blocks.push(<p key={key++} className="my-4 text-[var(--color-muted)] leading-relaxed">{inline(line)}</p>); }
  }
  flushList();
  return <div className="max-w-3xl">{blocks}</div>;
}
