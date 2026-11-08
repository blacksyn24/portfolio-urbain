import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Affiche du Markdown (articles, détails de projet). Le HTML brut est ignoré par sécurité. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
