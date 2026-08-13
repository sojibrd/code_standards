# Next.js নিয়ম — Next 15, App Router

`CORE.md` আর `react/RULES.md`-এর সাথে load করতে হবে।

## Server বনাম Client boundary

- Server Component-ই default। `'use client'` তখনই দেবে যখন component-এর state,
  effect, event handler বা browser API দরকার।
- `'use client'` যত গভীরে সম্ভব ঠেলে দাও। Page-এর উপরে বসানো একটা `'use client'`
  পুরো subtree-কে client bundle বানিয়ে দেয়।
- Server Component, Client Component render করতে পারে। Client Component, Server
  Component import করতে পারে না — `children` বা prop হিসেবে pass করো।
- Server থেকে client-এ যাওয়া prop serializable হতে হবে। Function, class instance,
  `Date`-এর method, বা serializer যা সামলায় না এমন `Map`/`Set` নয়।
- Client-এ পৌঁছাতে পারে এমন ফাইলে server-only module (DB client, secret, `fs`)
  import করবে না। ওগুলো `server-only` package দিয়ে চিহ্নিত করো।

## Data fetching

- Server Component-এ `await` দিয়ে fetch করো। যে data server-এ আনা যায়, তার জন্য
  client-এর `useEffect`-এ fetch করবে না।
- যেখানে data ব্যবহার হয় সেখানেই fetch করো, page-এর root-এ এনে drill করে নয়।
  এক render-এর ভেতরে একই request React নিজেই dedupe করে।
- পরস্পর-নিরপেক্ষ fetch `Promise.all` দিয়ে parallel করো। একে অপরের ওপর নির্ভর করে
  না এমন পরপর `await` একটা waterfall।
- পুরো page আটকে না রেখে ধীর, স্বাধীন অংশগুলো অর্থবহ fallback সহ `<Suspense>`-এ মোড়ো।
- যে route segment fetch করে, তার `loading.tsx` আর `error.tsx` থাকবে।
  `error.tsx` অবশ্যই Client Component হবে এবং `reset()` দেবে।

## Caching

- Caching নিয়ে স্পষ্ট থাকো। Fetch-এর জায়গাতেই উদ্দেশ্য লেখো: per-request data-র
  জন্য `cache: 'no-store'`, সময়ভিত্তিক হলে `next: { revalidate: N }`, চাহিদামাফিক
  হলে `next: { tags: [...] }`।
- Default-এর ওপর নির্ভর করবে না — Next-এর সংস্করণে সংস্করণে এগুলো বদলেছে, আর
  "data বাসি কেন" প্রশ্নের সবচেয়ে বড় কারণ এটাই।
- Mutation-এর পরে invalidate করো: `revalidateTag` বা `revalidatePath`। যে Server
  Action লেখে কিন্তু invalidate করে না, সে বাসি UI রেখে যায়।
- `cookies()`, `headers()` বা `searchParams` পড়লে route dynamic rendering-এ চলে যায়।
  কখন সেটা করছো, জেনে করো।

## Server Action

- Function বা ফাইলের শুরুতে `'use server'` দাও।
- Server Action একটা public HTTP endpoint। প্রতিটা action-এর ভেতরে authenticate ও
  authorize করো — caller তোমারই UI, এটা ধরে নেবে না।
- প্রতিটা input schema দিয়ে validate করো। Client-side validation enforcement নয়।
- Action mutate করে, তারপর revalidate বা redirect করে। পড়ার জন্য এটা কোনো সাধারণ
  RPC স্তর নয় — পড়া হবে Server Component-এ।
- Serializable ফল return করো, আর error client boundary-তে ছুঁড়ে না দিয়ে returned
  state হিসেবে দেখাও।

## Routing ও গঠন

- Colocate করো: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` আর route-এর
  নিজস্ব component route ফোল্ডারেই থাকবে। Route নয় এমন private ফোল্ডারে `_` prefix।
- Layout তার child-দের মধ্যে navigate করলে re-render হয় না। তাই per-page state বা
  per-page data fetching layout-এ রাখবে না।
- URL না বদলে সংগঠনের জন্য Route Group `(name)` ব্যবহার করো।
- `route.ts` handler বাইরের consumer আর webhook-এর জন্য। নিজের UI-এর mutation-এ
  Server Action, আর নিজের UI-এর read-এ Server Component।

## Metadata, asset, performance

- প্রতিটা page থেকে `metadata` বা `generateMetadata` export করো। Title আর
  description ছাড়া কোনো page ship হবে না।
- ছবির জন্য `next/image`, font-এর জন্য `next/font`। দুটোই layout shift ঠেকায়;
  সাধারণ `<img>` আর CDN font link ঠেকায় না।
- ভেতরের navigation-এ `next/link` — কখনো `<a href>` বা click handler-এ
  `router.push` দিয়ে সাধারণ link বানাবে না।
- Client Component-এ module scope-এ ভারী client library import করবে না; সেটা
  browser-only বা fold-এর নিচে হলে `next/dynamic` + `ssr: false` ব্যবহার করো।

## Environment ও secret

- শুধু `NEXT_PUBLIC_*` variable browser-এ যায়। বাকি সব server-only — "কাজ করানোর
  জন্য" কোনো secret-এ এই prefix বসাবে না।
- এক module-এ startup-এ environment variable validate করো, আর সারা কোডবেসে
  `process.env` না পড়ে সেই module থেকে import করো।
