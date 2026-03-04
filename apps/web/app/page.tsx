import Example from "./example/Example";
import { ExampleList } from "./example/components/ExampleList";


export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <Example />
      <ExampleList />
    </>
  );
}
