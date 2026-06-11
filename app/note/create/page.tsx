'use client';

/* Phase11: note.com型の統一エディタへ置換。
   旧実装(classic/note二者択一+70KBの重複実装)は git 履歴参照。 */

import NoteComposer from '@/components/note/NoteComposer';

export default function NoteCreatePage() {
  return <NoteComposer mode="create" />;
}
