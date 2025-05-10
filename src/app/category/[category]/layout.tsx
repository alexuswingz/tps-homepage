export async function generateStaticParams() {
  return [
    { category: 'houseplants' },
    { category: 'garden-plants' },
    { category: 'hydro-aquatic' }
  ];
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 