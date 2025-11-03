'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { lpApi, productApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LPDetail } from '@/types';
import { BlockType, BlockContent, TemplateBlock } from '@/types/templates';
import TemplateSelector from '@/components/TemplateSelector';
import DraggableBlockEditor from '@/components/DraggableBlockEditor';
import PropertyPanel from '@/components/PropertyPanel';
import AITextGenerator from '@/components/AITextGenerator';
import ColorThemeGenerator from '@/components/ColorThemeGenerator';
import { PageLoader, EditorSkeleton } from '@/components/LoadingSpinner';
import { convertAIResultToBlocks } from '@/lib/aiToBlocks';
import { applyThemeShadesToBlock } from '@/lib/themeApplier';
import { TEMPLATE_LIBRARY, INFO_PRODUCT_BLOCKS } from '@/lib/templates';
import { redirectToLogin } from '@/lib/navigation';
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  LinkIcon,
  RocketLaunchIcon,
  Squares2X2Icon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import type { AIGenerationResponse } from '@/types/api';
import type { ColorShades } from '@/lib/colorGenerator';

type BlockContentWithMeta = BlockContent & {
  __templateId?: string;
  __templateName?: string;
};

// ブロックタイプから日本語名を取得するヘルパー関数
function getBlockDisplayName(block: { blockType: BlockType; content: BlockContentWithMeta }): string {
  const allTemplates = [...TEMPLATE_LIBRARY, ...INFO_PRODUCT_BLOCKS];
  const metaName = (block.content as any)?.__templateName as string | undefined;
  if (metaName) return metaName;

  const metaId = (block.content as any)?.__templateId as string | undefined;
  if (metaId) {
    const variant = allTemplates.find((template) => template.id === metaId);
    if (variant?.name) {
      return variant.name;
    }
  }

  const template = allTemplates.find((t) => t.templateId === block.blockType);
  return template?.name || block.blockType;
}

// モバイル用タブ型定義
type TabType = 'blocks' | 'edit' | 'preview' | 'settings';
// UUID生成のヘルパー関数
function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface LPBlock {
  id: string;
  blockType: BlockType;
  content: BlockContentWithMeta;
  order: number;
}

interface ProductOption {
  id: string;
  title: string;
  lpId?: string | null;
  isAvailable: boolean;
}

export default function EditLPNewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lpId = params.id as string;
  const { isAuthenticated, isInitialized } = useAuthStore();
  
  const [lp, setLp] = useState<LPDetail | null>(null);
  const [blocks, setBlocks] = useState<LPBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiGeneratorConfig, setAiGeneratorConfig] = useState<any>(null);
  const [lpTitle, setLpTitle] = useState('');
  const [lpSettings, setLpSettings] = useState({
    showSwipeHint: false,
    floatingCta: false,
    swipeDirection: 'vertical' as 'vertical' | 'horizontal',
  });
  const [metaSettings, setMetaSettings] = useState({
    title: '',
    description: '',
    imageUrl: '',
    siteName: '',
  });
  const [mobileTab, setMobileTab] = useState<TabType>('preview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showColorGenerator, setShowColorGenerator] = useState(false);
  const [customThemeShades, setCustomThemeShades] = useState<ColorShades | null>(null);
  const [customThemeHex, setCustomThemeHex] = useState<string>('#DC2626');
  const [linkedProduct, setLinkedProduct] = useState<{ id: string; title?: string | null } | null>(null);
  const [linkedSalon, setLinkedSalon] = useState<{ id: string; title?: string | null; public_path?: string | null } | null>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [isProductLinkUpdating, setIsProductLinkUpdating] = useState(false);
  const [productLinkError, setProductLinkError] = useState<string | null>(null);
  
  // サイドバー可変幅の状態管理
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(288); // 初期値: 18rem = 288px
  const [rightSidebarWidth, setRightSidebarWidth] = useState(384); // 初期値: 24rem = 384px
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(true);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);

  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const blockElementMap = useRef<Map<string, HTMLElement>>(new Map());

  const registerBlockElement = useCallback((blockId: string, element: HTMLElement | null) => {
    const registry = blockElementMap.current;
    if (element) {
      registry.set(blockId, element);
    } else {
      registry.delete(blockId);
    }
  }, []);

  const scrollToBlock = useCallback((blockId: string) => {
    const container = previewScrollRef.current;
    const target = blockElementMap.current.get(blockId);
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset = targetRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({
      top: Math.max(offset - container.clientHeight / 3, 0),
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    // 初期化が完了するまで待つ
    if (!isInitialized) return;

    if (!isAuthenticated) {
      redirectToLogin(router);
      return;
    }
    fetchLP();
  }, [isAuthenticated, isInitialized, lpId]);

  useEffect(() => {
    if (!selectedBlockId) return;
    scrollToBlock(selectedBlockId);
  }, [selectedBlockId, scrollToBlock]);

  // サイドバーの状態をlocalStorageから復元
  useEffect(() => {
    const savedLeftWidth = localStorage.getItem('leftSidebarWidth');
    const savedRightWidth = localStorage.getItem('rightSidebarWidth');
    const savedLeftVisible = localStorage.getItem('isLeftSidebarVisible');
    const savedRightVisible = localStorage.getItem('isRightSidebarVisible');
    
    if (savedLeftWidth) setLeftSidebarWidth(Number(savedLeftWidth));
    if (savedRightWidth) setRightSidebarWidth(Number(savedRightWidth));
    if (savedLeftVisible) setIsLeftSidebarVisible(savedLeftVisible === 'true');
    if (savedRightVisible) setIsRightSidebarVisible(savedRightVisible === 'true');
  }, []);

  // サイドバーの状態をlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('leftSidebarWidth', String(leftSidebarWidth));
    localStorage.setItem('rightSidebarWidth', String(rightSidebarWidth));
    localStorage.setItem('isLeftSidebarVisible', String(isLeftSidebarVisible));
    localStorage.setItem('isRightSidebarVisible', String(isRightSidebarVisible));
  }, [leftSidebarWidth, rightSidebarWidth, isLeftSidebarVisible, isRightSidebarVisible]);

  const fetchLinkedProduct = async (lpIdValue: string) => {
    try {
      const response = await productApi.list({ lp_id: lpIdValue });
      const productsData = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      const availableProducts = productsData.filter((product: any) => product && product.is_available !== false);
      if (availableProducts.length > 0) {
        const primaryProduct = availableProducts[0];
        setLinkedProduct({ id: String(primaryProduct.id), title: primaryProduct.title });
      } else if (productsData.length > 0) {
        const firstProduct = productsData[0];
        setLinkedProduct({ id: String(firstProduct.id), title: firstProduct.title });
      } else {
        setLinkedProduct(null);
      }
    } catch (error) {
      console.error('Failed to fetch linked product for LP:', error);
      setLinkedProduct(null);
    }
  };

  const fetchProductOptions = useCallback(async () => {
    try {
      const response = await productApi.list({ limit: 200 });
      const rawPayload = response.data as unknown;
      const extractProducts = (payload: unknown): any[] => {
        if (!payload) return [];
        if (Array.isArray(payload)) return payload;
        if (typeof payload === 'object') {
          const record = payload as Record<string, unknown>;
          if (Array.isArray(record.data)) return record.data;
          if (Array.isArray(record.products)) return record.products;
        }
        return [];
      };

      const items = extractProducts(rawPayload).map((product: any) => ({
        id: String(product?.id ?? ''),
        title: product?.title || '名称未設定の商品',
        lpId: product?.lp_id ? String(product.lp_id) : product?.lp_id ?? null,
        isAvailable: product?.is_available !== false,
      })) as ProductOption[];

      setProductOptions(items);
    } catch (error) {
      console.error('Failed to fetch product list:', error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProductOptions();
  }, [isAuthenticated, fetchProductOptions]);

  const fetchLP = async () => {
    try {
      const response = await lpApi.get(lpId);
      setLp(response.data);
      setLinkedSalon(response.data.linked_salon ?? null);
      setLpTitle(response.data.title || '');
      setLpSettings({
        showSwipeHint: Boolean(response.data.show_swipe_hint),
        floatingCta: Boolean(response.data.floating_cta),
        swipeDirection: response.data.swipe_direction || 'vertical',
      });
      setMetaSettings({
        title: response.data.meta_title ?? '',
        description: response.data.meta_description ?? '',
        imageUrl: response.data.meta_image_url ?? '',
        siteName: response.data.meta_site_name ?? '',
      });

      // カスタムテーマを復元
      if (response.data.custom_theme_hex) {
        setCustomThemeHex(response.data.custom_theme_hex);
      }
      if (response.data.custom_theme_shades) {
        setCustomThemeShades(response.data.custom_theme_shades as unknown as ColorShades);
      }

      if (response.data.linked_salon) {
        setLinkedProduct(null);
      } else {
        await fetchLinkedProduct(lpId);
      }
      
      // AI提案がsessionStorageにある場合は、それをブロックに変換
      const aiParam = searchParams.get('ai');
      if (aiParam === 'true' && response.data.steps.length === 0) {
        try {
          const aiDataStr = sessionStorage.getItem('aiSuggestion');
          if (!aiDataStr) {
            console.error('❌ AI提案データがsessionStorageにありません');
            setIsLoading(false);
            return;
          }
          
          const aiResult = JSON.parse(aiDataStr) as AIGenerationResponse;
          // 使用後は削除
          sessionStorage.removeItem('aiSuggestion');
          
        console.log('AI提案を適用中...');
          const aiBlocks = convertAIResultToBlocks(aiResult);
        console.log('Converted to blocks:', aiBlocks);
          
          if (aiBlocks.length === 0) {
            console.error('❌ No blocks generated from AI result');
            setIsLoading(false);
            return;
          }
          
          // AI提案から生成したブロックをDBに保存
        console.log('Saving AI-generated blocks to database...');
          let savedCount = 0;
          let failedCount = 0;
          
          for (const block of aiBlocks) {
            try {
              const stepData = {
                step_order: block.order,
                image_url: 'imageUrl' in block.content ? (block.content as any).imageUrl || '/placeholder.jpg' : '/placeholder.jpg',
                block_type: block.blockType,
                content_data: block.content as unknown as Record<string, unknown>,
              };
              await lpApi.addStep(lpId, stepData);
              savedCount++;
              console.log(`✅ Saved block ${savedCount}/${aiBlocks.length}:`, block.blockType);
            } catch (blockError: any) {
              failedCount++;
              console.error(`❌ Failed to save block ${block.blockType}:`, blockError.response?.data || blockError.message);
            }
          }
          
          console.log(`✅ AI blocks saved: ${savedCount} succeeded, ${failedCount} failed`);
          
          // URLからAIパラメータを削除して再読み込み
          router.replace(`/lp/${lpId}/edit`);
          // 保存したブロックを再読み込み
          setTimeout(() => fetchLP(), 100);
          return;
        } catch (e: any) {
          console.error('❌ AI結果の処理エラー:', e);
          console.error('エラー詳細:', e.message, e.stack);
          const errorMsg = e.response?.data?.detail || e.message || 'AI提案の適用に失敗しました';
          setError(errorMsg);
          alert(`エラー: ${errorMsg}\n\n一部のブロックがスキップされた可能性があります。続行しますか？`);
        }
      }
      
      // ステップデータをブロックに変換
      const convertedBlocks: LPBlock[] = response.data.steps.map((step: any) => {
        // content_dataが存在すれば使用、なければデフォルト
        let content: BlockContentWithMeta;
        if (step.content_data && Object.keys(step.content_data).length > 0) {
        content = step.content_data as BlockContentWithMeta;
        } else {
          // 旧形式（image_urlのみ）の場合のフォールバック
          content = {
            title: 'タイトルを入力',
            subtitle: 'サブタイトルを入力',
            backgroundColor: '#000000',
            textColor: '#FFFFFF',
            imageUrl: step.image_url,
          } as any;
        }

        const templateMetaSource = [...TEMPLATE_LIBRARY, ...INFO_PRODUCT_BLOCKS];
        const existingTemplateId = (content as any).__templateId as string | undefined;
        const templateMatchById = existingTemplateId
          ? templateMetaSource.find((tpl) => tpl.id === existingTemplateId)
          : undefined;
        const templateMatchByType = templateMatchById || templateMetaSource.find((tpl) => tpl.templateId === (step.block_type || 'top-hero-1'));

        const normalizedContent = {
          ...content,
          __templateId: templateMatchById?.id || existingTemplateId || templateMatchByType?.id,
          __templateName: templateMatchById?.name || (content as any).__templateName || templateMatchByType?.name,
        } as BlockContentWithMeta;

        return {
          id: step.id,
          blockType: (step.block_type || 'top-hero-1') as BlockType,
          content: normalizedContent,
          order: step.step_order,
        };
      });
      
      setBlocks(convertedBlocks);
    } catch (err) {
      setError('LPの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTemplate = (template: TemplateBlock) => {
    const newBlock: LPBlock = {
      id: generateId(),
      blockType: template.templateId,
      content: {
        ...template.defaultContent,
        __templateId: template.id,
        __templateName: template.name,
      } as BlockContentWithMeta,
      order: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleUpdateBlock = (blockId: string, field: string, value: any) => {
    const setNestedValue = (content: BlockContentWithMeta, path: string, newValue: any): BlockContentWithMeta => {
      if (!path.includes('.')) {
        return {
          ...content,
          [path]: newValue,
        };
      }

      const segments = path.split('.');
      const cloned = structuredClone(content) as Record<string, any>;
      let cursor: any = cloned;

      for (let i = 0; i < segments.length - 1; i++) {
        const key = segments[i];
        const nextKey = segments[i + 1];

        if (Array.isArray(cursor)) {
          const index = Number(key);
          if (!cursor[index]) {
            cursor[index] = /^\d+$/.test(nextKey) ? [] : {};
          }
          cursor = cursor[index];
        } else {
          if (!(key in cursor) || cursor[key] == null) {
            cursor[key] = /^\d+$/.test(nextKey) ? [] : {};
          }
          cursor = cursor[key];
        }
      }

      const lastKey = segments[segments.length - 1];
      if (Array.isArray(cursor)) {
        cursor[Number(lastKey)] = newValue;
      } else {
        cursor[lastKey] = newValue;
      }

      return cloned as BlockContentWithMeta;
    };

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          content: setNestedValue(block.content, field, value),
        };
      }),
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleReorderBlocks = (reorderedBlocks: LPBlock[]) => {
    // orderプロパティを再計算
    const updatedBlocks = reorderedBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
    setBlocks(updatedBlocks);
  };

  const handleApplyTheme = async (shades: ColorShades, hex: string) => {
    // テーマシェードを保存
    setCustomThemeShades(shades);
    setCustomThemeHex(hex);
    
    // ブロックタイプによってカラー適用するかを判定
    const colorableBlockTypes = [
      'top-hero-1',
      'top-highlights-1',
      'top-cta-1',
      'top-testimonials-1',
      'top-faq-1',
      'top-pricing-1',
      'top-before-after-1',
      'top-problem-1',
      'top-bonus-1',
      'top-guarantee-1',
      'top-countdown-1',
      'top-inline-cta-1',
      'top-hero-image-1',
      'top-media-spotlight-1',
    ];
    
    // 11段階のシェードをブロックごとに適用
    setBlocks((prev) =>
      prev.map((block) => {
        if (!colorableBlockTypes.includes(block.blockType)) {
          return block;
        }

        const themed = applyThemeShadesToBlock(
          {
            blockType: block.blockType,
            content: block.content as unknown as Record<string, unknown>,
          },
          shades
        );

        const themedContent = {
          ...block.content,
          ...(themed.content ?? {}),
        } as BlockContentWithMeta;

        return {
          ...block,
          content: themedContent,
        };
      })
    );

    // テーマを LP に保存
    try {
      const lpUpdateResponse = await lpApi.update(lpId, {
        custom_theme_hex: hex,
        custom_theme_shades: shades as unknown as Record<string, string>,
      });
      
      if (lpUpdateResponse.data) {
        setLp((prev) =>
          prev
            ? {
                ...prev,
                custom_theme_hex: hex,
                custom_theme_shades: shades as unknown as Record<string, string>,
              }
            : prev
        );
        console.log('✅ テーマが正常に保存されました');
    console.log('11段階のシェードを全ブロックに適用しました');
      }
    } catch (err: any) {
      console.error('❌ テーマ保存エラー:', err);
      const errorDetail = err?.response?.data?.detail || err?.message || '不明なエラー';
      setError(`テーマの保存に失敗しました: ${errorDetail}`);
    }
  };

  const handleChangeLinkedProduct = async (newValue: string) => {
    setIsProductLinkUpdating(true);
    setProductLinkError(null);
    try {
      const nextProductId = newValue === 'none' ? null : newValue;

      if ((linkedProduct?.id ?? null) === nextProductId) {
        setIsProductLinkUpdating(false);
        return;
      }

      if (linkedProduct?.id && linkedProduct.id !== nextProductId) {
        await productApi.update(linkedProduct.id, { lp_id: null });
      }

      if (nextProductId) {
        await productApi.update(nextProductId, { lp_id: lpId });
        await lpApi.update(lpId, { product_id: nextProductId });
        const selectedOption = productOptions.find((option) => option.id === nextProductId);
        setLinkedProduct({ id: nextProductId, title: selectedOption?.title });
        setLp((prev) =>
          prev
            ? {
                ...prev,
                product_id: nextProductId,
              }
            : prev
        );
      } else {
        await lpApi.update(lpId, { product_id: null });
        setLinkedProduct(null);
        setLp((prev) =>
          prev
            ? {
                ...prev,
                product_id: undefined,
              }
            : prev
        );
      }

      await fetchProductOptions();
      await fetchLinkedProduct(lpId);
    } catch (error: any) {
      console.error('Failed to update product link:', error);
      const detail = error?.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : error?.message || '商品連携の更新に失敗しました';
      setProductLinkError(message);
    } finally {
      setIsProductLinkUpdating(false);
    }
  };

  const handleUpdateSelectedBlock = (field: string, value: any) => {
    if (!selectedBlockId) return;
    handleUpdateBlock(selectedBlockId, field, value);
  };

  const handleGenerateAI = (type: 'headline' | 'subtitle' | 'description' | 'cta', field: string) => {
    if (!selectedBlockId) return;
    
    const block = blocks.find(b => b.id === selectedBlockId);
    if (!block) return;

    // AI生成のコンテキストを作成
    const context = {
      product: lp?.title,
      headline: 'title' in block.content ? (block.content as any).title : undefined,
      business: 'LP作成',
      target: '一般ユーザー',
      goal: 'コンバージョン',
    };

    setAiGeneratorConfig({ type, field, context });
    setShowAIGenerator(true);
  };

  const handleClosePropertyPanel = () => {
    setSelectedBlockId(null);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileTab('blocks');
    }
  };

  const handleAITextSelect = (text: string) => {
    if (!selectedBlockId || !aiGeneratorConfig) return;
    handleUpdateBlock(selectedBlockId, aiGeneratorConfig.field, text);
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    // スワップ
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    // orderを再計算
    newBlocks.forEach((block, idx) => {
      block.order = idx;
    });

    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const orderedBlocks = blocks.map((block, index) => ({
        ...block,
        order: index,
      }));

      const normalizeMetaValue = (value: string) => {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      };

      // LP本体の表示設定を更新
      const lpUpdateResponse = await lpApi.update(lpId, {
        title: lpTitle.trim() || undefined,
        show_swipe_hint: lpSettings.showSwipeHint,
        floating_cta: false,
        swipe_direction: lpSettings.swipeDirection,
        meta_title: normalizeMetaValue(metaSettings.title),
        meta_description: normalizeMetaValue(metaSettings.description),
        meta_image_url: normalizeMetaValue(metaSettings.imageUrl),
        meta_site_name: normalizeMetaValue(metaSettings.siteName),
        custom_theme_hex: customThemeHex,
        custom_theme_shades: customThemeShades as unknown as Record<string, string> | null,
      });
      setLp((prev) =>
        prev
          ? {
              ...prev,
              ...lpUpdateResponse.data,
            }
          : prev
      );

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      const bulkPayload = orderedBlocks.map((block, index) => {
        const clonedContent = JSON.parse(JSON.stringify(block.content)) as Record<string, unknown>;
        const rawImageUrl = (clonedContent as any)?.imageUrl;
        const imageUrl = typeof rawImageUrl === 'string' && rawImageUrl.trim().length > 0
          ? rawImageUrl
          : '/placeholder.jpg';
        const rawVideoUrl = (clonedContent as any)?.videoUrl;
        const videoUrl = typeof rawVideoUrl === 'string' && rawVideoUrl.trim().length > 0 ? rawVideoUrl : null;

        return {
          id: block.id && uuidRegex.test(block.id) ? block.id : undefined,
          block_type: block.blockType,
          content_data: clonedContent,
          step_order: index,
          image_url: imageUrl,
          video_url: videoUrl,
        };
      });

      const bulkResponse = await lpApi.updateBlocks(lpId, bulkPayload);
      const updatedSteps = bulkResponse.data?.steps ?? [];

      const normalizedBlocks: LPBlock[] = updatedSteps.map((step: any) => {
        const contentData = (step.content_data || {}) as BlockContentWithMeta;
        const contentRecord = contentData as unknown as Record<string, unknown>;
        const blockTypeValue =
          (typeof step.block_type === 'string' && step.block_type.trim().length > 0
            ? step.block_type
            : typeof contentRecord['block_type'] === 'string'
            ? (contentRecord['block_type'] as string)
            : undefined) || 'top-hero-1';
        const blockType = blockTypeValue as BlockType;
        return {
          id: step.id,
          blockType,
          content: contentData,
          order: step.step_order ?? 0,
        };
      });

      setBlocks(normalizedBlocks);
      // 成功通知を表示
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || '保存に失敗しました';
      setError(errorMessage);
      // エラー通知（3秒後に自動消去）
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('このLPを公開しますか？')) return;

    try {
      await lpApi.publish(lpId);
      await fetchLP();
      alert('LPを公開しました！');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'LPの公開に失敗しました');
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('このLPを非公開に戻しますか？')) return;

    try {
      await lpApi.unpublish(lpId);
      await fetchLP();
      alert('LPを非公開に戻しました。');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'LPの非公開化に失敗しました');
    }
  };

  // サイドバーリサイズハンドラー
  const handleMouseDownResize = (side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(side);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      if (isResizing === 'left') {
        const newWidth = Math.max(200, Math.min(500, e.clientX));
        setLeftSidebarWidth(newWidth);
      } else if (isResizing === 'right') {
        const newWidth = Math.max(300, Math.min(600, window.innerWidth - e.clientX));
        setRightSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!lp) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-900 text-xl">LPが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Toast Notifications */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="relative flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-inner">
              <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-900">保存が完了しました</span>
              <span className="text-xs text-emerald-600">最新の変更がエディタに反映されています</span>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 h-14 flex-shrink-0">
        <div className="h-full px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link 
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 transition-colors text-xs sm:text-sm font-medium"
            >
              ← 戻る
            </Link>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{lp.title}</div>
          </div>

          {/* Right: Actions */}
          {/* Desktop Actions - Full Menu */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 text-xs rounded font-semibold ${
              lp.status === 'published'
                ? 'bg-green-50 text-green-700'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {lp.status === 'published' ? '公開中' : '下書き'}
            </span>

            {lp.status === 'published' && (
              <>
                <a
                  href={`/view/${lp.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-slate-200 rounded transition-colors"
                >
                  プレビュー
                </a>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/view/${lp.slug}`;
                    navigator.clipboard.writeText(url);
                    alert('URLをコピーしました！');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded transition-colors"
                  title="公開URLをコピー"
                >
                  URLコピー
                </button>
              </>
            )}

            {lp.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                公開
              </button>
            )}

            {lp.status === 'published' && (
              <button
                onClick={handleUnpublish}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
              >
                非公開に戻す
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSaving && (
                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSaving ? (
                '保存中...'
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
                  保存
                </span>
              )}
            </button>
          </div>

          {/* Mobile Actions - Always Visible */}
          <div className="flex lg:hidden items-center gap-1.5 flex-shrink-0">
            {/* Quick Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="保存"
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
                  保存
                </span>
              )}
            </button>

            {/* Quick Publish Button */}
            {lp.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                title="公開"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
              title="メニュー"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full Screen Modal */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-sm w-full overflow-y-auto max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-slate-900 font-semibold">メニュー</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Status Display */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600 text-sm">ステータス</span>
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  lp.status === 'published'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {lp.status === 'published' ? '公開中' : '下書き'}
                </span>
              </div>

              {/* Primary Actions */}
              <div className="space-y-3 pt-2">
                {/* Save Button */}
                <button
                  onClick={() => {
                    handleSave();
                    setShowMobileMenu(false);
                  }}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                    </svg>
                  )}
                  {isSaving ? '保存中...' : (
                    <span className="inline-flex items-center gap-2">
                      <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
                      保存
                    </span>
                  )}
                </button>

                {/* Publish/Preview Button */}
                {lp.status === 'draft' && (
                  <button
                    onClick={() => {
                      handlePublish();
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors min-h-[48px] flex items-center justify-center gap-2"
                  >
                    <RocketLaunchIcon className="h-5 w-5" aria-hidden="true" />
                    公開
                  </button>
                )}
                {lp.status === 'published' && (
                  <div className="space-y-2">
                    <a
                      href={`/view/${lp.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors min-h-[48px] flex items-center justify-center"
                    >
                      プレビュー
                    </a>
                    <button
                      onClick={() => {
                        handleUnpublish();
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors min-h-[48px] flex items-center justify-center"
                    >
                      非公開に戻す
                    </button>
                  </div>
                )}
              </div>

              {/* Secondary Actions */}
              {lp.status === 'published' && (
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/view/${lp.slug}`;
                      navigator.clipboard.writeText(url);
                      alert('URLをコピーしました！');
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors min-h-[44px] flex items-center justify-center gap-2 text-sm"
                  >
                    <LinkIcon className="h-4 w-4" aria-hidden="true" />
                    URLをコピー
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - 3 Column Layout (Desktop) / Tab-based Layout (Mobile) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden px-2 sm:px-4 lg:px-6 lg:gap-6">
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* モバイル用タブ */}
        <div className="lg:hidden flex-shrink-0 border-b border-slate-200 bg-white/50">
          <div className="flex gap-1 px-2 py-2 overflow-x-auto">
            <button
              onClick={() => setMobileTab('blocks')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                mobileTab === 'blocks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Squares2X2Icon className="h-4 w-4" aria-hidden="true" />
                ブロック
              </span>
            </button>
            <button
              onClick={() => setMobileTab('edit')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                mobileTab === 'edit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
                編集
              </span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                mobileTab === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="inline-flex items-center">プレビュー</span>
            </button>
            <button
              onClick={() => setMobileTab('settings')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                mobileTab === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
                設定
              </span>
            </button>
          </div>
        </div>

        {/* Left: Block List */}
        {isLeftSidebarVisible && (
          <div 
            className={`flex-col min-h-0 bg-transparent overflow-hidden flex ${
              mobileTab === 'blocks' ? 'flex' : 'hidden lg:flex'
            } flex-shrink-0 w-full lg:rounded-2xl lg:bg-white/70 lg:shadow-sm relative`}
            style={{ 
              width: window.innerWidth >= 1024 ? `${leftSidebarWidth}px` : '100%' 
            }}
          >
          <div className="py-3 lg:py-3 px-3">
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="w-full px-3 py-2.5 lg:py-2 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors min-h-[44px] lg:min-h-auto"
            >
              + ブロック追加
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            {/* モバイルではLP設定とSNSメタ情報を非表示 */}
            <div className="hidden lg:block py-3 px-3 border-b border-slate-200 space-y-3 bg-white/50 flex-shrink-0">
              <h4 className="text-xs font-bold text-slate-700 tracking-wide">LP設定</h4>

              <button
                onClick={() => setShowColorGenerator(true)}
                className="w-full px-3 py-2.5 lg:py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded font-semibold text-sm min-h-[44px] lg:min-h-auto transition-colors flex items-center justify-center gap-2"
              >
                <SwatchIcon className="h-4 w-4" aria-hidden="true" />
                テーマカラー生成
              </button>

              {/* スワイプ方向選択 */}
              <div className="space-y-2">
                <p className="text-sm lg:text-xs text-slate-900 font-semibold">スワイプ方向</p>
                <div className="flex gap-3 lg:gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="swipeDirection"
                      className="h-4 w-4 lg:h-3.5 lg:w-3.5 text-blue-600 focus:ring-blue-500"
                      checked={lpSettings.swipeDirection === 'vertical'}
                      onChange={() => setLpSettings((prev) => ({ ...prev, swipeDirection: 'vertical' }))}
                    />
                    <span className="text-sm lg:text-xs text-slate-700">縦スクロール</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="swipeDirection"
                      className="h-4 w-4 lg:h-3.5 lg:w-3.5 text-blue-600 focus:ring-blue-500"
                      checked={lpSettings.swipeDirection === 'horizontal'}
                      onChange={() => setLpSettings((prev) => ({ ...prev, swipeDirection: 'horizontal' }))}
                    />
                    <span className="text-sm lg:text-xs text-slate-700">横スワイプ</span>
                  </label>
                </div>
                <p className="text-xs lg:text-[11px] text-slate-500">LPの閲覧方向を選択できます</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer lg:gap-2">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 lg:h-4 lg:w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  checked={lpSettings.showSwipeHint}
                  onChange={(e) =>
                    setLpSettings((prev) => ({ ...prev, showSwipeHint: e.target.checked }))
                  }
                />
                <div>
                  <p className="text-sm lg:text-xs text-slate-900 font-semibold">スワイプアニメーション</p>
                  <p className="text-xs lg:text-[11px] text-slate-500">1枚目に指アイコンでスワイプを促します</p>
                </div>
              </label>
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-700 tracking-wide uppercase">商品・サービス連携</h5>
                  <p className="text-[11px] text-slate-500 mt-1">
                    CTAボタンで販売したい商品を選択できます。連携中は一次ボタンが自動で購入導線に切り替わります。
                  </p>
                </div>
                <select
                  value={linkedProduct?.id ?? 'none'}
                  onChange={(event) => handleChangeLinkedProduct(event.target.value)}
                  disabled={isProductLinkUpdating}
                  className="w-full px-3 py-2.5 lg:py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px] lg:min-h-auto"
                >
                  <option value="none">連携しない</option>
                  {productOptions.map((option) => {
                    const isAssignedElsewhere = Boolean(option.lpId && option.lpId !== lpId);
                    return (
                      <option key={option.id} value={option.id} disabled={isAssignedElsewhere}>
                        {option.title}
                        {isAssignedElsewhere ? '（他LPで使用中）' : ''}
                      </option>
                    );
                  })}
                </select>
                {isProductLinkUpdating ? (
                  <p className="text-xs text-slate-500">商品連携を更新しています...</p>
                ) : null}
                {productLinkError ? (
                  <p className="text-xs text-red-600">{productLinkError}</p>
                ) : null}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{linkedProduct?.title ? `現在: ${linkedProduct.title}` : '現在未連携'}</span>
                  <Link href="/products/manage" className="text-blue-600 hover:text-blue-700 font-semibold">
                    商品を管理
                  </Link>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-700 tracking-wide uppercase">LP名</h5>
                  <p className="text-[11px] text-slate-500 mt-1">ダッシュボードに表示されるLP名を設定できます。</p>
                </div>
                <input
                  type="text"
                  value={lpTitle}
                  onChange={(e) => setLpTitle(e.target.value)}
                  placeholder="LP名（例：春の新商品キャンペーン）"
                  className="w-full px-3 py-2.5 lg:py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px] lg:min-h-auto"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-700 tracking-wide uppercase">SNSメタ情報</h5>
                  <p className="text-[11px] text-slate-500 mt-1">LINEやSNSで共有した際のタイトル・説明・画像を指定できます。</p>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={metaSettings.title}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="OGPタイトル（例：〇〇講座 特設LP）"
                    className="w-full px-3 py-2.5 lg:py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px] lg:min-h-auto"
                  />
                  <textarea
                    value={metaSettings.description}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="OGPディスクリプション（120文字程度の紹介文）"
                    rows={3}
                    className="w-full px-3 py-2.5 lg:py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <input
                    type="text"
                    value={metaSettings.imageUrl}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="OGP画像URL（1200x630推奨）"
                    className="w-full px-3 py-2.5 lg:py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px] lg:min-h-auto"
                  />
                  <input
                    type="text"
                    value={metaSettings.siteName}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                    placeholder="サイト名（例：ABC情報局）"
                    className="w-full px-3 py-2.5 lg:py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px] lg:min-h-auto"
                  />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  未入力の場合はD-swipeのデフォルト情報が使用されます。空欄にして保存するとリセットできます。
                </p>
              </div>
            </div>

            {/* Block List - モバイルではブロック一覧のみ */}
            <div className={`py-3 px-3 lg:py-4 flex-1 min-h-0 ${mobileTab === 'blocks' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
              {blocks.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm font-medium">
                  ブロックを追加してください
                </div>
              ) : (
                <div className="space-y-2 lg:space-y-2">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      draggable
                      onClick={() => {
                        // モバイル表示ではブロッククリック時に自動的に編集タブに切り替え
                        if (window.innerWidth < 1024) {
                          setMobileTab('edit');
                        }
                        setSelectedBlockId(block.id);
                        scrollToBlock(block.id);
                      }}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/html', block.id);
                        (e.target as HTMLElement).style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        (e.target as HTMLElement).style.opacity = '1';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/html');
                        const draggedIndex = blocks.findIndex(b => b.id === draggedId);
                        const targetIndex = index;

                        if (draggedIndex !== targetIndex) {
                          const newBlocks = [...blocks];
                          const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
                          newBlocks.splice(targetIndex, 0, draggedBlock);
                          handleReorderBlocks(newBlocks);
                        }
                      }}
                      className={`w-full p-3 lg:p-3.5 cursor-pointer lg:cursor-move transition-colors min-h-[56px] lg:min-h-[64px] flex items-center rounded-lg border ${
                        selectedBlockId === block.id
                          ? 'bg-blue-50 border-blue-400 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <span className="text-base font-bold text-blue-600 flex-shrink-0">#{index + 1}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                            className="text-xs text-slate-500 hover:text-red-600 transition-colors flex-shrink-0"
                          >
                            削除
                          </button>
                        </div>
                        <div className="text-base font-semibold text-slate-900 truncate">{getBlockDisplayName(block)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* リサイズハンドル */}
          <div
            className="hidden lg:block absolute top-0 right-0 w-1 h-full bg-slate-300 hover:bg-blue-500 cursor-col-resize transition-colors"
            onMouseDown={handleMouseDownResize('left')}
          />
          
          {/* 折りたたみボタン */}
          <button
            onClick={() => setIsLeftSidebarVisible(false)}
            className="hidden lg:flex absolute bottom-4 right-4 w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded-full items-center justify-center shadow-lg transition-colors z-10"
            title="左サイドバーを閉じる"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        )}
        
        {/* 左サイドバー折りたたみ時の開くボタン */}
        {!isLeftSidebarVisible && (
          <button
            onClick={() => setIsLeftSidebarVisible(true)}
            className="hidden lg:flex flex-shrink-0 w-10 h-20 bg-slate-700 hover:bg-slate-600 text-white rounded-r-lg items-center justify-center shadow-lg transition-colors self-center"
            title="左サイドバーを開く"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Center: Preview */}
        <div className={`flex-1 min-w-0 bg-white overflow-hidden flex flex-col ${
          mobileTab === 'preview' ? 'lg:flex' : 'hidden lg:flex'
        }`}>
          {/* エディタツールバー */}
          <div className="flex flex-col gap-1 px-4 py-2 bg-slate-50 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-slate-700">エディタビュー</span>
              <span className="text-xs text-slate-500">正確なデザインは公開ページでご確認ください</span>
            </div>
            <div className="text-xs text-slate-500 sm:text-right">
              {blocks.length} ブロック
            </div>
          </div>

          {/* プレビューエリア */}
          <div className="flex-1 overflow-hidden">
            <div ref={previewScrollRef} className="h-full overflow-y-auto">
              <DraggableBlockEditor
                blocks={blocks}
                onUpdateBlock={() => {}}
                onDeleteBlock={() => {}}
                onReorderBlocks={handleReorderBlocks}
                isEditing={false}
                onSelectBlock={setSelectedBlockId}
                selectedBlockId={selectedBlockId || undefined}
                withinEditor
                onMountBlock={registerBlockElement}
              />
            </div>
          </div>
        </div>

        {/* 右サイドバー折りたたみ時の開くボタン */}
        {!isRightSidebarVisible && (
          <button
            onClick={() => setIsRightSidebarVisible(true)}
            className="hidden lg:flex flex-shrink-0 w-10 h-20 bg-slate-700 hover:bg-slate-600 text-white rounded-l-lg items-center justify-center shadow-lg transition-colors self-center"
            title="右サイドバーを開く"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right: Properties Panel (Desktop) / Bottom Drawer (Mobile) */}
        {/* デスクトップ表示 */}
        {isRightSidebarVisible && (
          <div 
            className={`hidden lg:flex bg-slate-100/50 border-l border-slate-200 overflow-hidden flex-shrink-0 flex-col relative`}
            style={{ width: `${rightSidebarWidth}px` }}
          >
            {/* リサイズハンドル */}
            <div
              className="absolute top-0 left-0 w-1 h-full bg-slate-300 hover:bg-blue-500 cursor-col-resize transition-colors z-10"
              onMouseDown={handleMouseDownResize('right')}
            />
            
            {selectedBlockId ? (
              <PropertyPanel
                block={blocks.find(b => b.id === selectedBlockId) || null}
                onUpdateContent={handleUpdateSelectedBlock}
                onClose={handleClosePropertyPanel}
                onGenerateAI={handleGenerateAI}
                linkedProduct={linkedProduct}
                linkedSalon={linkedSalon}
              />
            ) : (
              <div className="p-6 text-center text-slate-500 font-medium text-sm">
                ブロックを選択して編集
              </div>
            )}
            
            {/* 折りたたみボタン */}
            <button
              onClick={() => setIsRightSidebarVisible(false)}
              className="absolute bottom-4 left-4 w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
              title="右サイドバーを閉じる"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* モバイル表示: Settings タブ (LP設定 + SNSメタ情報) */}
        <div className={`flex-col min-h-0 bg-slate-100/50 border-t border-slate-200 lg:hidden overflow-hidden flex ${
          mobileTab === 'settings' ? 'flex' : 'hidden'
        }`}>
          <div className="overflow-y-auto flex-1 min-h-0">
            {/* LP設定 + SNSメタ情報 */}
            <div className="px-3 py-3 border-b border-slate-200 space-y-3 bg-white/50">
              <h4 className="text-xs font-bold text-slate-700 tracking-wide">LP設定</h4>

              {/* スワイプ方向選択 */}
              <div className="space-y-2">
                <p className="text-sm text-slate-900 font-semibold">スワイプ方向</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="swipeDirectionMobile"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      checked={lpSettings.swipeDirection === 'vertical'}
                      onChange={() => setLpSettings((prev) => ({ ...prev, swipeDirection: 'vertical' }))}
                    />
                    <span className="text-sm text-slate-700">縦スクロール</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="swipeDirectionMobile"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      checked={lpSettings.swipeDirection === 'horizontal'}
                      onChange={() => setLpSettings((prev) => ({ ...prev, swipeDirection: 'horizontal' }))}
                    />
                    <span className="text-sm text-slate-700">横スワイプ</span>
                  </label>
                </div>
                <p className="text-xs text-slate-500">LPの閲覧方向を選択できます</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  checked={lpSettings.showSwipeHint}
                  onChange={(e) =>
                    setLpSettings((prev) => ({ ...prev, showSwipeHint: e.target.checked }))
                  }
                />
                <div>
                  <p className="text-sm text-slate-900 font-semibold">スワイプアニメーション</p>
                  <p className="text-xs text-slate-500">1枚目に指アイコンでスワイプを促します</p>
                </div>
              </label>
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-700 tracking-wide uppercase">商品・サービス連携</h5>
                  <p className="text-[11px] text-slate-500 mt-1">
                    CTAボタンで販売したい商品を選択できます。連携中は一次ボタンが自動で購入導線に切り替わります。
                  </p>
                </div>
                <select
                  value={linkedProduct?.id ?? 'none'}
                  onChange={(event) => handleChangeLinkedProduct(event.target.value)}
                  disabled={isProductLinkUpdating}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                >
                  <option value="none">連携しない</option>
                  {productOptions.map((option) => {
                    const isAssignedElsewhere = Boolean(option.lpId && option.lpId !== lpId);
                    return (
                      <option key={option.id} value={option.id} disabled={isAssignedElsewhere}>
                        {option.title}
                        {isAssignedElsewhere ? '（他LPで使用中）' : ''}
                      </option>
                    );
                  })}
                </select>
                {isProductLinkUpdating ? (
                  <p className="text-xs text-slate-500">商品連携を更新しています...</p>
                ) : null}
                {productLinkError ? (
                  <p className="text-xs text-red-600">{productLinkError}</p>
                ) : null}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{linkedProduct?.title ? `現在: ${linkedProduct.title}` : '現在未連携'}</span>
                  <Link href="/products/manage" className="text-blue-600 hover:text-blue-700 font-semibold">
                    商品を管理
                  </Link>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-700 tracking-wide uppercase">LP名</h5>
                  <p className="text-[11px] text-slate-500 mt-1">ダッシュボードに表示されるLP名を設定できます。</p>
                </div>
                <input
                  type="text"
                  value={lpTitle}
                  onChange={(e) => setLpTitle(e.target.value)}
                  placeholder="LP名（例：春の新商品キャンペーン）"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-700 tracking-wide uppercase">SNSメタ情報</h5>
                  <p className="text-[11px] text-slate-500 mt-1">LINEやSNSで共有した際のタイトル・説明・画像を指定できます。</p>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={metaSettings.title}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="OGPタイトル（例：〇〇講座 特設LP）"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                  />
                  <textarea
                    value={metaSettings.description}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="OGPディスクリプション（120文字程度の紹介文）"
                    rows={3}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <input
                    type="text"
                    value={metaSettings.imageUrl}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="OGP画像URL（1200x630推奨）"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                  />
                  <input
                    type="text"
                    value={metaSettings.siteName}
                    onChange={(e) => setMetaSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                    placeholder="サイト名（例：ABC情報局）"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                  />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  未入力の場合はD-swipeのデフォルト情報が使用されます。空欄にして保存するとリセットできます。
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* モバイル表示: 編集タブ（ブロック編集パネル） */}
        <div className={`flex-col min-h-0 bg-white lg:hidden overflow-hidden ${
          mobileTab === 'edit' ? 'flex' : 'hidden'
        }`}>
          <div className="flex-1 overflow-y-auto">
            {selectedBlockId ? (
            <PropertyPanel
              block={blocks.find(b => b.id === selectedBlockId) || null}
              onUpdateContent={handleUpdateSelectedBlock}
              onClose={handleClosePropertyPanel}
              onGenerateAI={handleGenerateAI}
              linkedProduct={linkedProduct}
              linkedSalon={linkedSalon}
            />
            ) : (
              <div className="p-6 text-center text-slate-500 text-sm font-medium">
                ブロックを選択すると編集内容が表示されます
              </div>
            )}
          </div>
        </div>
      </main>



      {/* テンプレート選択モーダル */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleAddTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {/* AI文章生成モーダル */}
      {showAIGenerator && aiGeneratorConfig && (
        <AITextGenerator
          type={aiGeneratorConfig.type}
          context={aiGeneratorConfig.context}
          onSelect={handleAITextSelect}
          onClose={() => {
            setShowAIGenerator(false);
            setAiGeneratorConfig(null);
          }}
        />
      )}

      {/* カラーテーマジェネレーターモーダル */}
      {showColorGenerator && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl my-8">
            <ColorThemeGenerator
              onApply={handleApplyTheme}
              onClose={() => setShowColorGenerator(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
