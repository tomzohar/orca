
import { unstable_v2_createSession } from '@anthropic-ai/claude-agent-sdk';

async function main() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let instruction = process.env.AGENT_INSTRUCTION;

    // Inject Feedback Capability
    instruction += `\n\nIMPORTANT: If you need clarification from the user, or if you are stuck and need human assistance, USE THE tool named "AskUserQuestion".\nSchema: { questions: [{ question: string, options?: { label: string, description?: string }[] }] }.\nDo not just ask in text, USE THE TOOL.`;

    if (!apiKey) {
        console.error('Missing ANTHROPIC_API_KEY');
        process.exit(1);
    }

    if (!instruction) {
        console.error('Missing AGENT_INSTRUCTION');
        process.exit(1);
    }

    console.log('Initializing Claude Agent Session...');

    try {
        const session = unstable_v2_createSession({
            model: 'claude-sonnet-4-5-20250929',
            allowedTools: ['Write', 'Read', 'Bash', 'Glob', 'Grep', 'Ls', 'Edit', 'AskUserQuestion']
        });

        // console.log(`[Agent] Stats: Session ID ${session.sessionId}`); // Session ID not available yet 
        console.log(`[System] Sending instruction: ${instruction}`);

        await session.send(instruction);

        for await (const message of session.stream()) {
            logMessage(message);
        }

    } catch (error) {
        console.error('[Agent] Session Failed:', error);
        process.exit(1);
    }
}

function logMessage(message: any) {
    switch (message.type) {
        case 'stream_event':
            const event = message.event;
            // Text Deltas
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                process.stdout.write(event.delta.text);
            }
            // Tool Use (Start)
            else if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
                console.log(`\n[Agent] 🛠️  Tool Use: ${event.content_block.name}`);
            }
            // Tool Input (Delta) - Optional: could recreate full input if needed, but might be noisy
            break;

        case 'assistant':
            // Log full messages since stream_event deltas might not be arriving
            const contents = message.message?.content || [];

            for (const content of contents) {
                if (content.type === 'text') {
                    console.log(`[Agent] ${content.text}`);
                } else if (content.type === 'tool_use') {
                    console.log(`[Agent] 🛠️  Tool Use (${content.name}): ${JSON.stringify(content.input)}`);
                }
            }
            break;

        case 'result':
            console.log('\n[Agent] Task Completed.');
            if (message.is_error) {
                console.error(`[Agent] ❌ Error: ${message.errors?.join(', ') || 'Unknown Error'}`);
                process.exit(1);
            } else {
                console.log(`[Agent] ✅ Result: ${message.result}`);
                process.exit(0);
            }
            break;

        case 'user':
        case 'tool_use_summary':
        case 'system':
            // Ignore internal/debug messages
            break;

        default:
            console.log(`[Agent] DEBUG: Unhandled message type: ${message.type}`);
            break;
    }
}

main();
