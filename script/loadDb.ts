import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer"
import OpenAI from "openai"

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"

/**
 * TypeScript type defining the similarity metrics supported by Astra DB.
 * dot_product  -> Fast and commonly used for normalized embeddings.
 * cosine       -> Measures angle between vectors (most common).
 * euclidean    -> Measures straight-line distance between vectors.
 */
type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

/** Read configuration values from the .env file.
 */
const { ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY } = process.env

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

/**
 * List of websites that will be scraped.
 *
 * Every page will be downloaded, cleaned, split into chunks,
 * embedded into vectors, and stored in Astra DB.
 */
const fifaWorldCupData = [
    'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup',
    'https://www.fifa.com',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026',
    'https://www.fifa.com/en/tournaments',
    'https://www.fifa.com/en/match-centre',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=US&wtw-filter=ALL',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/algeria/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/argentina/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/australia/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/austria/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/belgium/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/bosnia-and-herzegovina/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/brazil/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/cabo-verde/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/canada/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/colombia/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/congo-dr/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/cote-d-ivoire/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/croatia/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/curacao/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/czechia/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/ecuador/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/egypt/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/england/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/france/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/germany/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/ghana/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/haiti/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/ir-iran/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/iraq/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/japan/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/jordan/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/korea-republic/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/mexico/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/morocco/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/netherlands/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/new-zealand/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/norway/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/panama/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/paraguay/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/portugal/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/qatar/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/saudi-arabia/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/scotland/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/senegal/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/south-africa/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/spain/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/sweden/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/switzerland/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/tunisia/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/turkiye/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/uruguay/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/usa/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/uzbekistan/team-news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/news',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/power-rankings',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/statistics/player-statistics',
    'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/statistics/team-statistics?group=gct_attack&stat=goals&sort=desc',

]

/**
 * Create a DataAPI client using your Astra DB application token.
 */
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)

/** Connect to your Astra database.
 *
 * namespace is similar to a schema in SQL databases.
 */
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

/**
 * Configure the text splitter.
 *
 * chunkSize = maximum characters per chunk
 * chunkOverlap = number of overlapping characters
 * Why overlap?
 *  * Without overlap, important context can be split across two chunks.
 *  Overlap allows information near chunk boundaries
 *  to appear in both chunks.
 */
const spliter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

/**
 * Retries a flaky network call a few times with a short backoff.
 * Guards against transient errors (e.g. ETIMEDOUT) from OpenAI/Astra
 * so one bad request doesn't abort the whole ingestion run.
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> => {
    for (let attempt = 1; ; attempt++) {
        try {
            return await fn()
        } catch (err) {
            if (attempt >= retries) throw err
            console.log(`Retrying after error (attempt ${attempt}/${retries}):`, err.message)
            await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
        }
    }
}

/**
 * Creates the vector collection in Astra DB.
 *
 * A collection is similar to a table in SQL.
 *
 * The collection is configured to store vectors of length 1536,
 * which matches the output size of OpenAI's
 * text-embedding-3-small model.
 */
const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        checkExists: false,
        vector: {
            dimension: 1536,
            metric: similarityMetric
        }
    })
    console.log(res)
}

/**
 * Main ingestion pipeline.
 *
 * Steps:
 * 1. Connect to the collection.
 * 2. Visit every webpage.
 * 3. Scrape the webpage.
 * 4. Split into chunks.
 * 5. Generate embeddings.
 * 6. Store embeddings in Astra DB.
 */
const loadSampleData = async () => {

    // Get a reference to the collection.
    const collection = await db.collection(ASTRA_DB_COLLECTION)

    // Process every webpage.
    for await (const url of fifaWorldCupData) {

        // Download and clean webpage text.
        let content
        try {
            content = await scrapePage(url)
        } catch (err) {
            console.log(`Skipping ${url}, scrape failed:`, err.message)
            continue
        }

        // Split large text into smaller chunks.
        const chunks = await spliter.splitText(content)

        // Process every chunk individually.
        for await (const chunk of chunks) {

            /**
             * Generate an embedding using OpenAI.
             *
             * The embedding is a list of 1536 numbers
             * representing the semantic meaning of the text.
             */
            const embedding = await withRetry(() => openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            }))

            /**
             * Extract the embedding vector.
             */
            const vector = embedding.data[0].embedding


            /**
             * Insert into Astra DB.
             *
             * $vector:
             *      Used by Astra's vector search engine.
             *
             * text:
             *      Original chunk used later when answering questions.
             */
            const res = await withRetry(() => collection.insertOne({
                $vector: vector,
                text: chunk
            }))
            console.log(res)
        }
    }

}

/**
 * Downloads a webpage using Puppeteer.
 *
 * Puppeteer launches a headless Chrome browser,
 * loads the webpage, and extracts its HTML.
 */
const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "networkidle2",
            timeout: 60000
        },

        // Runs inside the browser after the page loads.
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }
    })

    /**
     * Remove HTML tags so only plain text remains.
     *
     * Example:
     *
     * <h1>Formula One</h1>
     *
     * becomes
     *
     * Formula One
     */
    return (await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}

/**
 * Start the ingestion pipeline.
 *
 * First create the collection,
 * then load and embed all webpages.
 */
createCollection().then(() => loadSampleData())
