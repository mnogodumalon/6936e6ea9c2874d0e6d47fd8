import asyncio
import json
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, AssistantMessage, ToolUseBlock, TextBlock, ResultMessage, create_sdk_mcp_server, tool
import subprocess
import os

async def main():
    # 1. Metadaten lesen
    try:
        with open("/home/user/app/CLAUDE.md", "r") as f:
            instructions = f.read()
    except:
        print("Kein CLAUDE.md")

    def run_git_cmd(cmd: str):
        """Executes a Git command and throws an error on failure"""
        print(f"[DEPLOY] Executing: {cmd}")
        result = subprocess.run(
            cmd,
            shell=True,
            cwd="/home/user/app",
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            raise Exception(f"Git Error ({cmd}): {result.stderr}")
        return result.stdout

    @tool("deploy_to_github",
    "Initializes Git, commits EVERYTHING, and pushes it to the configured repository. Use this ONLY at the very end.",
    {})
    async def deploy_to_github(args):
        try:
            run_git_cmd("git config --global user.email 'lilo@livinglogic.de'")
            run_git_cmd("git config --global user.name 'Lilo'")

            run_git_cmd("git init")
            run_git_cmd("git checkout -b main")
            run_git_cmd("git add .")
            run_git_cmd("git commit -m 'Lilo Auto-Deploy' --allow-empty")
            run_git_cmd(f"git remote add origin {os.getenv('GIT_PUSH_URL')}")
            run_git_cmd("git push -u origin main")

            return {
                "content": [{"type": "text", "text": "✅ Deployment erfolgreich! Code wurde gepusht."}]
            }

        except Exception as e:
            return {"content": [{"type": "text", "text": f"Deployment Failed: {str(e)}"}], "is_error": True}

    deployment_server = create_sdk_mcp_server(
        name="deployment",
        version="1.0.0",
        tools=[deploy_to_github]
    )

    # 3. Optionen konfigurieren
    options = ClaudeAgentOptions(
        system_prompt={
            "type": "preset",
            "preset": "claude_code",
            "append": instructions
        },
        mcp_servers={"deploy_tools": deployment_server},
        permission_mode="acceptEdits",
        allowed_tools=["Bash", "Write", "Read", "Edit", "Glob", "Grep", "Task", "TodoWrite",
        "mcp__deploy_tools__deploy_to_github"
        ],
        cwd="/home/user/app",
        model="claude-sonnet-4-5-20250929",
    )

    print(f"[LILO] Initialisiere Client")

    # 4. Der Client Lifecycle
    async with ClaudeSDKClient(options=options) as client:
        
        # Anfrage senden
        await client.query("Baue das Dashboard")

        # 5. Antwort-Schleife
        # receive_response() liefert alles bis zum Ende des Auftrags
        async for message in client.receive_response():
            
            # A. Wenn er denkt oder spricht
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        #als JSON-Zeile ausgeben
                        print(json.dumps({"type": "think", "content": block.text}), flush=True)
                    
                    elif isinstance(block, ToolUseBlock):
                        print(json.dumps({"type": "tool", "tool": block.name, "input": str(block.input)}), flush=True)

            # B. Wenn er fertig ist (oder Fehler)
            elif isinstance(message, ResultMessage):
                status = "success" if not message.is_error else "error"
                print(json.dumps({"type": "result", "status": status, "cost": message.total_cost_usd}), flush=True)

if __name__ == "__main__":
    asyncio.run(main())