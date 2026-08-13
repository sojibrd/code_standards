# Code Standard — AI Agent Rules

AI কোডিং এজেন্টের জন্য imperative নিয়মের সেট। এটা টিউটোরিয়াল নয়, style guide-ও নয়।
Formatting-এর দায়িত্ব Prettier/ESLint-এর — তাই সেটা এখানে ইচ্ছাকৃতভাবে রাখা হয়নি।

## কোন প্রজেক্টে কোন ফাইল

| প্রজেক্টের ধরন | যা load করতে হবে |
|---|---|
| যেকোনো frontend | `CORE.md` |
| Ember 6.x (GJS) | `CORE.md` + `ember/RULES.md` |
| React (framework ছাড়া) | `CORE.md` + `react/RULES.md` |
| Next.js App Router | `CORE.md` + `react/RULES.md` + `nextjs/RULES.md` |

Framework ফাইলগুলো CORE-এর নিয়ম পুনরাবৃত্তি করে না। CORE-এ যা আছে, তা সব জায়গায় প্রযোজ্য।

## ব্যবহারের নিয়ম

প্রাসঙ্গিক ফাইলগুলো `CLAUDE.md`, `.cursorrules`, `AGENTS.md` — বা আপনার এজেন্ট যা পড়ে
তাতে paste করুন। অথবা রেফারেন্স দিন:

```md
./code_standard/CORE.md এবং ./code_standard/ember/RULES.md এর নিয়ম মেনে চলো
```

## নিয়মের ফরম্যাট

প্রতিটা নিয়মে একটা শর্ত আর একটা নির্দেশ থাকে। যে লাইনটা বাস্তব কোডের বিপরীতে যাচাই
করা যায় না, সেটা এখানে থাকবে না। "Keep it simple" নিয়ম নয়। "একটা block বোঝাতে
comment লাগলে সেই block-টা আলাদা function হবে" — এটা নিয়ম।

## যে অনুমানগুলো ধরে নেওয়া হয়েছে

- Ember 6.x + GJS (`.gjs`, `<template>`) — classic `.hbs` জোড়া নয়
- React 19, Next.js 15 App Router — Pages Router নয়
- React/Next-এ TypeScript
