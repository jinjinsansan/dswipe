'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { EditorContent, FloatingMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Blockquote from '@tiptap/extension-blockquote';
import HardBreak from '@tiptap/extension-hard-break';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bars3BottomLeftIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  MinusSmallIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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

const CANVAS_MAX_WIDTH = 760;

interface InsertAction {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
  handler: () => void;
}

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
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
  const [activeAccess, setActiveAccess] = useState<AccessLevel>('public');
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
      HorizontalRule,
      AccessImage.configure({ inline: false, allowBase64: false }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        linkOnPaste: true,
      }),
    ],
    content: value && value.type === 'doc' ? value : DEFAULT_CONTENT,
    onUpdate: ({ editor: inst }) => {
      onChange(inst.getJSON() as NoteRichContent);
    },
  });

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

  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      setActiveAccess(extractAccessFromSelection(editor));
    };

    handler();
    editor.on('selectionUpdate', handler);
    editor.on('transaction', handler);

    return () => {
      editor.off('selectionUpdate', handler);
      editor.off('transaction', handler);
    };
  }, [editor]);

  const closeInsertMenu = useCallback(() => setIsInsertMenuOpen(false), []);

  const applyAccess = useCallback((level: AccessLevel) => {
    if (!editor) return;
    let chain = editor.chain().focus();
    SUPPORTED_ACCESS_NODES.forEach((type) => {
      if (editor.isActive(type)) {
        chain = chain.updateAttributes(type, { access: level });
      }
    });
    chain.run();
    closeInsertMenu();
  }, [editor, closeInsertMenu]);

  const insertParagraph = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().setParagraph().run();
    closeInsertMenu();
  }, [editor, closeInsertMenu]);

  const insertHeading = useCallback(
    (level: 2 | 3) => {
      if (!editor) return;
      editor.chain().focus().toggleHeading({ level }).run();
      closeInsertMenu();
    },
    [editor, closeInsertMenu],
  );

  const insertBulletList = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleBulletList().run();
    closeInsertMenu();
  }, [editor, closeInsertMenu]);

  const insertOrderedList = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleOrderedList().run();
    closeInsertMenu();
  }, [editor, closeInsertMenu]);

  const insertQuote = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleBlockquote().run();
    closeInsertMenu();
  }, [editor, closeInsertMenu]);

  const insertDivider = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().setHorizontalRule().run();
    closeInsertMenu();
  }, [editor, closeInsertMenu]);

  const togglePaidBlock = useCallback(() => {
    const next = activeAccess === 'paid' ? 'public' : 'paid';
    applyAccess(next);
  }, [activeAccess, applyAccess]);

  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt(t('prompts.linkUrl', { defaultMessage: 'リンクURLを入力してください' }), '');
    if (!url) {
      closeInsertMenu();
      return;
    }
    const text = window.prompt(t('prompts.linkLabel', { defaultMessage: 'リンクテキストを入力してください（省略可）' }), '') || url;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url.trim(), target: '_blank', rel: 'noopener noreferrer' })
      .insertContent(text.trim())
      .run();
    closeInsertMenu();
  }, [editor, t, closeInsertMenu]);

  const handleInsertFile = useCallback(() => {
    if (!editor) return;
    const url = window.prompt(t('prompts.fileUrl', { defaultMessage: 'ファイルのURLを入力してください' }), '');
    if (!url) {
      closeInsertMenu();
      return;
    }
    const label = window.prompt(t('prompts.fileLabel', { defaultMessage: 'ファイル名を入力してください' }), '') || url;
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'paragraph',
          attrs: { access: activeAccess },
          content: [
            {
              type: 'text',
              text: label.trim(),
              marks: [
                {
                  type: 'link',
                  attrs: { href: url.trim(), target: '_blank', rel: 'noopener noreferrer' },
                },
              ],
            },
          ],
        },
      ])
      .run();
    closeInsertMenu();
  }, [editor, activeAccess, t, closeInsertMenu]);

  const insertImage = (url: string) => {
    if (!editor || !url) return;
    const attrs = { src: url, access: activeAccess } as {
      src: string;
      alt?: string;
      title?: string;
      access?: AccessLevel;
    };
    editor.chain().focus().setImage(attrs).run();
    closeInsertMenu();
  };

  if (!editor) {
    return null;
  }

  const insertActions: InsertAction[] = [
    {
      id: 'paragraph',
      label: t('insertParagraph', { defaultMessage: 'テキスト' }),
      description: t('insertParagraphDescription', { defaultMessage: '通常の段落テキストを追加します' }),
      icon: <span className="text-base font-semibold">T</span>,
      handler: insertParagraph,
    },
    {
      id: 'heading2',
      label: t('insertHeadingLarge', { defaultMessage: '大見出し (H2)' }),
      icon: <HeadingIcon className="h-5 w-5" label="H2" />,
      handler: () => insertHeading(2),
    },
    {
      id: 'heading3',
      label: t('insertHeadingSmall', { defaultMessage: '小見出し (H3)' }),
      icon: <HeadingIcon className="h-5 w-5" label="H3" />,
      handler: () => insertHeading(3),
    },
    {
      id: 'bullet',
      label: t('insertBulletList', { defaultMessage: '箇条書き' }),
      icon: <ListBulletIcon className="h-5 w-5" />,
      handler: insertBulletList,
    },
    {
      id: 'ordered',
      label: t('insertOrderedList', { defaultMessage: '番号リスト' }),
      icon: <span className="text-base font-semibold">1.</span>,
      handler: insertOrderedList,
    },
    {
      id: 'quote',
      label: t('insertQuote', { defaultMessage: '引用' }),
      icon: <Bars3BottomLeftIcon className="h-5 w-5" />,
      handler: insertQuote,
    },
    {
      id: 'divider',
      label: t('insertDivider', { defaultMessage: '区切り線' }),
      icon: <MinusSmallIcon className="h-5 w-5" />,
      handler: insertDivider,
    },
    {
      id: 'link',
      label: t('insertLink', { defaultMessage: 'リンク' }),
      icon: <LinkIcon className="h-5 w-5" />,
      handler: handleInsertLink,
    },
    {
      id: 'file',
      label: t('insertFile', { defaultMessage: 'ファイル' }),
      icon: <DocumentArrowDownIcon className="h-5 w-5" />,
      handler: handleInsertFile,
    },
    {
      id: 'image',
      label: t('insertImage', { defaultMessage: '画像' }),
      icon: <PhotoIcon className="h-5 w-5" />,
      handler: () => {
        setIsMediaOpen(true);
        closeInsertMenu();
      },
    },
    {
      id: 'paid',
      label: activeAccess === 'paid'
        ? t('switchToFree', { defaultMessage: '無料に戻す' })
        : t('switchToPaid', { defaultMessage: '有料エリアにする' }),
      icon: <span className="text-sm font-semibold">￥</span>,
      handler: togglePaidBlock,
    },
  ];

  return (
    <div className="relative mx-auto flex w-full max-w-full flex-col items-center gap-6">
      <div className="w-full max-w-full px-0 md:px-4">
        <div
          className="relative mx-auto w-full max-w-[var(--note-rich-width)] rounded-xl bg-white/90 px-4 py-10 shadow-sm ring-1 ring-slate-200"
          style={{
            // note.com は約 720px 程度の本文幅
            // tailwind でカスタム値を渡すため CSS 変数を使用
            ['--note-rich-width' as string]: `${CANVAS_MAX_WIDTH}px`,
          }}
        >
          <EditorContent
            editor={editor}
            className="note-rich-editor prose prose-lg prose-slate max-w-none focus:outline-none"
          />

          <FloatingMenu
            editor={editor}
            shouldShow={({ editor: instance }) => {
              const { $from } = instance.state.selection;
              if (!instance.isEditable) return false;
              return $from.depth === 1 || $from.parent.type.name !== 'doc';
            }}
            tippyOptions={{ placement: 'left-start', offset: [0, 24] }}
          >
            <button
              type="button"
              onClick={() => setIsInsertMenuOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-500"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </FloatingMenu>
        </div>
      </div>

      {/* モバイル用フッターメニュー */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center md:hidden">
        <div className="pointer-events-auto flex w-[min(620px,_calc(100%-32px))] items-center gap-1 rounded-full bg-slate-900/95 px-3 py-2 text-white shadow-xl backdrop-blur">
          <ToolbarButtons
            editor={editor}
            disabled={disabled}
            activeAccess={activeAccess}
            onAccessChange={applyAccess}
            onImage={() => setIsMediaOpen(true)}
            onInsertMenu={() => setIsInsertMenuOpen(true)}
          />
        </div>
      </div>

      {/* デスクトップ用フッターメニュー */}
      <div className="hidden w-full justify-center md:flex">
        <div className="flex w-full max-w-[720px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <ToolbarButtons
            editor={editor}
            disabled={disabled}
            activeAccess={activeAccess}
            onAccessChange={applyAccess}
            onImage={() => setIsMediaOpen(true)}
            onInsertMenu={() => setIsInsertMenuOpen(true)}
          />
        </div>
      </div>

      {isInsertMenuOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('insertMenuTitle', { defaultMessage: 'ブロックを追加' })}</p>
                <p className="text-xs text-slate-500">{t('insertMenuDescription', { defaultMessage: '追加したいコンテンツを選択してください' })}</p>
              </div>
              <button
                type="button"
                onClick={closeInsertMenu}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
              {insertActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.handler}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-left text-sm transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">{action.icon}</span>
                  <span className="flex-1 text-slate-700">
                    <span className="block font-semibold">{action.label}</span>
                    {action.description ? (
                      <span className="block text-xs text-slate-500">{action.description}</span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <MediaLibraryModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(url) => {
          insertImage(url);
          setIsMediaOpen(false);
        }}
      />

      <style jsx global>{`
        .note-rich-editor .ProseMirror {
          min-height: 420px;
          outline: none;
        }

        .note-rich-editor .ProseMirror:focus {
          outline: none;
        }

        .note-rich-editor .ProseMirror p,
        .note-rich-editor .ProseMirror h2,
        .note-rich-editor .ProseMirror h3 {
          margin-bottom: 1.25rem;
        }

        .note-rich-editor .ProseMirror ul,
        .note-rich-editor .ProseMirror ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }

        .note-rich-editor .ProseMirror blockquote {
          border-left: 4px solid #cbd5f5;
          padding-left: 1rem;
          color: #475569;
          font-style: italic;
        }

        .note-rich-editor .ProseMirror hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
}

interface ToolbarButtonsProps {
  editor: ReturnType<typeof useEditor> | null;
  disabled: boolean;
  activeAccess: AccessLevel;
  onAccessChange: (level: AccessLevel) => void;
  onImage: () => void;
  onInsertMenu: () => void;
}

function ToolbarButtons({ editor, disabled, activeAccess, onAccessChange, onImage, onInsertMenu }: ToolbarButtonsProps) {
  const t = useTranslations('noteRichEditor');

  if (!editor) {
    return null;
  }

  return (
    <Fragment>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        disabled={disabled}
      >
        <BoldIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        disabled={disabled}
      >
        <ItalicIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        disabled={disabled}
      >
        <HeadingIcon className="h-4 w-4" label="H2" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        disabled={disabled}
      >
        <HeadingIcon className="h-4 w-4" label="H3" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        disabled={disabled}
      >
        <ListBulletIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        disabled={disabled}
      >
        <span className="text-xs font-semibold">1.</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        disabled={disabled}
      >
        <Bars3BottomLeftIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={disabled}>
        <span className="text-xs font-semibold">↺</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={disabled}>
        <span className="text-xs font-semibold">↻</span>
      </ToolbarButton>
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <ToolbarButton
          onClick={() => onAccessChange('public')}
          active={activeAccess === 'public'}
          disabled={disabled}
          activeClass="bg-emerald-600 text-white"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide">{t('accessPublic', { defaultMessage: '無料' })}</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => onAccessChange('paid')}
          active={activeAccess === 'paid'}
          disabled={disabled}
          activeClass="bg-amber-500 text-white"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide">{t('accessPaid', { defaultMessage: '有料' })}</span>
        </ToolbarButton>
        <ToolbarButton onClick={onImage} disabled={disabled}>
          <PhotoIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onInsertMenu} disabled={disabled}>
          <PlusIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </Fragment>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  activeClass?: string;
  children: ReactNode;
}

function ToolbarButton({ onClick, active = false, disabled = false, activeClass, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? activeClass || 'bg-blue-600 text-white' : 'bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
