import { createExample } from "./actions";

const Example = () => {
  return <div>Example
    <form action={createExample}>
        <div>
            <label htmlFor="name">Name</label>
             <input type="text" name="name" />
        </div>
        <button type="submit">Create</button>
    </form>
  </div>;
};

export default Example;