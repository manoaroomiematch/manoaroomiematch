[![ci-manoaroomiematch](https://github.com/manoaroomiematch/manoaroomiematch/actions/workflows/ci-manoaroomiematch.yml/badge.svg)](https://github.com/manoaroomiematch/manoaroomiematch/actions/workflows/ci-manoaroomiematch.yml)

For details, please see http://ics-software-engineering.github.io/nextjs-application-template/.

## AI Configuration

To enable a specific AI model for all clients (for example: Claude Haiku 4.5), this project uses a small config file and optional environment variables.

- `config/ai.json`: stores the default model and provider. Example:

```json
{
	"defaultModel": "claude-haiku-4.5",
	"provider": "anthropic"
}
```

- Environment overrides (safer for production):
	- `NEXT_PUBLIC_AI_MODEL` — override the default model id (e.g. "claude-haiku-4.5")
	- `NEXT_PUBLIC_AI_PROVIDER` — provider identifier (e.g. "anthropic")
	- `ANTHROPIC_API_KEY` — **required** if you make requests to Anthropic's API (keep secret)

How to enable Claude Haiku 4.5 for all clients:
1. Ensure `config/ai.json` has "claude-haiku-4.5" as the `defaultModel` or set `NEXT_PUBLIC_AI_MODEL=claude-haiku-4.5` in your environment.
2. Add your Anthropic key to the server environment as `ANTHROPIC_API_KEY` (never commit secrets to the repo).
3. Use `src/lib/aiClient.ts` to read the model/provider. This file centralizes the default model for all server code.

Notes:
- This repository does not automatically call external AI services. Any network requests to Anthropic/OpenAI should be implemented in a dedicated server API route that reads the secret `ANTHROPIC_API_KEY` from process.env.
- Always keep API keys out of the client bundle. Use server-side API routes to proxy requests where possible.
