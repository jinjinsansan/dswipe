'use client';

import React, { useState, useMemo } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  generateShadesFromHex,
  hexToRgb,
  rgbToHex,
  type ColorShades,
} from '@/lib/colorGenerator';

interface ColorThemeGeneratorProps {
  onApply?: (shades: ColorShades, hex: string) => void;
  onClose?: () => void;
}

const SHADE_KEYS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export default function ColorThemeGenerator({
  onApply,
  onClose,
}: ColorThemeGeneratorProps) {
  const [hex, setHex] = useState('#DC2626'); // デフォルトは urgent_red
  const [copiedShade, setCopiedShade] = useState<number | null>(null);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const shades = useMemo(() => generateShadesFromHex(hex), [hex]);

  const handleCopyColor = (shade: number) => {
    navigator.clipboard.writeText(shades[shade as keyof ColorShades]);
    setCopiedShade(shade);
    setTimeout(() => setCopiedShade(null), 1500);
  };

  const handleApply = () => {
    onApply?.(shades, hex);
    onClose?.();
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 space-y-6 max-w-2xl">
      <div>
        <h3 className="text-white font-bold mb-4">🎨 テーマカラージェネレーター</h3>
        <p className="text-gray-400 text-sm mb-6">
          ベースカラーを選択すると、Tailwind CSS互換の11段階シェードが自動生成されます
        </p>
      </div>

      {/* Color Picker */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-300">
          ベースカラーを選択
        </label>
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <HexColorPicker color={hex} onChange={setHex} />
          </div>
          <div className="flex-1 space-y-3">
            {/* RGB 入力 */}
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
              <div>
                <label className="text-xs text-gray-400">R</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => {
                    const newRgb = { ...rgb, r: parseInt(e.target.value) || 0 };
                    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                  }}
                  className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">G</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => {
                    const newRgb = { ...rgb, g: parseInt(e.target.value) || 0 };
                    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                  }}
                  className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">B</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => {
                    const newRgb = { ...rgb, b: parseInt(e.target.value) || 0 };
                    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                  }}
                  className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm"
                />
              </div>
            </div>

            {/* HEX 表示 */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <label className="text-xs text-gray-400">HEX</label>
              <input
                type="text"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Color Shades Preview */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          生成されたシェード（クリックでコピー）
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SHADE_KEYS.map((shade) => (
            <button
              key={shade}
              onClick={() => handleCopyColor(shade)}
              className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div
                className="w-12 h-12 rounded border border-gray-600 group-hover:border-white transition-colors"
                style={{ backgroundColor: shades[shade] }}
              />
              <span className="text-xs font-semibold text-gray-300">{shade}</span>
              <span className="text-[10px] text-gray-500 font-mono">
                {copiedShade === shade ? '✓ コピー' : shades[shade]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">CSS Variables</h4>
        <div className="bg-gray-800/50 rounded-lg p-3 max-h-40 overflow-y-auto">
          <pre className="text-[10px] sm:text-xs text-gray-400 font-mono">
            {`:root {
${SHADE_KEYS
  .map((shade) => `  --primary-${shade}: ${shades[shade as keyof ColorShades]};`)
  .join('\n')}
}`}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          このテーマを適用
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
