'use client'

import dynamic from 'next/dynamic'

// Editor uses browser APIs — load client-only
const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '400px',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '2px',
      }}
    >
      <span
        style={{
          color: '#C4BFBA',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: '1.0625rem',
        }}
      >
        Loading editor…
      </span>
    </div>
  ),
})

export default function Page() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#F9F7F4',
        paddingTop: '80px',
        paddingBottom: '120px',
      }}
    >
      <div
        style={{
          maxWidth: '728px',
          margin: '0 auto',
          paddingLeft: '48px',
          paddingRight: '48px',
        }}
      >
        {/* Document title */}
        <div
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Untitled"
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: '2.75rem',
            fontWeight: 400,
            lineHeight: 1.18,
            color: '#1C1917',
            marginBottom: '36px',
            outline: 'none',
            letterSpacing: '-0.02em',
            minHeight: '1.18em',
          }}
          onFocus={(e) => {
            if (e.currentTarget.textContent === '') {
              e.currentTarget.style.color = '#1C1917'
            }
          }}
        />

        {/* Tiptap Editor */}
        <Editor />
      </div>
    </main>
  )
}
