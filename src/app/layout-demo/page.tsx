import { loadAllSchematics } from '@/lib/loadSchematics';
import LayoutDemoClient from '@/components/LayoutDemoClient';

export default function LayoutDemoPage() {
  const schematics = loadAllSchematics();

  return <LayoutDemoClient schematics={schematics} />;
}
