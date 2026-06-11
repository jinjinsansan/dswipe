'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode, ChangeEvent, DragEvent } from 'react';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import type { ChainedCommands } from '@tiptap/core';
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
  LockClosedIcon,
  MinusSmallIcon,
  PhotoIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { BoldIcon, HeadingIcon, ItalicIcon, ListBulletIcon } from './icons/RichEditorIcons';
import dynamic from 'next/dynamic';
import type { NoteRichContent } from '@/types';
import { mediaApi } from '@/lib/api';

const MediaLibraryModal = dynamic(() => import('@/components/MediaLibraryModal'), {
  loading: () => null,
  ssr: false,
});

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

export default function NoteRichEditor({
  value,
  onChange,
  disabled = false,
}: NoteRichEditorProps) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
  const [activeAccess, setActiveAccess] = useState<AccessLevel>('public');
  const [showInsertButton, setShowInsertButton] = useState(false);
  const [insertButtonTop, setInsertButtonTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInsertMenuOpenRef = useRef(false);
  const storedSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const lastSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const lastDocJsonRef = useRef<string | null>(null);
  const paidMarkerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const uploadNoticeTimerRef = useRef<number | null>(null);
  const [paidMarkerTop, setPaidMarkerTop] = useState<number | null>(null);
  const [hasPaidArea, setHasPaidArea] = useState(false);
  const registerUploadedMedia = useCallback((url: string) => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('uploaded_media');
      const existing: { url: string; uploaded_at: string }[] = stored ? JSON.parse(stored) : [];
      const filtered = existing.filter((item) => item.url !== url);
      const next = [
        { url, uploaded_at: new Date().toISOString() },
        ...filtered,
      ];
      window.localStorage.setItem('uploaded_media', JSON.stringify(next));
    } catch (error) {
      console.error('メディアライブラリの更新に失敗しました', error);
    }
  }, []);

  const showUploadNotice = useCallback((message: string) => {
    setUploadNotice(message);
    if (uploadNoticeTimerRef.current) {
      window.clearTimeout(uploadNoticeTimerRef.current);
    }
    uploadNoticeTimerRef.current = window.setTimeout(() => {
      setUploadNotice(null);
      uploadNoticeTimerRef.current = null;
    }, 4000);
  }, []);
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
      Placeholder.configure({
        placeholder: '本文を書きましょう。空の行で「＋」からブロックを追加できます',
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
    ],
    content: value && value.type === 'doc' ? value : DEFAULT_CONTENT,
    onUpdate: ({ editor: inst }) => {
      const json = inst.getJSON() as NoteRichContent;
      const serialized = JSON.stringify(json);
      if (serialized === lastDocJsonRef.current) {
        return;
      }
      lastDocJsonRef.current = serialized;
      onChange(json);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!lastDocJsonRef.current) {
      const initial = editor.getJSON() as NoteRichContent;
      lastDocJsonRef.current = JSON.stringify(initial);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const next = value && value.type === 'doc' ? value : DEFAULT_CONTENT;
    const serialized = JSON.stringify(next);
    if (serialized === lastDocJsonRef.current) {
      return;
    }
    lastDocJsonRef.current = serialized;
    editor.commands.setContent(next, false);
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

  const updatePaidMarkers = useCallback(() => {
    if (!editor) {
      setHasPaidArea(false);
      setPaidMarkerTop(null);
      return;
    }

    window.requestAnimationFrame(() => {
      if (!editor || !containerRef.current) {
        setHasPaidArea(false);
        setPaidMarkerTop(null);
        return;
      }

      const root = editor.view.dom as HTMLElement;
      const paidNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-access="paid"]'));
      setHasPaidArea(paidNodes.length > 0);

      if (paidNodes.length === 0) {
        setPaidMarkerTop(null);
        return;
      }

      const first = paidNodes[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const firstRect = first.getBoundingClientRect();
      const markerHeight = paidMarkerRef.current?.offsetHeight ?? 0;
      const gap = 16;
      const offset = firstRect.top - containerRect.top - markerHeight - gap;
      setPaidMarkerTop(Math.max(offset, 8));
    });
  }, [editor]);

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
      const { from, to } = editor.state.selection;
      lastSelectionRef.current = { from, to };
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
    updatePaidMarkers();
    editor.on('update', updatePaidMarkers);
    editor.on('selectionUpdate', updatePaidMarkers);
    return () => {
      editor.off('update', updatePaidMarkers);
      editor.off('selectionUpdate', updatePaidMarkers);
    };
  }, [editor, updatePaidMarkers]);

  useEffect(() => {
    if (!editor) return;
    const handleReposition = () => updatePaidMarkers();
    const scrollListener = () => updatePaidMarkers();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', scrollListener, true);
    handleReposition();
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', scrollListener, true);
    };
  }, [editor, updatePaidMarkers]);

  useEffect(() => {
    if (!editor) return;
    const listener = () => updateInsertButtonPosition();
    window.addEventListener('resize', listener);
    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [editor, updateInsertButtonPosition]);

  useEffect(() => () => {
    if (uploadNoticeTimerRef.current) {
      window.clearTimeout(uploadNoticeTimerRef.current);
    }
  }, []);

  const openInsertMenu = useCallback(() => {
    if (editor) {
      const { from, to } = editor.state.selection;
      storedSelectionRef.current = { from, to };
      lastSelectionRef.current = { from, to };
    }
    isInsertMenuOpenRef.current = true;
    setIsInsertMenuOpen(true);
    setShowInsertButton(true);
  }, [editor]);

  const createChainWithSelection = useCallback((): ChainedCommands | null => {
    if (!editor) {
      return null;
    }
    const target = storedSelectionRef.current ?? lastSelectionRef.current;
    if (target) {
      try {
        editor.commands.setTextSelection({ from: target.from, to: target.to });
        lastSelectionRef.current = { ...target };
      } catch (error) {
        console.warn('failed to prepare selection for command', error);
      }
    }
    return editor.chain().focus();
  }, [editor]);

  const closeInsertMenu = useCallback(() => {
    isInsertMenuOpenRef.current = false;
    setIsInsertMenuOpen(false);
    updateInsertButtonPosition();
    storedSelectionRef.current = null;
  }, [updateInsertButtonPosition]);

  const restoreSelection = useCallback(() => {
    if (!editor) return;
    const target = storedSelectionRef.current ?? lastSelectionRef.current;
    if (!target) return;
    const { from, to } = target;
    try {
      editor.commands.setTextSelection({ from, to });
      lastSelectionRef.current = { from, to };
    } catch (error) {
      console.warn('failed to restore selection', error);
    }
  }, [editor]);

  const applyAccess = useCallback((level: AccessLevel) => {
    if (!editor) return;
    
    // 元の位置を保存
    const target = storedSelectionRef.current ?? lastSelectionRef.current;
    if (!target) {
      return;
    }
    const savedPos = { from: target.from, to: target.to };
    
    // エディタにフォーカスして属性を更新
    editor.chain().focus().setTextSelection(savedPos).run();
    
    SUPPORTED_ACCESS_NODES.forEach((type) => {
      if (editor.isActive(type)) {
        editor.commands.updateAttributes(type, { access: level });
      }
    });
    
    // 更新後のカーソル位置を保存
    const afterUpdate = { from: editor.state.selection.from, to: editor.state.selection.to };
    
    setActiveAccess(level);
    updatePaidMarkers();
    
    // メニューを閉じる
    closeInsertMenu();
    
    // メニューを閉じた直後、即座に同期的にカーソル位置を復元
    editor.chain().focus().setTextSelection(afterUpdate).run();
  }, [editor, closeInsertMenu, updatePaidMarkers]);

  const insertParagraph = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    const chain = createChainWithSelection();
    if (!chain) {
      closeInsertMenu();
      return;
    }
    chain.setParagraph().run();
    
    // 挿入後のカーソル位置を即座に復元
    const { from, to } = editor.state.selection;
    editor.commands.setTextSelection({ from, to });
    editor.commands.focus();
    
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu, createChainWithSelection]);

  const insertHeading = useCallback(
    (level: 2 | 3) => {
      if (!editor) return;
      restoreSelection();
      const chain = createChainWithSelection();
      if (!chain) {
        closeInsertMenu();
        return;
      }
      chain.setNode('heading', { level }).run();
      
      // 挿入後のカーソル位置を即座に復元
      const { from, to } = editor.state.selection;
      editor.commands.setTextSelection({ from, to });
      editor.commands.focus();
      
      closeInsertMenu();
    },
    [editor, restoreSelection, closeInsertMenu, createChainWithSelection],
  );

  const insertBulletList = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    const chain = createChainWithSelection();
    if (!chain) {
      closeInsertMenu();
      return;
    }
    chain.toggleBulletList().run();
    
    // 挿入後のカーソル位置を即座に復元
    const { from, to } = editor.state.selection;
    editor.commands.setTextSelection({ from, to });
    editor.commands.focus();
    
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu, createChainWithSelection]);

  const insertOrderedList = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    const chain = createChainWithSelection();
    if (!chain) {
      closeInsertMenu();
      return;
    }
    chain.toggleOrderedList().run();
    
    // 挿入後のカーソル位置を即座に復元
    const { from, to } = editor.state.selection;
    editor.commands.setTextSelection({ from, to });
    editor.commands.focus();
    
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu, createChainWithSelection]);

  const insertQuote = useCallback(() => {
    if (!editor) return;
    restoreSelection();
    const chain = createChainWithSelection();
    if (!chain) {
      closeInsertMenu();
      return;
    }
    chain.toggleBlockquote().run();
    
    // 挿入後のカーソル位置を即座に復元
    const { from, to } = editor.state.selection;
    editor.commands.setTextSelection({ from, to });
    editor.commands.focus();
    
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu, createChainWithSelection]);

  const insertDivider = useCallback(() => {
    if (!editor) return;
    
    // 挿入前の位置を保存
    const target = storedSelectionRef.current ?? lastSelectionRef.current;
    if (!target) {
      closeInsertMenu();
      return;
    }
    const savedPos = { from: target.from, to: target.to };
    
    // エディタにフォーカスして区切り線を挿入
    editor.chain()
      .focus()
      .setTextSelection(savedPos)
      .setHorizontalRule()
      .run();
    
    // 挿入後のカーソル位置を保存
    const afterInsert = { from: editor.state.selection.from, to: editor.state.selection.to };
    
    // メニューを閉じる
    closeInsertMenu();
    
    // メニューを閉じた直後、即座に同期的にカーソル位置を復元
    editor.chain().focus().setTextSelection(afterInsert).run();
  }, [editor, closeInsertMenu]);

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

    const chain = createChainWithSelection();
    if (!chain) {
      closeInsertMenu();
      return;
    }

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

    // 挿入後のカーソル位置を即座に復元
    const { from: finalFrom, to: finalTo } = editor.state.selection;
    editor.commands.setTextSelection({ from: finalFrom, to: finalTo });
    editor.commands.focus();
    
    closeInsertMenu();
  }, [editor, restoreSelection, closeInsertMenu, createChainWithSelection]);

  const handleInsertFile = useCallback(() => {
    if (isFileUploading) {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isFileUploading]);

  const insertFileLink = useCallback(
    (url: string, defaultLabel: string, options?: { skipPrompt?: boolean }) => {
      if (!editor) return;
      restoreSelection();
      const { state } = editor;
      const { from, to } = state.selection;
      const hasSelection = from !== to;
      const selectedText = state.doc.textBetween(from, to, ' ');

      const chain = createChainWithSelection();
      if (!chain) {
        closeInsertMenu();
        return;
      }

      if (hasSelection && selectedText.trim().length > 0) {
        chain.extendMarkRange('link').setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' }).run();
      } else {
        const shouldPrompt = options?.skipPrompt !== true;
        const label = shouldPrompt
          ? window.prompt('リンクとして表示するテキストを入力してください', defaultLabel) || defaultLabel
          : defaultLabel;
        const startPos = state.selection.from;
        chain
          .insertContent(label)
          .setTextSelection({ from: startPos, to: startPos + label.length })
          .extendMarkRange('link')
          .setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' })
          .run();
      }

      // 挿入後のカーソル位置を即座に復元
      const { from: finalFrom, to: finalTo } = editor.state.selection;
      editor.commands.setTextSelection({ from: finalFrom, to: finalTo });
      editor.commands.focus();
      
      closeInsertMenu();
    },
    [editor, restoreSelection, closeInsertMenu, createChainWithSelection],
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
        registerUploadedMedia(fileUrl);
        insertFileLink(fileUrl, fileName);
        showUploadNotice('ファイルをアップロードして挿入しました');
      } catch (error) {
        console.error('ファイルのアップロードに失敗しました', error);
        window.alert('ファイルのアップロードに失敗しました。時間をおいて再度お試しください。');
        closeInsertMenu();
      } finally {
        setIsFileUploading(false);
      }
    },
    [insertFileLink, closeInsertMenu, registerUploadedMedia, showUploadNotice],
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
    const chain = createChainWithSelection();
    if (!chain) {
      closeInsertMenu();
      return;
    }
    chain.setImage(attrs).run();
    
    // 挿入後のカーソル位置を即座に復元
    const { from, to } = editor.state.selection;
    editor.commands.setTextSelection({ from, to });
    editor.commands.focus();
    
    closeInsertMenu();
  };

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    const hasFiles = Array.from(event.dataTransfer?.items ?? []).some((item) => item.kind === 'file');
    if (!hasFiles) {
      return;
    }
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
    setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!isDragOver) {
      return;
    }
    const related = event.relatedTarget as Node | null;
    if (related && event.currentTarget.contains(related)) {
      return;
    }
    setIsDragOver(false);
  }, [isDragOver]);

  const handleDrop = useCallback(async (event: DragEvent<HTMLDivElement>) => {
    if (!editor || disabled) {
      setIsDragOver(false);
      return;
    }
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    setIsFileUploading(true);
    try {
      const dropPoint = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
      if (dropPoint) {
        const pos = dropPoint.pos;
        editor.commands.setTextSelection({ from: pos, to: pos });
        editor.commands.focus();
        storedSelectionRef.current = { from: pos, to: pos };
        lastSelectionRef.current = { from: pos, to: pos };
      }

      for (const file of Array.from(files)) {
        const response = await mediaApi.upload(file, { optimize: file.type.startsWith('image/') });
        const fileUrl: string | undefined = response.data?.url;
        const fileName: string = response.data?.name || file.name;
        if (!fileUrl) {
          continue;
        }

        registerUploadedMedia(fileUrl);

        if (file.type.startsWith('image/')) {
          insertImage(fileUrl);
        } else {
          insertFileLink(fileUrl, fileName, { skipPrompt: true });
        }
      }

      showUploadNotice('ドラッグ＆ドロップでファイルを追加しました');
    } catch (error) {
      console.error('ドラッグ＆ドロップのアップロードに失敗しました', error);
      window.alert('ファイルのアップロードに失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsFileUploading(false);
      event.dataTransfer?.clearData();
    }
  }, [editor, disabled, registerUploadedMedia, insertImage, insertFileLink, showUploadNotice]);

  if (!editor) {
    return null;
  }

  const insertCodeBlock = () => {
    if (!editor) return;
    restoreSelection();
    const chain = createChainWithSelection();
    if (!chain) {
      closeInsertMenu();
      return;
    }
    chain.toggleCodeBlock().run();
    const { from, to } = editor.state.selection;
    editor.commands.setTextSelection({ from, to });
    editor.commands.focus();
    closeInsertMenu();
  };

  /* note.com の挿入メニュー構成に準拠 */
  const insertActions: InsertAction[] = [
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
      id: 'file',
      label: isFileUploading ? 'アップロード中…' : 'ファイル',
      icon: <DocumentArrowDownIcon className="h-5 w-5" />,
      handler: () => {
        if (!isFileUploading) {
          handleInsertFile();
        }
      },
    },
    {
      id: 'heading2',
      label: '大見出し',
      icon: <span className="text-[12px] font-bold">h2</span>,
      handler: () => insertHeading(2),
    },
    {
      id: 'heading3',
      label: '小見出し',
      icon: <span className="text-[12px] font-bold">h3</span>,
      handler: () => insertHeading(3),
    },
    {
      id: 'bullet',
      label: '箇条書きリスト',
      icon: <ListBulletIcon className="h-5 w-5" />,
      handler: insertBulletList,
    },
    {
      id: 'ordered',
      label: '番号付きリスト',
      icon: <span className="text-[12px] font-bold">1.</span>,
      handler: insertOrderedList,
    },
    {
      id: 'quote',
      label: '引用',
      icon: <Bars3BottomLeftIcon className="h-5 w-5" />,
      handler: insertQuote,
    },
    {
      id: 'code',
      label: 'コード',
      icon: <span className="text-[12px] font-bold">{'<>'}</span>,
      handler: insertCodeBlock,
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
      id: 'paid',
      label: activeAccess === 'paid' ? '有料エリアを解除' : '有料エリア指定',
      icon: <span className="text-sm font-bold">￥</span>,
      handler: togglePaidBlock,
    },
    {
      id: 'paragraph',
      label: 'テキストに戻す',
      icon: <span className="text-base font-bold">T</span>,
      handler: insertParagraph,
    },
  ];

  /* BubbleMenu用: 選択範囲の有料/無料をその場で切替 */
  const bubbleToggleAccess = () => {
    if (!editor) return;
    const next = extractAccessFromSelection(editor) === 'paid' ? 'public' : 'paid';
    SUPPORTED_ACCESS_NODES.forEach((type) => {
      if (editor.isActive(type)) {
        editor.commands.updateAttributes(type, { access: next });
      }
    });
    setActiveAccess(next);
    updatePaidMarkers();
  };

  const bubbleButtonClass = (active: boolean) =>
    `flex h-8 min-w-8 items-center justify-center rounded-[7px] px-1.5 text-[13px] font-bold transition ${
      active ? 'bg-white/20 text-pure-white' : 'text-white/75 hover:bg-white/10 hover:text-pure-white'
    }`;

  return (
    <div className="relative mx-auto flex w-full max-w-full flex-col items-center pb-4">
      {/* note.com流: 枠のない白いキャンバスに直接書く */}
      <div className="w-full max-w-full px-0">
        <div
          ref={containerRef}
          className={`relative mx-auto w-full max-w-[var(--note-rich-width)] bg-white px-1 pb-24 pt-1 transition-shadow ${isDragOver ? 'rounded-xl ring-2 ring-sky-300' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="記事本文"
          style={{
            ['--note-rich-width' as string]: `${CANVAS_MAX_WIDTH}px`,
          }}
        >
          {isDragOver ? (
            <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-400 bg-sky-50/90 text-center text-sm font-semibold text-sky-600">
              <p>ここにファイルをドロップして追加</p>
              <p className="mt-1 text-xs font-medium text-sky-500">画像はそのまま挿入、その他のファイルはリンクとして追加されます</p>
            </div>
          ) : null}

          {/* 空行の「＋」 — note.com流の控えめな白丸 */}
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
              className="absolute left-[-40px] z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400 shadow-sm transition hover:border-slate-400 hover:text-slate-600 max-md:left-[-6px] max-md:h-7 max-md:w-7"
              style={{ top: insertButtonTop }}
              aria-label="ブロックを挿入"
            >
              <PlusIcon className="h-5 w-5 max-md:h-4 max-md:w-4" />
            </button>
          ) : null}

          {/* 挿入ポップオーバー(＋の横に出る) */}
          {isInsertMenuOpen ? (
            <>
              <div className="fixed inset-0 z-30" onMouseDown={closeInsertMenu} aria-hidden="true" />
              <div
                className="absolute left-[4px] z-40 w-64 overflow-hidden rounded-xl border border-line-soft bg-white py-1.5 shadow-[0_24px_60px_-24px_rgba(11,31,58,.35)] md:left-[-6px]"
                style={{ top: insertButtonTop + 44 }}
                role="menu"
                aria-label="挿入"
              >
                <p className="px-3 pb-1 pt-1 text-[11px] font-bold text-slate-400">挿入</p>
                <div className="max-h-[320px] overflow-y-auto">
                  {insertActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={action.handler}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-[13.5px] font-semibold text-navy-900 transition hover:bg-canvas"
                      role="menuitem"
                    >
                      <span className="flex h-6 w-6 items-center justify-center text-slate-500">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {/* 有料境界 — note.com流の控えめなライン */}
          {hasPaidArea && paidMarkerTop !== null ? (
            <div
              ref={paidMarkerRef}
              className="pointer-events-none absolute left-0 right-0 z-20 flex items-center gap-3 px-1"
              style={{ top: Math.max(paidMarkerTop, 8) }}
            >
              <span className="h-px flex-1 bg-amber-300/80" />
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                <LockClosedIcon className="h-3.5 w-3.5" aria-hidden="true" />
                ここから有料
              </span>
              <span className="h-px flex-1 bg-amber-300/80" />
            </div>
          ) : null}

          {/* 選択時だけ浮かぶツールバー(note.com流) */}
          {editor && !disabled ? (
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 120, placement: 'top' }}
              className="flex items-center gap-0.5 rounded-[10px] bg-[#1f2c3d] p-1 shadow-[0_14px_40px_-14px_rgba(11,31,58,.6)]"
            >
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={bubbleButtonClass(editor.isActive('bold'))}
                title="太字"
              >
                <BoldIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={bubbleButtonClass(editor.isActive('italic'))}
                title="斜体"
              >
                <ItalicIcon className="h-4 w-4" />
              </button>
              <span className="mx-0.5 h-5 w-px bg-white/15" aria-hidden="true" />
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={bubbleButtonClass(editor.isActive('heading', { level: 2 }))}
                title="大見出し"
              >
                <span className="text-[12px]">大見出し</span>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={bubbleButtonClass(editor.isActive('heading', { level: 3 }))}
                title="小見出し"
              >
                <span className="text-[12px]">小見出し</span>
              </button>
              <span className="mx-0.5 h-5 w-px bg-white/15" aria-hidden="true" />
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={bubbleButtonClass(editor.isActive('blockquote'))}
                title="引用"
              >
                <Bars3BottomLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className={bubbleButtonClass(editor.isActive('link'))}
                title="リンク"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <span className="mx-0.5 h-5 w-px bg-white/15" aria-hidden="true" />
              <button
                type="button"
                onClick={bubbleToggleAccess}
                className={bubbleButtonClass(activeAccess === 'paid')}
                title={activeAccess === 'paid' ? '無料に戻す' : '有料エリアにする'}
              >
                <span className="text-[12px]">{activeAccess === 'paid' ? '無料に戻す' : '有料'}</span>
              </button>
            </BubbleMenu>
          ) : null}

          <EditorContent
            editor={editor}
            className="note-rich-editor prose prose-lg prose-slate max-w-none focus:outline-none"
          />
        </div>
      </div>

      {uploadNotice ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-40 w-[min(90vw,320px)] -translate-x-1/2 rounded-full bg-navy-900/90 px-4 py-2 text-center text-xs font-semibold text-pure-white shadow-lg md:bottom-10">
          {uploadNotice}
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
          min-height: 50vh;
          outline: none;
        }

        /* Placeholder(空行ガイド) — note.com流 */
        .note-rich-editor .ProseMirror p.is-editor-empty:first-child::before,
        .note-rich-editor .ProseMirror p.is-empty::before {
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          color: #b6c2d1;
        }

        .note-rich-editor .ProseMirror pre {
          background: #0f1b2d;
          color: #e2e8f0;
          border-radius: 10px;
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }

        .note-rich-editor .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
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

        .note-rich-editor .ProseMirror [data-access="paid"] {
          position: relative;
          margin-left: -1.55rem;
          margin-right: -1.55rem;
          padding-left: 1.55rem;
        }

        .note-rich-editor .ProseMirror [data-access="paid"]::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.4rem;
          bottom: 0.4rem;
          width: 3px;
          border-radius: 9999px;
          background: linear-gradient(180deg, rgba(245, 158, 11, 0.9), rgba(249, 115, 22, 0.6));
        }

        .note-rich-editor .ProseMirror [data-access="paid"] + * {
          margin-top: 2rem;
        }

        @media (max-width: 640px) {
          .note-rich-editor .ProseMirror [data-access="paid"] {
            margin-left: -1.2rem;
            margin-right: -1.2rem;
            padding-left: 1.2rem;
          }

          .note-rich-editor .ProseMirror [data-access="paid"]::before {
            top: 0.3rem;
            bottom: 0.3rem;
          }
        }

        .note-rich-editor .ProseMirror hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 2rem 0;
        }

        .note-rich-editor .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }

        .note-rich-editor .ProseMirror a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}
