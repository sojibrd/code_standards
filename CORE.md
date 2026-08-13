# CORE — Framework-নিরপেক্ষ নিয়ম

Framework যাই হোক, প্রতিটা frontend প্রজেক্টে প্রযোজ্য।

## Naming

- নাম দাও জিনিসটা *কী* বা কী *return* করে তা দিয়ে — কীভাবে কাজ করে তা দিয়ে নয়।
  `filteredArr` নয়, `activeUsers`।
- Boolean নাম একটা দাবির মতো পড়তে হবে: `isLoading`, `hasAccess`, `canEdit`।
  কখনো `flag`, `status2`, `check` নয়।
- যে function effect ঘটায় তার নাম verb দিয়ে শুরু (`saveDraft`); যে function value
  return করে তার নাম সেই value-র নামে (`draftPayload`)।
- কোডবেসে আগে থেকে চালু নেই এমন সংক্ষিপ্ত রূপ ব্যবহার করবে না। নতুন ভালো নাম
  বানানোর চেয়ে বিদ্যমান নামের সাথে মিল রাখা জরুরি।
- `data`, `info`, `item`, `obj`, `temp`, `handleThing` — জিনিসটা সত্যিই generic না
  হলে এই নামগুলো ব্যবহার করবে না।

## আকার ও গঠন

- একটা function একটাই কাজ করবে। ভেতরের কোনো block বোঝাতে comment লাগলে সেই
  block-টা আলাদা function হবে।
- ৩ স্তরের বেশি nesting মানে extract করো বা শর্ত উল্টে দাও। Early return ব্যবহার করো।
- ৪টার বেশি positional parameter মানে একটা object pass করো।
- ~৩০০ লাইনের বেশি ফাইল একটা রিভিউ-সংকেত, ভুল নয়। দুটো স্পষ্ট দায়িত্ব তৈরি হলে
  ভাগ করো — লাইন সংখ্যা পেরোলেই নয়।

## State

- State থাকবে সবচেয়ে নিচের যে স্তরে সেটা দরকার, সেখানে। দ্বিতীয় consumer এলে
  তবেই উপরে তোলো — আগেভাগে অনুমান করে নয়।
- Derive করো, duplicate করো না। বিদ্যমান state থেকে যে মান হিসাব করা যায়, সেটা
  হিসাব করো। যে দুটো field একসাথে আপডেট করতেই হয়, সেটা ভবিষ্যতের বাগ।
- নির্দিষ্ট store/service স্তরের বাইরে কোনো global mutable state নয়।
- Server data আর UI state আলাদা জিনিস। "dropdown খোলা আছে কিনা" আর fetch করা data
  এক জায়গায় রাখবে না।

## Async ও error

- প্রতিটা `await` একটা failure point। হয় handle করো, নয়তো এমন boundary পর্যন্ত
  যেতে দাও যেটা handle করে — কখনো খালি `catch`-এ গিলে ফেলবে না।
- `catch (e) {}` আর `.catch(() => {})` নিষিদ্ধ। কোনো error সত্যিই উপেক্ষণীয় হলে
  এক লাইনে কারণটা comment-এ লেখো।
- Log করে এগিয়ে যাওয়া error handling নয়। Logging মানে recovery নয়।
- যে operation fail করতে পারে, তার UI-তে তিনটা state লাগবে: loading, error, empty।
  শুধু success নয়।
- Race condition: কোনো request পরেরটা দিয়ে বাতিল হতে পারলে (search-as-you-type,
  route পরিবর্তন) — বাসি response cancel করো বা guard দাও।

## Abstraction

- দুবার হওয়া কাকতালীয়, তিনবার হওয়া pattern। দ্বিতীয়বারেই abstraction বানাবে না।
- ভুল abstraction-এর চেয়ে duplication ভালো। ভুল abstraction সরাতে যা খরচ,
  duplication রাখতে তার চেয়ে কম খরচ।
- প্রতিটা abstraction যত কোড যোগ করে, তার চেয়ে বেশি কোড সরাতে হবে। যে wrapper
  শুধু argument forward করে, সেটা মুছে দাও।
- একটামাত্র caller আছে এমন configuration option রাখবে না। Inline করো।

## Dependency ও boundary

- Module-এর নির্ভরতা নিচের দিকে যাবে: UI → domain logic → data access। উল্টো নয়।
- Component/template-এ business logic থাকবে না। Component render করে; pricing,
  permission বা validity নিয়ে সিদ্ধান্ত নেয় না।
- Module-এর public entry point থেকে import করো, ভেতরের ফাইল থেকে নয়।
- ~৩০ লাইনের কম কাজের জন্য third-party dependency যোগ করা লোকসান।

## Comment

- *কেন* লেখো, *কী* নয়। কোড নিজেই বলে দেয় কী হচ্ছে।
- যে comment নিচের লাইনটাই আবার বলে, সেটা মুছে দাও।
- অস্পষ্ট সিদ্ধান্ত ডকুমেন্ট করো: workaround, ordering constraint, স্বাভাবিক
  সমাধানটা কেন কাজ করেনি। ticket থাকলে link দাও।
- কোড বদলালে comment আপডেট করো বা মুছে দাও। বাসি comment না-থাকার চেয়েও খারাপ।

## Dead code

- Comment করে রাখা কোড মুছে দাও। Version control-ই আর্কাইভ।
- ফাইলে হাত দিলে অব্যবহৃত export, prop, param আর branch মুছে দাও।
- Owner আর ticket ছাড়া কোনো `TODO` নয়। নয়তো এখনই ঠিক করো, নাহলে বাদ দাও।

## Test

- Public interface দিয়ে behavior test করো, ভেতরের গঠন দিয়ে নয়। Refactor করলে
  test ভাঙা চলবে না।
- প্রতিটা bug fix-এর সাথে এমন test যেটা fix-এর আগে fail করত।
- Test-এর নামে প্রত্যাশা লেখা থাকবে: `renders empty state when list is empty`,
  `test list` নয়।
- Feature সরিয়ে দিলেও pass করে — এমন test রাখবে না।

## Security

- অবিশ্বস্ত input কখনো HTML-এ interpolate করবে না। Framework-এর escaping ব্যবহার
  করো; raw-HTML escape hatch শুধু sanitized input-এ, আর কেন ব্যবহার করলে তা
  comment-এ লিখে।
- Client কোডে বা repo-তে কোনো secret, token বা key নয়। Browser-এ যা যায়, তা public।
- Validation server-এ হবে। Client validation শুধু UX, কখনো enforcement নয়।
- User-এর PII, token বা পুরো request body log করবে না।
