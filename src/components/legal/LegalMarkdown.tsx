import ReactMarkdown from 'react-markdown'

interface LegalMarkdownProps {
  content: string
}

const LegalMarkdown = ({ content }: LegalMarkdownProps) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mb-4">{children}</h2>,
        h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-medium text-gray-800 mb-2 mt-6">{children}</h3>,
        p: ({ children }) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>,
        li: ({ children }) => <li className="text-gray-700">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline">{children}</a>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default LegalMarkdown
