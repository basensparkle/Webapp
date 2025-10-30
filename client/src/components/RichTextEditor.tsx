import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-background text-foreground"
      />
      <style>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          border-color: hsl(var(--border));
        }
        .rich-text-editor .ql-toolbar {
          background: hsl(var(--card));
          border-color: hsl(var(--border));
        }
        .rich-text-editor .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .rich-text-editor .ql-fill {
          fill: hsl(var(--foreground));
        }
        .rich-text-editor .ql-picker-label {
          color: hsl(var(--foreground));
        }
        .rich-text-editor .ql-picker-options {
          background: hsl(var(--card));
          border-color: hsl(var(--border));
        }
        .rich-text-editor .ql-picker-item:hover {
          color: hsl(var(--primary));
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
}
