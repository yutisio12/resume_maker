'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import { useEffect, type ReactNode } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Link2,
  Unlink,
  Eraser,
} from 'lucide-react';
import { sanitizeExternalUrl, sanitizeHtml, sanitizeUrl } from '@/lib/utils/sanitize';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string, text: string) => void;
  singleLine?: boolean;
  label?: string;
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      className={active ? 'px-2 py-1 text-xs rounded is-active' : 'px-2 py-1 text-xs rounded'}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({ content, onChange, singleLine = false, label = 'Isi teks' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        isAllowedUri: (url) => Boolean(sanitizeUrl(url)),
        shouldAutoLink: (url) => Boolean(sanitizeUrl(url)),
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-2',
        'aria-label': label,
      },
      handleKeyDown: (_view, event) => {
        if (singleLine && event.key === 'Enter') return true;
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      const safeHtml = sanitizeHtml(html);
      if (safeHtml !== html) {
        onChange(safeHtml, editor.getText());
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const input = window.prompt('Masukkan URL (https://...)', previous || 'https://');
    if (input === null) return;

    const href = sanitizeExternalUrl(input);
    if (!href) {
      alert('URL tidak valid. Gunakan alamat http, https, mailto, atau tel.');
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  return (
    <div className='border border-[#75715e] rounded-md monokai-editor'>
      <div className='flex flex-wrap gap-1 p-1 border-b border-[#75715e] toolbar' role='toolbar' aria-label='Format teks'>
        <ToolbarButton label='Tebal' active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className='w-3.5 h-3.5' />
        </ToolbarButton>
        <ToolbarButton label='Miring' active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className='w-3.5 h-3.5' />
        </ToolbarButton>
        <ToolbarButton label='Garis bawah' active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline className='w-3.5 h-3.5' />
        </ToolbarButton>
        <ToolbarButton label='Coret' active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className='w-3.5 h-3.5' />
        </ToolbarButton>
        <ToolbarButton label='Daftar poin' active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className='w-3.5 h-3.5' />
        </ToolbarButton>
        <ToolbarButton label='Daftar bernomor' active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className='w-3.5 h-3.5' />
        </ToolbarButton>
        {!singleLine && (
          <>
            <ToolbarButton label={editor.isActive('link') ? 'Ubah tautan' : 'Tambah tautan'} active={editor.isActive('link')} onClick={setLink}>
              <Link2 className='w-3.5 h-3.5' />
            </ToolbarButton>
            {editor.isActive('link') && (
              <ToolbarButton label='Hapus tautan' onClick={() => editor.chain().focus().unsetLink().run()}>
                <Unlink className='w-3.5 h-3.5' />
              </ToolbarButton>
            )}
          </>
        )}
        <ToolbarButton label='Urungkan' disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className='w-3.5 h-3.5' />
        </ToolbarButton>
        <ToolbarButton label='Ulangi' disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className='w-3.5 h-3.5' />
        </ToolbarButton>
        <ToolbarButton label='Hapus format' onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser className='w-3.5 h-3.5' />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
