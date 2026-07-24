## Overview

This is a web application that answers questions about the 2026 FIFA World Cup. It uses a Retrieval-Augmented Generation (RAG) pipeline to ground GPT-4 responses in freshly scraped data from official sources, keeping answers accurate and up-to-date.

## Stack

Framework: Next.js (App Router) , React 
CSS: Tailwind CSS v4
Vector DB: DataStax Astra DB
AI: Vercel AI SDK, LangChain, OpenAI (gpt-4, text-embedding-3-small)
Scraping data: Puppeteer

## Workflow 

Ingestion — script/loadDb.ts

Puppeteer scrapes the official FIFA 2026 site (news, standings, stats, team pages) and Wikipedia. The HTML is stripped to plain text, split by LangChain's RecursiveCharacterTextSplitter into 512-character chunks with 100-character overlap to preserve context across boundaries, embedded via text-embedding-3-small (1536 dimensions), and stored in Astra DB alongside the source text.

Generation — app/api/chat/route.ts

The user's question is embedded with the same model, then used to query Astra DB for the 10 most similar chunks. Those chunks are injected into a system prompt instructing the model to treat them as authoritative context, and the assembled prompt goes to gpt-4. Responses stream back to the client in real time via the Vercel AI SDK.

## Demo

<img width="1531" height="960" alt="Screenshot 2026-07-19 at 1 26 52 PM" src="https://github.com/user-attachments/assets/601f088e-3995-4a21-bc3d-a796ecb9a408" />

<img width="1577" height="998" alt="Screenshot 2026-07-19 at 1 25 54 PM" src="https://github.com/user-attachments/assets/136bacb1-3cd4-4e51-a8c6-0228dd7f4a79" />

<img width="1533" height="978" alt="Screenshot 2026-07-19 at 1 25 13 PM" src="https://github.com/user-attachments/assets/cfd9c921-7b86-4242-baf2-28cc37155f22" />

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
