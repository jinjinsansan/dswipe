
import PreviewClient from './preview-client';

export const metadata = {
  title: 'Responsive Preview',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResponsivePreviewPage() {
  return <PreviewClient />;
}
