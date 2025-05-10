export async function generateStaticParams() {
  return [
    { handle: 'monstera-plant-food' },
    { handle: 'fiddle-leaf-fig-plant-food' },
    { handle: 'snake-plant-fertilizer' },
    { handle: 'pothos-fertilizer' },
    { handle: 'zz-plant-fertilizer' },
    { handle: 'peace-lily-fertilizer' },
    { handle: 'orchid-plant-food' },
    { handle: 'succulent-plant-food' },
    { handle: 'cactus-fertilizer' },
    { handle: 'bonsai-fertilizer' }
  ];
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 