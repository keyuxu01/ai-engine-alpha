import Example from './example/Example';
import { ExampleList } from './example/components/ExampleList';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <Example />
      <ExampleList />
      <Link href="/user">User</Link>
    </>
  );
}
