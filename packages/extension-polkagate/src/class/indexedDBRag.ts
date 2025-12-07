// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

async function loadSqlJs () {
    try {
        // dynamic browser-safe load — no fs, no node polyfills
        const SQL = await window.initSqlJs({
            locateFile: (file: string) => `/sqljs/${file}`
        });

        return SQL;
    } catch (error) {
        console.error('Failed to load sql.js:', error);
        throw error;
    }
}

const GITHUB_VECTOR_STORE_URL =
    'https://raw.githubusercontent.com/AMIRKHANEF/polkagate-extension/ai/rag-data/vector_store.db';

interface VectorStoreItem {
    id: string;
    source: string;
    header: string | null;
    text: string;
    metadata: any;
    embedding: number[];
}

class RAGManager {
    private db: any = null; // SQLite DB instance
    private sql: any = null; // sql.js module
    private cache: VectorStoreItem[] | null = null;
    private initialized = false;

    async initialize (forceRefresh = false) {
        if (this.initialized && !forceRefresh) {
            return;
        }

        console.log('🔄 Initializing SQLite RAG...');

        // Load sql.js
        this.sql = await loadSqlJs();

        // Download the .db file
        const response = await fetch(GITHUB_VECTOR_STORE_URL);

        if (!response.ok) {
            throw new Error('Failed to download DB');
        }

        const buffer = await response.arrayBuffer();

        // Load SQLite database
        this.db = new this.sql.Database(new Uint8Array(buffer));
        this.cache = this.loadAllVectors();

        this.initialized = true;
        console.log(`✅ Loaded ${this.cache.length} vectors from SQLite`);
    }

    /**
     * Read all vectors from SQLite table
     */
    private loadAllVectors (): VectorStoreItem[] {
        const stmt = this.db.prepare('SELECT * FROM vectors');
        const rows: VectorStoreItem[] = [];

        console.log('Loading vectors from SQLite...', stmt);

        while (stmt.step()) {
            const row = stmt.getAsObject();

            // Safe parsing
            const embedding = row.vec_json && row.vec_json !== 'undefined'
                ? JSON.parse(row.vec_json)
                : [];

            const metadata = row.metadata_json && row.metadata_json !== 'undefined'
                ? JSON.parse(row.metadata_json)
                : {};

            rows.push({
                embedding,
                id: row.id,
                source: row.source,
                header: row.header,
                text: row.text,
                metadata
            });
        }

        return rows;
    }

    /**
     * Get all vectors (cached)
     */
    async getVectors () {
        if (!this.initialized) {
            await this.initialize();
        }

        return this.cache!;
    }

    /**
     * Query RAG using a user-supplied JSON string that describes a transaction.
     * The string may contain single quotes or be wrapped in quotes.
     * This function extracts (section, method) and performs keyword search.
    */
    queryFromTxString (rawInput: string, topK = 5) {
        if (!this.initialized) {
            throw new Error('RAGManager not initialized. Call initialize() first.');
        }

        // Clean wrapper quotes
        const cleaned = rawInput.trim().replace(/^'+|'+$/g, '');

        let tx: any = null;

        try {
            tx = JSON.parse(cleaned);
        } catch (err) {
            console.error('❌ Invalid JSON:', err);

            return [];
        }

        console.log('Parsed transaction for RAG query:', tx);

        // 1. Extract pallet + method
        const pallet = tx.section?.toLowerCase?.() || '';
        const method = tx.method?.toLowerCase?.() || '';

        // 2. Extract argument names
        const args = [];

        if (Array.isArray(tx.extra)) {
            for (const obj of tx.extra) {
                args.push(...Object.keys(obj));
            }
        }

        const argSet = new Set(args.map((a) => a.toLowerCase()));

        const scored = this.cache!.map((item) => {
            const text = item.text.toLowerCase();
            const header = item.header?.toLowerCase() ?? '';

            let score = 0;

            // A. Perfect match with api interface
            if (text.includes(`api.tx.${pallet}.${method}`)) {
                score += 100;
            }

            // B. Method name appears in header
            if (header.includes(method)) {
                score += 20;
            }

            // C. Argument matching
            for (const arg of argSet) {
                if (text.includes(arg)) {
                    score += 5;
                }
            }

            // D. Weak keyword scoring
            const weakKeywordScore = keywordScore(item, pallet, method);

            score += weakKeywordScore * 0.1;

            return { ...item, score };
        });

        return scored
            .filter((r) => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
}

function keywordScore (item: VectorStoreItem, pallet: string, method: string) {
    let score = 0;

    const txt = (item.text + item.header).toLowerCase();

    if (item.metadata.pallets.includes(pallet)) {
        score += 0.5;
    }

    if (item.metadata.methods.includes(method)) {
        score += 0.3;
    }

    if (txt.includes(pallet)) {
        score += 0.2;
    }

    if (txt.includes(method)) {
        score += 0.1;
    }

    return score;
}

export const ragManager = new RAGManager();
