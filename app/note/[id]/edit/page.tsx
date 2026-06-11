'use client';

/* Phase11: note.com型の統一エディタへ置換。
   classic(ブロック型)記事は NoteComposer 内でリッチへ自動変換される。
   旧実装(74KB)は git 履歴参照。 */

import { useParams } from 'next/navigation';
import NoteComposer from '@/components/note/NoteComposer';

export default function NoteEditPage() {
  const params = useParams();
  const noteId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  if (!noteId) {
    return null;
  }

  return <NoteComposer mode="edit" noteId={noteId} />;
}
