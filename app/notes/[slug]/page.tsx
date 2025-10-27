import NoteDetailClient from '@/components/note/NoteDetailClient';

type NoteDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 sm:py-20">
      <NoteDetailClient slug={slug} />
    </main>
  );
}
