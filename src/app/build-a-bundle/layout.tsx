import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Build a Bundle | TPS Plant Food',
  description: 'Create your custom bundle of 3 plant foods and save $10! Mix and match your favorites.',
};

export default function BuildABundleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 