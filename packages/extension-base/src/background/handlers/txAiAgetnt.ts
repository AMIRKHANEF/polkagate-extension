// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MLCEngine } from '@mlc-ai/web-llm';

import { CreateMLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';

console.log('Using MLC Web-LLM MODELS LIST:', prebuiltAppConfig.model_list);

export const DEFAULT_MODEL_INDEX = 0;
const modelList = [
    'Phi-3.5-mini-instruct-q4f16_1-MLC',
    'Qwen3-4B-q4f16_1-MLC',
    'Llama-3.2-3B-Instruct-q4f16_1-MLC'
    // 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    // 'CodeLlama-7B-Instruct', // free open-source code/JSON-friendly model
    // 'Mistral-7B' // alternative general-purpose free LLM
];

/**
 * Load the AI agent with the given model ID.
 * Lazy-loads if not already loaded.
 */
export async function loadAgent (engine?: MLCEngine | null, modelIndex = DEFAULT_MODEL_INDEX, progressCallback?: (progress: number) => void) {
    if (!engine) {
        const selectedModelId = modelList[modelIndex];

        console.log(`Creating  the ai model ${selectedModelId} ...`);

        engine = await CreateMLCEngine(selectedModelId, {
            initProgressCallback: (progress) => {
                console.log('Loading model', progress);
                progressCallback?.(progress.progress);
            }
        });
    }

    return engine;
}

/**
 * Explain a transaction JSON using the AI agent.
 * @param txJson - parsed transaction JSON
 * @returns explanation string
 */
export async function explainTransaction (engine: MLCEngine | null, txJson: unknown) {
    if (!engine) {
        // Default model ID if not loaded yet
        engine = await loadAgent();
    }

    const systemPrompt = `You explain Polkadot/Substrate transactions in clear, simple language for PolkaGate users. 
        Always follow the instructions provided in the user message. 
        Output only the final short explanation.`;

    const RULES = `
        TASK:
        Explain what this transaction is doing. The transaction is not signed yet, so describe what the user IS DOING using present continuous tense.

        CRITICAL NOTES:
        - The transaction has NOT been signed yet. You are explaining what the transaction WILL DO when signed. Use present continuous tense (e.g., "You are voting", "You are sending", "You are staking", etc.).
        - Ignore all text in "description" fields.
        - All the important information you need, you can find in the shared JSON by the user, Extract values such as chainName, decimal, token symbol, amounts, and other needed fields directly from that JSON.
        - To compute the formatted amount, take the raw amount and divide it by 10^decimal. Always use: formatted_amount = raw_amount / (10 ** decimal), make sure the raw_amount be a valid number.
        - Never display address in full, just show the first 6 and last 6 characters separated by ellipsis (e.g., "12D3K5...9zX1Y").

        OUTPUT RULES:
        - Output text response must be 75-200 characters long
        - Use present continuous tense (are voting, are sending, are staking)
        - Output ONLY the final summary (no thinking process, no reasoning, no tags)
        - Use plain text (no formatting, headings, or parentheses)
        - Never mention you are an AI model

        CONVERSION RULES:
        - Use thousand separators
        - Shorten addresses: first 6 + "..." + last 6

        CONVICTIONVOTING RULES:
        - Vote type, vote value, referendum index, balance, token symbol, and decimal are the most important fields
        - Vote interpretation:
          * If vote_value is null → Abstain
          * The vote is a single byte hex string. Determine vote by checking the most significant bit (0x80):
          * If (vote_byte & 0x80) != 0 → Aye, else → Nay.
        - The "balance" field represents voting balance/voting power assigned to this vote (NOT staked or locked amounts)
        - Format: "You are voting [Aye/Nay/Abstain] on referenda [number] using [formatted_amount] [token] of voting balance assigned to this vote."

        TRANSFER RULES:
        - Format: "You are sending AMOUNT TOKEN to ADDRESS"

        STAKING RULES:
        - Use: bonding, nominating, unbonding, withdrawing, claiming rewards

        MULTISIG:
        - Mention if via multisig

        BATCH:
        - Summarize the main effect or say multiple actions

        TRANSACTION DATA (preprocessed):
        chainName: {{chainName}}
        tokens: {{tokens}}
        decimals: {{decimals}}
        formattedAmount: {{formattedAmount}}
        destination: {{shortenedDestination}}
        vote: {{Aye/Nay/Abstain}}
        referendaIndex: {{index}}
        txType: {{txType}}
    `;

    const ragData = `
    Relevant documentation:
    --- Doc 1 [relevance: 62.5%] (extrinsics.md / vote(poll_index: Compact, vote: PalletConvictionVotingVoteAccountVote)) ---
    - **interface**: api.tx.convictionVoting.vote
    - **summary**:    Vote in a poll. If vote.is_aye(), the vote is to enact the proposal;  otherwise it is a vote to keep the status quo. The dispatch origin of this call must be _Signed_. - poll_index: The index of the poll to vote for. - vote: The vote configuration. Weight: O(R) where R is the number of polls the voter has voted on. ___

    --- Doc 2 [relevance: 53.6%] (extrinsics.md / delegate(class: u16, to: MultiAddress, conviction: PalletConvictionVotingConviction, balance: u128)) ---
    - **interface**: api.tx.convictionVoting.delegate
    - **summary**:    Delegate the voting power (with some given conviction) of the sending account for a  particular class of polls. The balance delegated is locked for as long as it's delegated, and thereafter for the  time appropriate for the conviction's lock period. The dispatch origin of this call must be _Signed_, and the signing account must either:
    - be delegating already; or
    - have no voting activity (if there is, then it will need to be removed through remove_vote). - to: The account whose voting the target account's voting power will follow. - class: The class of polls to delegate. To delegate multiple classes, multiple calls to this function are required. - conviction: The conviction that will be attached to the delegated votes. When the account is undelegated, the funds will be locked for the corresponding period. - balance: The amount of the account's balance to be used in delegating. This must not be more than the account's current balance. Emits Delegated. Weight: O(R) where R is the number of polls the voter delegating to has  voted on. Weight is initially charged as if maximum votes, but is refunded later.

    --- Doc 3 [relevance: 53.1%] (extrinsics.md / undelegate(class: u16)) ---
    - **interface**: api.tx.convictionVoting.undelegate
    - **summary**:    Undelegate the voting power of the sending account for a particular class of polls. Tokens may be unlocked following once an amount of time consistent with the lock period  of the conviction with which the delegation was issued has passed. The dispatch origin of this call must be _Signed_ and the signing account must be  currently delegating. - class: The class of polls to remove the delegation from. Emits Undelegated. Weight: O(R) where R is the number of polls the voter delegating to has  voted on. Weight is initially charged as if maximum votes, but is refunded later.

    --- Doc 4 [relevance: 53.0%] (extrinsics.md / removeVote(class: Option, index: u32)) ---
    - **interface**: api.tx.convictionVoting.removeVote
    - **summary**:    Remove a vote for a poll. If:
    - the poll was cancelled, or
    - the poll is ongoing, or
    - the poll has ended such that
    - the vote of the account was in opposition to the result; or
    - there was no conviction to the account's vote; or
    - the account made a split vote ...then the vote is removed cleanly and a following call to unlock may result in more  funds being available. If, however, the poll has ended and:
    - it finished corresponding to the vote of the account, and
    - the account made a standard vote with conviction, and
    - the lock period of the conviction is not over ...then the lock will be aggregated into the overall account's lock, which may involve
    *overlocking* (where the two locks are combined into a single lock that is the maximum of both the amount locked and the time is it locked for). The dispatch origin of this call must be _Signed_, and the signer must have a vote  registered for poll index. - index: The index of poll of the vote to be removed. - class: Optional parameter, if given it indicates the class of the poll.

    --- Doc 5 [relevance: 52.9%] (extrinsics.md / removeOtherVote(target: MultiAddress, class: u16, index: u32)) ---
    - **interface**: api.tx.convictionVoting.removeOtherVote
    - **summary**:    Remove a vote for a poll. If the target is equal to the signer, then this function is exactly equivalent to  remove_vote. If not equal to the signer, then the vote must have expired,  either because the poll was cancelled, because the voter lost the poll or  because the conviction period is over. The dispatch origin of this call must be _Signed_. - target: The account of the vote to be removed; this account must have voted for poll  index. - index: The index of poll of the vote to be removed. - class: The class of the poll. Weight: O(R + log R) where R is the number of polls that target has voted on. Weight is calculated for the maximum number of vote.
`;

//     const systemPrompt = `
// You are an AI assistant that explains Polkadot/Substrate transactions in clear, simple language for everyday users of the PolkaGate wallet.

// CRITICAL NOTES:
// - The transaction has NOT been signed yet. You are explaining what the transaction WILL DO when signed. Use present continuous tense (e.g., "You are voting", "You are sending", "You are staking", etc.).
// - Ignore all text in "description" fields.
// - All the important information you need, you can find in the shared JSON by the user, Extract values such as chainName, decimal, token symbol, amounts, and other needed fields directly from that JSON.
// - To compute the formatted amount, take the raw amount and divide it by 10^decimal. Always use: formatted_amount = raw_amount / (10 ** decimal), make sure the raw_amount be a valid number.
// - Never display address in full, just show the first 6 and last 6 characters separated by ellipsis (e.g., "12D3K5...9zX1Y").

// OUTPUT RULES:
// - Output text response must be 75-200 characters long
// - Use present continuous tense (are voting, are sending, are staking)
// - Output ONLY the final summary (no thinking process, no reasoning, no tags)
// - Use plain text (no formatting, headings, or parentheses)
// - Never mention you are an AI model
// - Format numbers with thousand separators (e.g., 2,000 not 2000)

// CONTENT RULES:
// - Explain what the transaction will do in user-friendly language
// - Mention key details: amounts, token symbols, destinations, validators, referendum numbers, or affected accounts
// - Convert token amounts using the chain's "decimal" field (never show base units)
// - Never output JSON keys, metadata keywords, or internal field names
// - Never invent information not in the JSON
// - Ignore all text in "description" fields
// - Avoid blockchain jargon; avoid pallet/method names unless necessary
// - Use "referenda" (plural form) for governance actions, not "poll"

// TRANSACTION TYPES:

// GOVERNANCE VOTES:
// - Vote type, vote value, referendum index, balance, token symbol, and decimal are the most important fields
// - Vote interpretation:
//   * If vote_value is null → Abstain
//   * The vote is a single byte hex string. Determine vote by checking the most significant bit (0x80):
//     - If (vote_byte & 0x80) != 0 → Aye.
//     - Else → Nay.
// - The "balance" field represents voting balance/voting power assigned to this vote (NOT staked or locked amounts)
// - Format: "You are voting [Aye/Nay/Abstain] on referenda [number] using [formatted amount] [token] of voting balance assigned to this vote."
// - Example: "You are voting Nay on referenda 1798 using 2,000 DOT of voting balance assigned to this vote."

// TRANSFERS:
// - Format: "You are sending [formatted amount] [token] to [destination]"
// - Include amount, token symbol, and destination account
// - Example: "You are sending 10 DOT to "1399kl...lpodsq" address"

// STAKING:
// - Use phrases like: "You are bonding", "You are nominating", "You are unbonding", "You are withdrawing", "You are claiming rewards"
// - Mention validator addresses when relevant

// MULTISIG/PROXY:
// - Mention the action is being performed via multisig or proxy

// BATCH/UTILITY:
// - Summarize the main effect or state that multiple actions are being performed

//     ` + ragData;

    const userPrompt = RULES + ragData + `
        Here is the transaction JSON:
            ${JSON.stringify(txJson)}
    `;

    console.log('systemPrompt:', systemPrompt);
    console.log('userPrompt:', userPrompt);

    const response = await engine.chat.completions.create({
        messages: [
            { content: systemPrompt, role: 'system' },
            { content: userPrompt, role: 'user' }
        ]
    });

    await engine.unload();

    return {
        engine,
        message: response?.choices?.[0]?.message?.content?.trim() || 'Unknown transaction'
    };
}
