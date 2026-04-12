import { loadAllSchematics } from '@/lib/loadSchematics';
import HomeClient from '@/components/HomeClient';

export default function Home() {
  const schematics = loadAllSchematics();

  return <HomeClient schematics={schematics} />;
}
