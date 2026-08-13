# React নিয়ম — React 19, TypeScript

`CORE.md`-এর সাথে load করতে হবে। Next.js প্রজেক্টে `nextjs/RULES.md`-ও।

## Hooks

- Hook শর্তহীনভাবে top level-এ চলবে। Condition, loop বা early return-এর পরে
  কোনো hook নয়।
- Custom hook `use` দিয়ে শুরু হবে, আর extract হবে শুধু তখনই যখন logic *পুনঃব্যবহৃত*
  হয় বা component সত্যিই অপাঠ্য — ফাইল ছোট করার জন্য নয়।
- Dependency array সম্পূর্ণ থাকবে। Linter কোনো dependency চাইলে হয় যোগ করো, নয়তো
  design ঠিক করো। Disable comment দিয়ে rule চুপ করাবে না।

## useEffect — কখন ব্যবহার করবে না

বেশিরভাগ `useEffect` আসলে বাগ। এগুলোর জন্য effect ব্যবহার করবে না:

- **Render-এর জন্য data রূপান্তর** → render-এর সময় হিসাব করো, মেপে ধীর প্রমাণ
  হলে `useMemo`।
- **Prop বদলালে state reset** → `key` দিয়ে remount করাও, বা derive করো।
- **User event সামলানো** → event handler-এই করো।
- **Data fetch** → framework-এর data layer ব্যবহার করো (Next.js server component,
  বা কোনো query library)। Effect-এর ভেতরে হাতে করা fetch race তৈরি করে আর
  StrictMode-এ দুবার চলে।
- **দুটো state sync করা** → দুটোর একটার অস্তিত্বই থাকা উচিত নয়।

Effect React-এর *বাইরের* কিছুর সাথে sync করার জন্য: subscription, DOM measurement,
timer, third-party widget, browser API। প্রতিটা effect cleanup function return করবে।

## State

- Colocate করো। যে component ব্যবহার করে সেখানেই state ঘোষণা করো; দ্বিতীয় consumer
  এলে তবেই উপরে তোলো।
- Derived value কখনো state-এ রাখবে না। যে `totalState` আপডেট করার কথা মনে রাখতে হয়,
  তার চেয়ে render-এ `const total = items.reduce(...)` ভালো।
- যে field-গুলো সবসময় একসাথে বদলায় সেগুলো এক object বা `useReducer` হবে — চারটা
  আলাদা `useState` নয়।
- State কখনো mutate করবে না। `items.push(next)` নয়, `setItems([...items, next])`।
- Server data `useState`-এ রাখার জিনিস নয়। Query library বা server component ব্যবহার
  করো; `useState` + `useEffect` দিয়ে fetch করাই বাসি data আর race condition-এর
  সবচেয়ে বড় উৎস।

## Context

- Context কম-পরিবর্তনশীল, বহু জায়গায় পড়া মানের জন্য: theme, locale, auth identity।
- ঘনঘন বদলানো state context-এ রাখবে না — প্রতিটা consumer re-render হয়। দরকার হলে
  stable-value context আর dispatch context আলাদা করো।
- Context কোনো state manager নয়। Provider-এর স্তূপ দিয়ে অ্যাপের store বানাবে না।
- ৩টার কম component যে context পড়ে, সেটা আসলে prop হওয়ার কথা ছিল।

## Rendering ও performance

- মাপার আগে optimize করবে না। React 19-এর compiler বেশিরভাগ memoization সামলায়;
  profiler-এর তথ্য ছাড়া হাতে করা `useMemo`/`useCallback` শুধুই noise।
- `memo`/`useMemo` শুধু দুই ক্ষেত্রে: সময় মেপে প্রমাণিত ব্যয়বহুল হিসাব, অথবা
  memoized child বা effect dependency-তে যাওয়া reference।
- `key` হবে data থেকে আসা stable identity (`item.id`)। যে list-এ reorder, filter বা
  delete হয় সেখানে কখনো array index নয়।
- এক component-এর body-র ভেতরে আরেকটা component define করবে না — প্রতি render-এ
  সেটা remount হয়।

## Component

- Component UI return করে। Data shaping, formatting আর business rule component-এর
  বাইরের function-এ বা domain module-এ থাকবে।
- Prop-ই interface: অর্থবহ নাম দাও (`flag` নয়, `isDisabled`), আর boolean-এর
  স্তূপ এড়াও — ৪+ boolean মানে একটা `variant` union type।
- অজানা prop DOM element-এ spread (`{...props}`) করবে না — ইচ্ছাকৃত low-level
  primitive ছাড়া।
- Layout-এর জন্য configuration prop-এর বদলে composition (`children`, slot) ব্যবহার করো।

## TypeScript

- `any` নয়। `unknown` ব্যবহার করে narrow করো। `as` cast-এর সাথে কারণ লেখা comment লাগবে।
- Prop-এর জন্য স্পষ্ট interface/type লেখো; `React.FC` থেকে infer করবে না।
- অসম্ভব state-কে type দিয়ে বাদ দাও: তিনটা আলাদা boolean-এর চেয়ে discriminated
  union ভালো —
  `{ status: 'loading' } | { status: 'error'; error: Error } | { status: 'ok'; data: T }`।

## Form ও event

- Controlled input-এ value *আর* onChange দুটোই লাগবে। Handler ছাড়া controlled
  input কখনো নয়।
- হাতে লেখা `if`-এর সারির বদলে schema (Zod বা সমতুল্য) দিয়ে validate করো, এবং সেটা
  server-এর সাথে ভাগ করো।
- User-এর কারণে হওয়া network call debounce করো আর বাসি হয়ে যাওয়াগুলো cancel করো
  (`AbortController`)।

## Testing

- React Testing Library। Role আর accessible name দিয়ে query করো; `getByTestId`
  একদম শেষ উপায়।
- Rendered output আর user-visible behavior-এ assert করো, কখনো state বা prop-এ নয়।
- `fireEvent`-এর বদলে `userEvent`। হাতে করা wait-এর বদলে `findBy*`।
