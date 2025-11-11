'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode, ChangeEvent } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
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
import { mediaApi } from '@/lib/api';

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
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
  const [activeAccess, setActiveAccess] = useState<AccessLevel>('public');
  const [showInsertButton, setShowInsertButton] = useState(false);
  const [insertButtonTop, setInsertButtonTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInsertMenuOpenRef = useRef(false);
  const storedSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
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

  const updateInsertButtonPosition = useCallback(() => {
    if (!editor || !editor.isEditable || disabled) {
      setShowInsertButton(false);
      return;
    }

    const view = editor.view;
    const { state } = view;
    const container = containerRef.current;
    if (!container) {
      setShowInsertButton(false);
      return;
    }

    const selection = state.selection;
    const from = selection.$from.pos;

    try {
      const coords = view.coordsAtPos(from);
      const rect = container.getBoundingClientRect();
      const top = coords.top - rect.top - 12;
      if (Number.isFinite(top)) {
        setInsertButtonTop(Math.max(top, 0));
        setShowInsertButton(true);
      }
    } catch {
      setShowInsertButton(false);
    }
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (disabled) {
      setShowInsertButton(false);
    } else {
      updateInsertButtonPosition();
    }
  }, [disabled, updateInsertButtonPosition]);

  useEffect(() => {
    if (!editor) return;
    const handleSelection = () => {
      setActiveAccess(extractAccessFromSelection(editor));
      updateInsertButtonPosition();
    };

    handleSelection();
    editor.on('selectionUpdate', handleSelection);
    editor.on('transaction', handleSelection);
    editor.on('focus', updateInsertButtonPosition);
    const handleBlur = () => {
      if (!isInsertMenuOpenRef.current) {
        setShowInsertButton(false);
      }
    };
    editor.on('blur', handleBlur);
    return () => {
      editor.off('selectionUpdate', handleSelection);
      editor.off('transaction', handleSelection);
      editor.off('focus', updateInsertButtonPosition);
      editor.off('blur', handleBlur);
    };
  }, [editor, updateInsertButtonPosition]);

  useEffect(() => {
    if (!editor) return;
    const listener = () => updateInsertButtonPosition();
    window.addEventListener('resize', listener);
    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [editor, updateInsertButtonPosition]);

  const openInsertMenu = useCallback(() => {
    if (editor && !storedSelectionRef.current) {
      const { from, to } = editor.state.selection;
      storedSelectionRef.current = { from, to };
    }
    isInsertMenuOpenRef.current = true;
    setIsInsertMenuOpen(true);
    setShowInsertButton(true);
  }, [editor]);

  const closeInsertMenu = useCallback(() => {
    isInsertMenuOpenRef.current = false;
    setIsInsertMenuOpen(false);
    updateInsertButtonPosition();
    storedSelectionRef.current = null;
  }, [updateInsertButtonPosition]);

  const restoreSelection = useCallback(() => {
    if (!editor) return;
    if (!storedSelectionRef.current) return;
    const { from, to } = storedSelectionRef.current;
    editor.commands.setTextSelection({ from, to });
  }, [editor]);

  const applyAccess = useCallback((level: AccessLevel) => {
    if (!editor) return;
    restoreSelection();
    let chain = editor.chain().focus();
    SUPPORTED_ACCESS_NODES.forEach((type) => {
      if (editor.isActive(type)) {
        chain = chain.updateAttributes(type, { access: level });
      }
    });
    chain.run();
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu]);

  const insertParagraph = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    editor.chain().focus().setParagraph().run();
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu]);

  const insertHeading = useCallback(
    (level: 2 | 3) => {
      if (!editor) return;
      restoreSelection();
      editor.chain().focus().setNode('heading', { level }).run();
      closeInsertMenu();
    },
    [editor, restoreSelection, closeInsertMenu],
  );

  const insertBulletList = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    editor.chain().focus().toggleBulletList().run();
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu]);

  const insertOrderedList = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    editor.chain().focus().toggleOrderedList().run();
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu]);

  const insertQuote = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    editor.chain().focus().toggleBlockquote().run();
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu]);

  const insertDivider = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    editor.chain().focus().setHorizontalRule().run();
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu]);

  const togglePaidBlock = useCallback(() => {
    restoreSelection();
    const next = activeAccess === 'paid' ? 'public' : 'paid';
    applyAccess(next);
  }, [activeAccess, applyAccess, restoreSelection]);

  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    const currentHref = editor.getAttributes('link')?.href || '';
    const url = window.prompt('リンクURLを入力してください（例：https://example.com）', currentHref);
    if (!url) {
      closeInsertMenu();
      return;
    }
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      closeInsertMenu();
      return;
    }

    restoreSelection();
    const { state } = editor;
    const { from, to } = state.selection;
    const hasSelection = from !== to;
    const selectedText = state.doc.textBetween(from, to, ' ');

    const chain = editor.chain().focus();

    if (hasSelection && selectedText.trim().length > 0) {
      chain.extendMarkRange('link').setLink({ href: trimmedUrl, target: '_blank', rel: 'noopener noreferrer' }).run();
    } else {
      const label = window.prompt('リンクとして表示するテキストを入力してください', trimmedUrl) || trimmedUrl;
      const startPos = state.selection.from;
      chain
        .insertContent(label)
        .setTextSelection({ from: startPos, to: startPos + label.length })
        .extendMarkRange('link')
        .setLink({ href: trimmedUrl, target: '_blank', rel: 'noopener noreferrer' })
        .run();
    }

    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu]);

  const handleInsertFile = useCallback(() => {
    if (isFileUploading) {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isFileUploading]);

  const insertFileLink = useCallback(
    (url: string, defaultLabel: string) => {
      if (!editor) return;
      restoreSelection();
      const { state } = editor;
      const { from, to } = state.selection;
      const hasSelection = from !== to;
      const selectedText = state.doc.textBetween(from, to, ' ');

      const chain = editor.chain().focus();

      if (hasSelection && selectedText.trim().length > 0) {
        chain.extendMarkRange('link').setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' }).run();
      } else {
        const label = window.prompt('リンクとして表示するテキストを入力してください', defaultLabel) || defaultLabel;
        const startPos = state.selection.from;
        chain
          .insertContent(label)
          .setTextSelection({ from: startPos, to: startPos + label.length })
          .extendMarkRange('link')
          .setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' })
          .run();
      }

      closeInsertMenu();
    },
    [editor, restoreSelection, closeInsertMenu],
  );

  const handleFileSelect = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) {
        return;
      }

      setIsFileUploading(true);
      try {
        const response = await mediaApi.upload(file, { optimize: false });
        const fileUrl: string | undefined = response.data?.url;
        const fileName: string = response.data?.name || file.name;
        if (!fileUrl) {
          throw new Error('missing file url');
        }
        insertFileLink(fileUrl, fileName);
      } catch (error) {
        console.error('ファイルのアップロードに失敗しました', error);
        window.alert('ファイルのアップロードに失敗しました。時間をおいて再度お試しください。');
        closeInsertMenu();
      } finally {
        setIsFileUploading(false);
      }
    },
    [insertFileLink, closeInsertMenu],
  );

  const insertImage = (url: string) => {
    if (!editor || !url) return;
    restoreSelection();
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
      label: 'テキスト',
      description: '通常の段落テキストを追加します',
      icon: <span className="text-base font-semibold">T</span>,
      handler: insertParagraph,
    },
    {
      id: 'heading2',
      label: '大見出し (H2)',
      icon: <HeadingIcon className="h-5 w-5" label="H2" />,
      handler: () => insertHeading(2),
    },
    {
      id: 'heading3',
      label: '小見出し (H3)',
      icon: <HeadingIcon className="h-5 w-5" label="H3" />,
      handler: () => insertHeading(3),
    },
    {
      id: 'bullet',
      label: '箇条書き',
      icon: <ListBulletIcon className="h-5 w-5" />,
      handler: insertBulletList,
    },
    {
      id: 'ordered',
      label: '番号付きリスト',
      icon: <span className="text-base font-semibold">1.</span>,
      handler: insertOrderedList,
    },
    {
      id: 'quote',
      label: '引用',
      icon: <Bars3BottomLeftIcon className="h-5 w-5" />,
      handler: insertQuote,
    },
    {
      id: 'divider',
      label: '区切り線',
      icon: <MinusSmallIcon className="h-5 w-5" />,
      handler: insertDivider,
    },
    {
      id: 'link',
      label: 'リンク',
      icon: <LinkIcon className="h-5 w-5" />,
      handler: handleInsertLink,
    },
    {
      id: 'file',
      label: isFileUploading ? 'アップロード中…' : 'ファイルをアップロード',
      description: 'ローカルファイルをアップロードしてリンクを挿入します',
      icon: <DocumentArrowDownIcon className="h-5 w-5" />,
      handler: () => {
        if (!isFileUploading) {
          handleInsertFile();
        }
      },
    },
    {
      id: 'image',
      label: '画像',
      icon: <PhotoIcon className="h-5 w-5" />,
      handler: () => {
        setIsMediaOpen(true);
        closeInsertMenu();
      },
    },
    {
      id: 'paid',
      label: activeAccess === 'paid' ? '無料に戻す' : '有料エリアにする',
      icon: <span className="text-sm font-semibold">￥</span>,
      handler: togglePaidBlock,
    },
  ];

  return (
    <div className="relative mx-auto flex w-full max-w-full flex-col items-center gap-6">
      <div className="w-full max-w-full px-0 md:px-4">
        <div
          ref={containerRef}
          className="relative mx-auto w-full max-w-[var(--note-rich-width)] rounded-xl bg-white/90 px-4 py-10 shadow-sm ring-1 ring-slate-200"
          style={{
            // note.com は約 720px 程度の本文幅
            // tailwind でカスタム値を渡すため CSS 変数を使用
            ['--note-rich-width' as string]: `${CANVAS_MAX_WIDTH}px`,
          }}
        >
          {showInsertButton && !disabled ? (
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (editor) {
                  const { from, to } = editor.state.selection;
                  storedSelectionRef.current = { from, to };
                  editor.commands.focus();
                }
                openInsertMenu();
              }}
              className="absolute left-[-32px] flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-500 md:left-[-48px] md:h-9 md:w-9"
              style={{ top: insertButtonTop }}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          ) : null}
          <EditorContent
            editor={editor}
            className="note-rich-editor prose prose-lg prose-slate max-w-none focus:outline-none"
          />
        </div>
      </div>

      {/* モバイル用フッターメニュー */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center md:hidden">
        <div className="pointer-events-auto w-[min(620px,_calc(100%-32px))] overflow-x-auto rounded-3xl bg-slate-900/95 px-3 py-3 text-white shadow-xl backdrop-blur">
          <div className="flex w-max items-center gap-2 pr-2">
            <ToolbarButtons
              editor={editor}
              disabled={disabled}
              activeAccess={activeAccess}
              onAccessChange={applyAccess}
              onImage={() => setIsMediaOpen(true)}
              onInsertMenu={openInsertMenu}
              isUploading={isFileUploading}
            />
          </div>
        </div>
      </div>

      {/* デスクトップ用フッターメニュー */}
      <div className="hidden w-full justify-center md:flex">
        <div className="w-full max-w-[760px] overflow-x-auto rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex w-max items-center gap-2 pr-2">
            <ToolbarButtons
              editor={editor}
              disabled={disabled}
              activeAccess={activeAccess}
              onAccessChange={applyAccess}
              onImage={() => setIsMediaOpen(true)}
              onInsertMenu={openInsertMenu}
              isUploading={isFileUploading}
            />
          </div>
        </div>
      </div>

      {isInsertMenuOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">ブロックを追加</p>
                <p className="text-xs text-slate-500">追加したいコンテンツを選択してください</p>
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

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
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

        .note-rich-editor .ProseMirror h2 {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.3;
          color: #0f172a;
        }

        .note-rich-editor .ProseMirror h3 {
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1.4;
          color: #1e293b;
        }

        .note-rich-editor .ProseMirror ul,
        .note-rich-editor .ProseMirror ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
          list-style-position: outside;
        }

        .note-rich-editor .ProseMirror ul {
          list-style-type: disc;
        }

        .note-rich-editor .ProseMirror ol {
          list-style-type: decimal;
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
  isUploading: boolean;
}

function ToolbarButtons({ editor, disabled, activeAccess, onAccessChange, onImage, onInsertMenu, isUploading }: ToolbarButtonsProps) {
  if (!editor) {
    return null;
  }

  return (
    <Fragment>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        disabled={disabled}
        label="太字"
        icon={<BoldIcon className="h-4 w-4" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        disabled={disabled}
        label="斜体"
        icon={<ItalicIcon className="h-4 w-4" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        disabled={disabled}
        label="大見出し"
        icon={<HeadingIcon className="h-4 w-4" label="H2" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        disabled={disabled}
        label="小見出し"
        icon={<HeadingIcon className="h-4 w-4" label="H3" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        disabled={disabled}
        label="箇条書き"
        icon={<ListBulletIcon className="h-4 w-4" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        disabled={disabled}
        label="番号付き"
        icon={<span className="text-xs font-semibold">1.</span>}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        disabled={disabled}
        label="引用"
        icon={<Bars3BottomLeftIcon className="h-4 w-4" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled}
        label="元に戻す"
        icon={<span className="text-xs font-semibold">↺</span>}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled}
        label="やり直す"
        icon={<span className="text-xs font-semibold">↻</span>}
      />
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <ToolbarButton
          onClick={() => onAccessChange('public')}
          active={activeAccess === 'public'}
          disabled={disabled}
          activeClass="bg-emerald-600 text-white"
          label="無料"
        />
        <ToolbarButton
          onClick={() => onAccessChange('paid')}
          active={activeAccess === 'paid'}
          disabled={disabled}
          activeClass="bg-amber-500 text-white"
          label="有料"
        />
        <ToolbarButton
          onClick={onImage}
          disabled={disabled}
          label="画像"
          icon={<PhotoIcon className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={onInsertMenu}
          disabled={disabled || isUploading}
          label={isUploading ? 'アップ中' : '追加'}
          icon={<PlusIcon className="h-4 w-4" />}
        />
      </div>
    </Fragment>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  activeClass?: string;
  icon?: ReactNode;
  label: string;
  className?: string;
}

function ToolbarButton({ onClick, active = false, disabled = false, activeClass, icon, label, className }: ToolbarButtonProps) {
  const baseColor = active ? (activeClass ?? 'bg-blue-600 text-white') : 'bg-slate-100 text-slate-600';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex h-12 min-w-[64px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-full px-3 text-xs font-semibold transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 ${baseColor} ${className ?? ''}`}
    >
      {icon ? <span className="text-base leading-none">{icon}</span> : null}
      <span className={`text-[10px] font-semibold ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
    </button>
  );
}
