import { getExample } from "../actions";

export async function ExampleList() {
    const examples = await getExample();
    return (
        <div>
            <h1>Examples</h1>
            <ul>
                {examples.map((example) => (
                    <li key={example.id}>{example.name}</li>
                ))}
            </ul>
        </div>
    );
}