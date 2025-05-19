'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Blockquote from '@tiptap/extension-blockquote';
import { useState, useEffect } from 'react';

// Import icons
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered as OrderedListIcon,
  Link as LinkIcon,
  Quote as QuoteIcon,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Undo,
  Redo,
  Indent,
  Outdent,
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange?: (html: string) => void;
  disabled?: boolean;
  editorClass?: string;
  showToolbar?: boolean;
  placeholder?: string;
  maxLength?: number;
  scrollable?: boolean;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/30">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}`}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}`}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('bold') ? 'bg-muted' : ''}`}
        title="Bold"
      >
        <BoldIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('italic') ? 'bg-muted' : ''}`}
        title="Italic"
      >
        <ItalicIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('underline') ? 'bg-muted' : ''}`}
        title="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
        title="Bullet List"
      >
        <ListIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
        title="Ordered List"
      >
        <OrderedListIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('blockquote') ? 'bg-muted' : ''}`}
        title="Blockquote"
      >
        <QuoteIcon className="h-4 w-4" />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        type="button"
        onClick={addLink}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('link') ? 'bg-muted' : ''}`}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={addTable}
        className={`p-1 rounded hover:bg-muted ${editor.isActive('table') ? 'bg-muted' : ''}`}
        title="Insert Table"
      >
        <TableIcon className="h-4 w-4" />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().lift('listItem').run()}
        className="p-1 rounded hover:bg-muted"
        title="Outdent"
      >
        <Outdent className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        className="p-1 rounded hover:bg-muted"
        title="Indent"
      >
        <Indent className="h-4 w-4" />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-1 rounded hover:bg-muted"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-1 rounded hover:bg-muted"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function TipTapEditor({
  content,
  onChange,
  disabled = false,
  editorClass = '',
  showToolbar = true,
  placeholder = 'Start typing...',
  maxLength = 1000000, // Set a very high default max length
  scrollable = false,
}: TipTapEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      BulletList,
      OrderedList,
      Heading,
      Bold,
      Italic,
      Underline,
      Blockquote,
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Calculate character count from HTML content
      const textContent = editor.getText();
      setCharCount(textContent.length);

      // Only update if within max length
      if (textContent.length <= maxLength && onChange) {
        onChange(html);
      } else if (textContent.length > maxLength) {
        // If over limit, truncate the content
        const truncatedText = textContent.substring(0, maxLength);
        editor.commands.setContent(truncatedText);
      }
    },
  });

  // Handle content updates from parent
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!isMounted) {
    return (
      <div className={`border rounded-md p-4 bg-muted ${editorClass}`}>
        <p className="text-center text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-md overflow-hidden ${editorClass}`}>
      {showToolbar && !disabled && <MenuBar editor={editor} />}
      <div className={`${scrollable ? 'overflow-auto' : ''} h-full`}>
        <EditorContent
          editor={editor}
          className={`prose max-w-none p-4 focus:outline-none ${disabled ? 'bg-muted/30 cursor-not-allowed' : ''}`}
        />
      </div>
      {!disabled && (
        <div className="text-xs text-muted-foreground p-1 border-t text-right">
          {charCount}/{maxLength} characters
        </div>
      )}
    </div>
  );
}
