'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string, text: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: content || '',
    editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-2' } },
    onUpdate: ({ editor }) => { onChange(editor.getHTML(), editor.getText()); },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className='border rounded-md'>
      <div className='flex flex-wrap gap-1 p-1 border-b bg-gray-50'>
        <button type='button' onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'px-2 py-1 text-xs rounded bg-gray-200' : 'px-2 py-1 text-xs rounded'}>B</button>
        <button type='button' onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'px-2 py-1 text-xs rounded bg-gray-200' : 'px-2 py-1 text-xs rounded'}>I</button>
        <button type='button' onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'px-2 py-1 text-xs rounded bg-gray-200' : 'px-2 py-1 text-xs rounded'}>U</button>
        <button type='button' onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'px-2 py-1 text-xs rounded bg-gray-200' : 'px-2 py-1 text-xs rounded'}>S</button>
        <button type='button' onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'px-2 py-1 text-xs rounded bg-gray-200' : 'px-2 py-1 text-xs rounded'}>•</button>
        <button type='button' onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'px-2 py-1 text-xs rounded bg-gray-200' : 'px-2 py-1 text-xs rounded'}>1.</button>
        <button type='button' onClick={() => editor.chain().focus().undo().run()} className='px-2 py-1 text-xs rounded'>↶</button>
        <button type='button' onClick={() => editor.chain().focus().redo().run()} className='px-2 py-1 text-xs rounded'>↷</button>
        <button type='button' onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className='px-2 py-1 text-xs rounded'>Clear</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

