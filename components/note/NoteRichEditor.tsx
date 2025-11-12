'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode, ChangeEvent, DragEvent } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
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
  const lastSelectionRef = useRef<{ from: number; to: number } | null>(null);
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
      const offset = firstRect.top - containerRect.top - 28;
      setPaidMarkerTop(offset);
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

  const handleToolbarImage = useCallback(() => {
    if (lastSelectionRef.current) {
      storedSelectionRef.current = { ...lastSelectionRef.current };
    }
    setIsMediaOpen(true);
  }, []);

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
    <div className="relative mx-auto flex w-full max-w-full flex-col items-center gap-6 pb-28 md:pb-12">
      <div className="w-full max-w-full px-0 md:px-4">
        <div
          ref={containerRef}
          className={`relative mx-auto w-full max-w-[var(--note-rich-width)] rounded-xl bg-white/90 px-4 py-10 shadow-sm ring-1 ring-slate-200 transition-shadow ${isDragOver ? 'ring-4 ring-blue-300 shadow-xl' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="NOTEエディタ本文"
          style={{
            // note.com は約 720px 程度の本文幅
            // tailwind でカスタム値を渡すため CSS 変数を使用
            ['--note-rich-width' as string]: `${CANVAS_MAX_WIDTH}px`,
          }}
        >
          {isDragOver ? (
            <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/90 text-center text-sm font-semibold text-blue-600">
              <p>ここにファイルをドロップして追加</p>
              <p className="mt-1 text-xs font-medium text-blue-500">画像はそのまま挿入、その他のファイルはリンクとして追加されます</p>
            </div>
          ) : null}
          {showInsertButton && !disabled ? (
            <>
              <div
                className="absolute left-[-10px] flex h-8 w-1 items-center justify-center md:hidden"
                style={{ top: insertButtonTop }}
                aria-hidden="true"
              >
                <span className="block h-full w-full rounded-full bg-slate-300" />
              </div>
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
                className="absolute left-[-32px] hidden h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-500 md:flex md:left-[-48px] md:h-9 md:w-9"
                style={{ top: insertButtonTop }}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </>
          ) : null}

          {hasPaidArea && paidMarkerTop !== null ? (
            <div
              className="pointer-events-none absolute left-0 right-0 z-20 flex justify-center"
              style={{ top: Math.max(paidMarkerTop, 8) }}
            >
              <div className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                <LockClosedIcon className="h-4 w-4" aria-hidden="true" />
                <span>ここから有料エリア</span>
              </div>
            </div>
          ) : null}

          <EditorContent
            editor={editor}
            className="note-rich-editor prose prose-lg prose-slate max-w-none focus:outline-none"
          />
        </div>
      </div>

      {/* モバイル用フッターメニュー */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
        <div className="w-full max-w-[620px] overflow-x-auto px-3">
          <div className="flex w-max items-center gap-2 pb-2 pr-4">
            <ToolbarButtons
              editor={editor}
              disabled={disabled}
              activeAccess={activeAccess}
              onAccessChange={applyAccess}
              onImage={handleToolbarImage}
              onInsertMenu={openInsertMenu}
              isUploading={isFileUploading}
              createChain={createChainWithSelection}
            />
          </div>
        </div>
      </div>

      {/* デスクトップ用フッターメニュー */}
      <div className="hidden w-full justify-center md:flex">
        <div className="sticky bottom-6 z-30 w-full max-w-[780px] overflow-x-auto rounded-3xl border border-slate-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur">
          <div className="flex w-max items-center gap-2 pr-4">
            <ToolbarButtons
              editor={editor}
              disabled={disabled}
              activeAccess={activeAccess}
              onAccessChange={applyAccess}
              onImage={handleToolbarImage}
              onInsertMenu={openInsertMenu}
              isUploading={isFileUploading}
              createChain={createChainWithSelection}
            />
          </div>
        </div>
      </div>

      {uploadNotice ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-40 w-[min(90vw,320px)] -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2 text-center text-xs font-semibold text-white shadow-lg md:bottom-10">
          {uploadNotice}
        </div>
      ) : null}

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

interface ToolbarButtonsProps {
  editor: ReturnType<typeof useEditor> | null;
  disabled: boolean;
  activeAccess: AccessLevel;
  onAccessChange: (level: AccessLevel) => void;
  onImage: () => void;
  onInsertMenu: () => void;
  isUploading: boolean;
  createChain: () => ChainedCommands | null;
}

function ToolbarButtons({ editor, disabled, activeAccess, onAccessChange, onImage, onInsertMenu, isUploading, createChain }: ToolbarButtonsProps) {
  if (!editor) {
    return null;
  }

  return (
    <Fragment>
      <ToolbarButton
        onClick={() => {
          const chain = createChain();
          if (!chain) return;
          chain.toggleBold().run();
        }}
        active={editor.isActive('bold')}
        disabled={disabled}
        label="太字"
        icon={<BoldIcon className="h-4 w-4" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => {
          const chain = createChain();
          if (!chain) return;
          chain.toggleItalic().run();
        }}
        active={editor.isActive('italic')}
        disabled={disabled}
        label="斜体"
        icon={<ItalicIcon className="h-4 w-4" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => {
          const chain = createChain();
          if (!chain) return;
          chain.toggleHeading({ level: 2 }).run();
        }}
        active={editor.isActive('heading', { level: 2 })}
        disabled={disabled}
        label="大見出し"
        icon={<HeadingIcon className="h-4 w-4" label="H2" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => {
          const chain = createChain();
          if (!chain) return;
          chain.toggleHeading({ level: 3 }).run();
        }}
        active={editor.isActive('heading', { level: 3 })}
        disabled={disabled}
        label="小見出し"
        icon={<HeadingIcon className="h-4 w-4" label="H3" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => {
          const chain = createChain();
          if (!chain) return;
          chain.toggleBulletList().run();
        }}
        active={editor.isActive('bulletList')}
        disabled={disabled}
        label="箇条書き"
        icon={<ListBulletIcon className="h-4 w-4" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => {
          const chain = createChain();
          if (!chain) return;
          chain.toggleOrderedList().run();
        }}
        active={editor.isActive('orderedList')}
        disabled={disabled}
        label="番号付き"
        icon={<span className="text-xs font-semibold">1.</span>}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => {
          const chain = createChain();
          if (!chain) return;
          chain.toggleBlockquote().run();
        }}
        active={editor.isActive('blockquote')}
        disabled={disabled}
        label="引用"
        icon={<Bars3BottomLeftIcon className="h-4 w-4" />}
        activeClass="bg-blue-600 text-white"
      />
      <ToolbarButton
        onClick={() => {
          const chain = createChain();
          if (!chain) return;
          chain.undo().run();
        }}
        disabled={disabled}
        label="元に戻す"
        icon={<span className="text-xs font-semibold">↺</span>}
      />
      <ToolbarButton
        onClick={() => {
          const chain = createChain();
          if (!chain) return;
          chain.redo().run();
        }}
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
