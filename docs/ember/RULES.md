# Ember নিয়ম — Ember 6.x, GJS

`CORE.md`-এর সাথে load করতে হবে। এটা `.gjs` / `.gts` + `<template>` ধরে লেখা,
classic `.hbs` জোড়া নয়।

## Reactivity

- `@tracked` শুধু *source* state-এর জন্য। অন্য tracked state থেকে যা হিসাব করা যায়
  সেটা getter হবে — কখনো sync রাখা দ্বিতীয় `@tracked` নয়।
- Array বা object in place mutate করে re-render আশা করবে না। পুনরায় assign করো:
  `this.items = [...this.items, next]`। Tracked array-তে `push`/`splice` notify করে না।
- Getter-এর ভেতরে tracked property পড়াই dependency তৈরি করে। যে getter কোনো
  tracked কিছু পড়ে না, সেটা কখনো recompute হয় না।
- Render চলাকালে tracked state set করবে না। Getter, template expression বা
  `modifier`-এর body-তে set করলে backtracking assertion আসবে।
- গভীরে nested object tracked নয়। উপরের reference track করে পুনরায় assign করো,
  অথবা `tracked-built-ins`-এর `TrackedObject`/`TrackedArray` ব্যবহার করো।

## Component state-এর মালিকানা

- Component শুধু সেই state-এর মালিক যেটা component-এর সাথেই শেষ হয় (open/closed,
  focus, draft input)। যা component-এর পরেও টেকে বা sibling পড়ে — সেটা service-এ।
- এক component-এ ৩টার বেশি `@tracked` field মানে state-টা অন্য কোথাও থাকা উচিত —
  একটা service-এ, বা ছোট component-এ।
- Argument-এ কখনো লিখবে না (`this.args.x = ...`)। Argument একমুখী। উপরের দিকে
  action pass করো।
- `{{#if}}`-ভারী template নয়। তিন বা তার বেশি top-level branch মানে আলাদা
  component-এ ভাগ করো।

## Service

- Service অ্যাপের পুরো আয়ুষ্কালের singleton। Logout বা route ছাড়ার সময় স্পষ্ট
  reset ছাড়া এতে per-route বা per-session data রাখবে না।
- Service domain state আর logic ধরে রাখে। এটা component, DOM বা `document`-কে
  reference করে না।
- `@service` দিয়ে inject করো; module scope-এ কিছু destructure করবে না —
  injection instantiation-এর সময় resolve হয়।
- এক service, এক দায়িত্ব। `app-state` / `misc` / `utils` service একটা smell;
  domain-এর নামে নাম দাও (`cart`, `session`, `notifications`)।

## Data: Ember Data বনাম raw fetch

- Ember Data ব্যবহার করো যখন resource-এর identity, relationship আছে এবং সেটা
  edit হয়। এর cache আর dirty tracking-ই আসল কারণ।
- শুধু-পড়া, relation-বিহীন, একবারের payload-এর জন্য (config, search result,
  analytics) service-এর ভেতরে সাধারণ `fetch`। এগুলোকে জোর করে model বানাবে না।
- মিশিয়ে ফেলবে না: একটা resource হয় Ember Data model, নয় plain object — দুটো নয়।
- Component-এর constructor বা getter-এ fetch করবে না। Fetch হবে route-এর `model`
  hook-এ, অথবা action/resource-style helper থেকে ডাকা service method-এ।
- Server-এ করা যায় এমন filtering-এর জন্য `store.findAll` ডাকবে না।

## Routing

- `model()` route-এর দরকারি সবকিছু resolve করে return করবে। template-স্তরে loading
  state দেখানোর ইচ্ছা না থাকলে object-এর ভেতরে unresolved promise return করবে না।
- URL-নির্ভর data route-এর `model`-এ; একাধিক route জুড়ে থাকা data service-এ।
- Route-স্তরের fetch-এ per-component spinner-এর বদলে `error` ও `loading` substate
  ব্যবহার করো।
- যে query param data বদলায়, তাতে refetch হতে হবে — হাতে করে re-query না করে
  স্পষ্টভাবে `refreshModel: true` দাও।

## Lifecycle ও teardown

- Ember-এর মালিকানার বাইরে register করা সবকিছু teardown করতে হবে: event listener,
  interval, observer, subscription, third-party instance।
- Modifier ও class-এ `@ember/destroyable`-এর `registerDestructor` ব্যবহার করো।
  আধুনিক কোডে শুধু `willDestroy`-এর ওপর নির্ভর করবে না।
- Async continuation guard করো: `await`-এর পরে state set করার আগে
  `isDestroyed`/`isDestroying` যাচাই করো।
- DOM side effect-এর মালিক modifier। নিজের DOM ছোঁয়ার জন্য component থেকে
  `document.querySelector` ব্যবহার করবে না।

## GJS গঠন

- এক ফাইলে এক component, `default` হিসেবে export। এর private helper একই ফাইলে
  রাখো; দ্বিতীয় ফাইলের দরকার হলেই কেবল export করো।
- Component, helper আর modifier স্পষ্টভাবে import করো। `.gjs`-এ global resolution-এর
  ওপর নির্ভর করবে না।
- `<template>` ফাইলের শেষে, class-এর পরে রাখো। Signature type (`.gts`) class-এর
  ঠিক উপরে।
- State ছাড়া template-only component সরাসরি `<template>` export হবে — এর জন্য
  class বানাবে না।
- Template-এ বারবার হিসাব না করে পুনরাবৃত্ত expression-এর জন্য `{{#let}}` ব্যবহার করো।

## Testing

- Component-এ unit test-এর চেয়ে rendering test ভালো। User যা দেখে তার ওপর assert
  করো, `this.element.querySelector('.internal-class')`-এর ওপর নয়।
- `@ember/test-helpers` ব্যবহার করো (`render`, `click`, `settled`)। অপেক্ষার জন্য
  কখনো `setTimeout` নয় — `await settled()`।
- Network boundary-তে mock করো (Mirage/MSW), service stub করে নয় — যদি না
  service-এর consumer-ই test-এর বিষয় হয়।
