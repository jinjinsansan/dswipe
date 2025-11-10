'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Blockquote from '@tiptap/extension-blockquote';
import HardBreak from '@tiptap/extension-hard-break';
import Image from '@tiptap/extension-image';
import { Bars3BottomLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { BoldIcon, HeadingIcon, ItalicIcon, ListBulletIcon } from './icons/RichEditorIcons';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import type { NoteRichContent } from '@/types';

const AccessParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      access: {
        default: 'public',
        parseHTML: (element) => element.getAttribute('data-access') || 'public',
        renderHTML: (attributes) => {
          return {
            'data-access': attributes.access || 'public',
          };
        },
      },
    };
  },
});

const AccessHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      access: {
        default: 'public',
        parseHTML: (element) => element.getAttribute('data-access') || 'public',
        renderHTML: (attributes) => ({ 'data-access': attributes.access || 'public' }),
      },
    };
  },
});

const AccessListItem = ListItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      access: {
        default: 'public',
        parseHTML: (element) => element.getAttribute('data-access') || 'public',
        renderHTML: (attributes) => ({ 'data-access': attributes.access || 'public' }),
      },
    };
  },
});

const AccessBulletList = BulletList.extend({
  addAttributes() {
    return {
      access: {
        default: 'public',
        parseHTML: (element) => element.getAttribute('data-access') || 'public',
        renderHTML: (attributes) => ({ 'data-access': attributes.access || 'public' }),
      },
    };
  },
});

const AccessOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      access: {
        default: 'public',
        parseHTML: (element) => element.getAttribute('data-access') || 'public',
        renderHTML: (attributes) => ({ 'data-access': attributes.access || 'public' }),
      },
    };
  },
});

const AccessBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      access: {
        default: 'public',
        parseHTML: (element) => element.getAttribute('data-access') || 'public',
        renderHTML: (attributes) => ({ 'data-access': attributes.access || 'public' }),
      },
    };
  },
});

const AccessImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      access: {
        default: 'public',
        parseHTML: (element) => element.getAttribute('data-access') || 'public',
        renderHTML: (attributes) => ({ 'data-access': attributes.access || 'public' }),
      },
    };
  },
});

interface NoteRichEditorProps {
  value: NoteRichContent | null;
  onChange: (next: NoteRichContent) => void;
  disabled?: boolean;
}

const DEFAULT_CONTENT: NoteRichContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { access: 'public' },
      content: [],
    },
  ],
};

const SUPPORTED_ACCESS_NODES = ['paragraph', 'heading', 'listItem', 'bulletList', 'orderedList', 'blockquote', 'image'] as const;

type AccessLevel = 'public' | 'paid';

const extractAccessFromSelection = (editor: ReturnType<typeof useEditor> | null): AccessLevel => {
  if (!editor) return 'public';
  const attrs = SUPPORTED_ACCESS_NODES.map((type) => editor.getAttributes(type)?.access).filter(Boolean);
  const access = attrs.find((value) => value === 'paid');
  return access === 'paid' ? 'paid' : 'public';
};

export default function NoteRichEditor({ value, onChange, disabled = false }: NoteRichEditorProps) {
  const t = useTranslations('noteRichEditor');
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        paragraph: false,
        heading: false,
        listItem: false,
        bulletList: false,
        orderedList: false,
      }),
      AccessParagraph,
      AccessHeading.configure({ levels: [2, 3] }),
      AccessListItem,
      AccessBulletList,
      AccessOrderedList,
      AccessBlockquote,
      HardBreak,
      AccessImage.configure({ inline: false, allowBase64: false }),
    ],
    content: value && value.type === 'doc' ? value : DEFAULT_CONTENT,
    onUpdate: ({ editor: inst }) => {
      onChange(inst.getJSON() as NoteRichContent);
    },
  });

  const activeAccess = useMemo(() => extractAccessFromSelection(editor), [editor, value]);

  useEffect(() => {
    if (!editor) return;
    if (!value) {
      editor.commands.setContent(DEFAULT_CONTENT, false);
      return;
    }
    const json = value.type === 'doc' ? value : DEFAULT_CONTENT;
    editor.commands.setContent(json, false);
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  const applyAccess = (level: AccessLevel) => {
    if (!editor) return;
    let chain = editor.chain().focus();
    SUPPORTED_ACCESS_NODES.forEach((type) => {
      if (editor.isActive(type)) {
        chain = chain.updateAttributes(type, { access: level });
      }
    });
    chain.run();
  };

  const insertImage = (url: string) => {
    if (!editor || !url) return;
    editor.chain().focus().setImage({ src: url, access: activeAccess } as any).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`inline-flex items-center rounded-full px-3 py-1 transition ${
            editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`inline-flex items-center rounded-full px-3 py-1 transition ${
            editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ItalicIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`inline-flex items-center rounded-full px-3 py-1 transition ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <HeadingIcon className="h-4 w-4" label="H2" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`inline-flex items-center rounded-full px-3 py-1 transition ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <HeadingIcon className="h-4 w-4" label="H3" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`inline-flex items-center rounded-full px-3 py-1 transition ${
            editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ListBulletIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`inline-flex items-center rounded-full px-3 py-1 transition ${
            editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Bars3BottomLeftIcon className="h-4 w-4" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyAccess('public')}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition ${
              activeAccess === 'public'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('accessPublic', { defaultMessage: '無料公開' })}
          </button>
          <button
            type="button"
            onClick={() => applyAccess('paid')}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition ${
              activeAccess === 'paid'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('accessPaid', { defaultMessage: '有料ブロック' })}
          </button>
          <button
            type="button"
            onClick={() => setIsMediaOpen(true)}
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            <PhotoIcon className="mr-1 h-4 w-4" />
            {t('insertImage', { defaultMessage: '画像を挿入' })}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 shadow-inner">
        <EditorContent editor={editor} className="prose prose-slate max-w-none" />
      </div>

      <MediaLibraryModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(url) => {
          insertImage(url);
          setIsMediaOpen(false);
        }}
      />
    </div>
  );
}
