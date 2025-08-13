<div align="center">

![logo](src/img/logo-min.webp)

# AIClient-2-API 🚀

**一个能将多种大模型 API（Gemini, OpenAI, Claude...）统一封装为本地 OpenAI 兼容接口的强大代理。**

</div>

<div align="center">

<a href="https://deepwiki.com/justlovemaki/AIClient-2-API"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"  style="width: 134px; height: 23px;margin-bottom: 3px;"></a>

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-≥20.0.0-green.svg)](https://nodejs.org/)
[![docker](https://img.shields.io/badge/docker-≥20.0.0-green.svg)](https://aiproxy.justlikemaki.vip/zh/docs/installation/docker-deployment.html)


[**中文**](./README.md) | [**English**](./README-EN.md) | [**更详细文档**](https://aiproxy.justlikemaki.vip/)

</div>

> `AIClient2API` 是一个多功能、轻量化的 API 代理，旨在提供极致的灵活性和易用性。它通过一个 Node.js HTTP 服务器，将 Google Gemini CLI 授权登录、OpenAI、Claude、Kiro 等多种后端 API 统一转换为标准的 OpenAI 格式接口。项目采用现代化的模块化架构，支持策略模式和适配器模式，具备完整的测试覆盖和健康检查机制，开箱即用，`npm install` 后即可直接运行。您只需在配置文件中轻松切换模型服务商，就能让任何兼容 OpenAI 的客户端或应用，通过同一个 API 地址，无缝地使用不同的大模型能力，彻底摆脱为不同服务维护多套配置和处理接口不兼容问题的烦恼。

---

## 💡 核心优势

*   ✅ **多模型统一接入**：一个接口，通吃 Gemini、OpenAI、Claude、Kimi K2、GLM-4.5 等多种最新模型。通过简单的启动参数或请求头，即可在不同模型服务商之间自由切换。
*   ✅ **突破官方限制**：通过支持 Gemini CLI 的 OAuth 授权方式，有效绕过官方免费 API 的速率和配额限制，让您享受更高的请求额度和使用频率。
*   ✅ **突破客户端限制**：Kiro API 模式下支持免费使用Claude Sonnet 4 模型。
*   ✅ **无缝兼容 OpenAI**：提供与 OpenAI API 完全兼容的接口，让您现有的工具链和客户端（如 LobeChat, NextChat 等）可以零成本接入所有支持的模型。
*   ✅ **增强的可控性**：通过强大的日志功能，可以捕获并记录所有请求的提示词（Prompts），便于审计、调试和构建私有数据集。
*   ✅ **极易扩展**：得益于全新的模块化和策略模式设计，添加一个新的模型服务商变得前所未有的简单。
*   ✅ **完整测试覆盖**：提供全面的集成测试和单元测试，确保各个API端点和功能的稳定性和可靠性。

---

## 🎨 模型协议与提供商关系图


- OpenAI 协议 (P_OPENAI): 支持所有 MODEL_PROVIDER，包括 openai-custom、gemini-cli-oauth、claude-custom 和
claude-kiro-oauth。
- Claude 协议 (P_CLAUDE): 支持 claude-custom、claude-kiro-oauth 和 gemini-cli-oauth。
- Gemini 协议 (P_GEMINI): 支持 gemini-cli-oauth。


  ```mermaid
  
   graph TD
       subgraph Core_Protocols["核心协议"]
           P_OPENAI[OpenAI Protocol]
           P_GEMINI[Gemini Protocol]
           P_CLAUDE[Claude Protocol]
       end
   
       subgraph Supported_Model_Providers["支持的模型提供商"]
           MP_OPENAI[openai-custom]
           MP_GEMINI[gemini-cli-oauth]
           MP_CLAUDE_C[claude-custom]
           MP_CLAUDE_K[claude-kiro-oauth]
       end
   
       P_OPENAI ---|支持| MP_OPENAI
       P_OPENAI ---|支持| MP_GEMINI
       P_OPENAI ---|支持| MP_CLAUDE_C
       P_OPENAI ---|支持| MP_CLAUDE_K
   
       P_GEMINI ---|支持| MP_GEMINI
   
       P_CLAUDE ---|支持| MP_CLAUDE_C
       P_CLAUDE ---|支持| MP_CLAUDE_K
       P_CLAUDE ---|支持| MP_GEMINI
   
       style P_OPENAI fill:#f9f,stroke:#333,stroke-width:2px
       style P_GEMINI fill:#ccf,stroke:#333,stroke-width:2px
       style P_CLAUDE fill:#cfc,stroke:#333,stroke-width:2px

  ```

---

## 🔧 使用说明

*   **MCP 支持**: 虽然原版 Gemini CLI 的内置命令功能不可用，但本项目完美支持 MCP (Model Context Protocol)，可配合支持 MCP 的客户端实现更强大的功能扩展。
*   **多模态能力**: 支持图片、文档等多模态输入，为您提供更丰富的交互体验。
*   **最新模型支持**: 支持最新的 **Kimi K2** 和 **GLM-4.5** 模型，只需在 `config.json` 中配置相应的 OpenAI 或 Claude 兼容接口即可使用。
*   **Kiro API**: 使用 Kiro API 需要[下载kiro客户端](https://aibook.ren/archives/kiro-install)并完成授权登录生成 kiro-auth-token.json。**推荐配合 Claude Code 使用以获得最佳体验**。注意：新注册的用户，如果使用时报**429**，表示**已不可使用** Kiro 的服务，可能需要等Kiro完全开放注册后，才能使用。

---


## 💻 代理设置

> **提示**: 如果您在无法直接访问 Google/OpenAI/Claude/Kiro 服务的环境中使用，请先为您的终端设置 HTTP代理，不要设置 HTTPS代理。

### 不同终端环境下的 HTTP 代理设置命令

为了确保 `AIClient2API` 能够正常访问外部 AI 服务（如 Google、OpenAI、Claude、Kiro 等），您可能需要在您的终端环境中设置 HTTP 代理。以下是针对不同操作系统的代理设置命令：

#### Linux / macOS
```bash
export HTTP_PROXY="http://your_proxy_address:port"
# 如果代理需要认证
# export HTTP_PROXY="http://username:password@your_proxy_address:port"
```
要使这些设置永久生效，您可以将它们添加到您的 shell 配置文件中（例如 `~/.bashrc`, `~/.zshrc` 或 `~/.profile`）。

#### Windows (CMD)
```cmd
set HTTP_PROXY=http://your_proxy_address:port
:: 如果代理需要认证
:: set HTTP_PROXY=http://username:password@your_proxy_address:port
```
这些设置只对当前 CMD 会话有效。如需永久设置，您可以通过系统环境变量进行配置。

#### Windows (PowerShell)
```powershell
$env:HTTP_PROXY="http://your_proxy_address:port"
# 如果代理需要认证
# $env:HTTP_PROXY="http://username:password@your_proxy_address:port"
```
这些设置只对当前 PowerShell 会话有效。如需永久设置，您可以将它们添加到您的 PowerShell 配置文件中 (`$PROFILE`) 或通过系统环境变量进行配置。

**请务必将 `your_proxy_address` 和 `port` 替换为您的实际代理地址和端口。**

---

## 🌟 特殊用法与进阶技巧

*   **🔌 对接任意 OpenAI 客户端**: 这是本项目的基本功能。将任何支持 OpenAI 的应用（如 LobeChat, NextChat, VS Code 插件等）的 API 地址指向本服务 (`http://localhost:3000`)，即可无缝使用所有已配置的模型。

*   **🔍 中心化请求监控与审计**: 在 `config.json` 中设置 `"PROMPT_LOG_MODE": "file"` 来捕获所有请求和响应，并保存到本地日志文件。这对于分析、调试和优化提示词，甚至构建私有数据集都至关重要。

*   **💡 动态系统提示词**:
    *   通过在 `config.json` 中设置 `SYSTEM_PROMPT_FILE_PATH` 和 `SYSTEM_PROMPT_MODE`，您可以更灵活地控制系统提示词的行为。
    *   **支持的模式**:
        *   `override`: 完全忽略客户端的系统提示词，强制使用文件中的内容。
        *   `append`: 在客户端系统提示词的末尾追加文件中的内容，实现规则的补充。
    *   这使得您可以为不同的客户端设置统一的基础指令，同时允许单个应用进行个性化扩展。

*   **🛠️ 作为二次开发基石**:
    *   **添加新模型**: 只需在 `src` 目录下创建一个新的提供商目录，实现 `ApiServiceAdapter` 接口和相应的策略，然后在 `adapter.js` 和 `common.js` 中注册即可。
    *   **响应缓存**: 对高频重复问题添加缓存逻辑，降低 API 调用，提升响应速度。
    *   **自定义内容过滤**: 在请求发送或返回前增加关键词过滤或内容审查逻辑，满足合规要求。

---

---

## 🔌 OpenRouter 使用指南

本项目已内置对 OpenRouter 的支持，作为 OpenAI 协议的上游通道使用。推荐通过本代理进行调用，方便统一鉴权、日志与多提供商切换。

### 启动（OpenRouter 模式）

必需参数：`--model-provider openai-openrouter`、`--openrouter-api-key`、`--openrouter-base-url`（默认 `https://openrouter.ai/api/v1` 可省略）。

```bash
node src/api-server.js \
  --host 0.0.0.0 --port 3000 \
  --api-key 123456 \
  --model-provider openai-openrouter \
  --openrouter-api-key sk-or-v1-你的OpenRouterKey \
  --openrouter-base-url https://openrouter.ai/api/v1
```

可选（推荐）的来源标识头，将由代理自动转发到上游：

```bash
  --openrouter-referer https://github.com/yourname/yourrepo \
  --openrouter-title "AIClient Proxy"
```

注意：`--openrouter-referer` 与 `--openrouter-title` 必须为 ASCII（不能包含中文或空格），referer 必须是完整 URL，否则 Node 会报错 “Invalid character in header content”。

### 通过本代理调用（OpenAI 兼容）

- 非流式：
```bash
curl -s http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer 123456" \
  -H "Content-Type: application/json" \
  -H "model-provider: openai-openrouter" \
  -d '{
    "model": "deepseek/deepseek-chat-v3-0324:free",
    "messages": [{"role": "user", "content": "你好，2+2=？"}]
  }'
```

- Python SDK（将 base_url 指向本地代理）：
```python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:3000/v1", api_key="123456")
resp = client.chat.completions.create(
    model="deepseek/deepseek-chat-v3-0324:free",
    messages=[{"role":"user","content":"What is the meaning of life?"}]
)
print(resp.choices[0].message.content)
```

### 列出可用模型

```bash
curl -s http://localhost:3000/v1/models \
  -H "Authorization: Bearer 123456" \
  -H "model-provider: openai-openrouter"
```

模型 ID 需使用 OpenRouter 目录中的命名（如 `deepseek/deepseek-chat-v3-0324:free`）。

### 固定默认模型（仅在 OpenRouter 模式生效）

新增参数：
- `--default-model <modelId>`：默认模型 ID（如 `deepseek/deepseek-chat-v3-0324:free`）
- `--default-model-mode <fallback|force>`：
  - fallback：仅当请求未指定 `model` 时使用默认模型
  - force：即使请求指定了 `model`，也强制改为默认模型

示例：
```bash
node src/api-server.js \
  --host 0.0.0.0 --port 3000 \
  --api-key 123456 \
  --model-provider openai-openrouter \
  --openrouter-api-key sk-or-v1-你的OpenRouterKey \
  --openrouter-base-url https://openrouter.ai/api/v1 \
  --default-model deepseek/deepseek-chat-v3-0324:free \
  --default-model-mode force
```

> 提示：若启动时已设置 `--model-provider openai-openrouter`，客户端可省略 `model-provider` 请求头。

---

## 📄 开源许可

本项目遵循 [**GNU General Public License v3 (GPLv3)**](https://www.gnu.org/licenses/gpl-3.0) 开源许可。详情请查看根目录下的 `LICENSE` 文件。

## 🙏 致谢

本项目的开发受到了官方 Google Gemini CLI 的极大启发，并参考了Cline 3.18.0 版本 `gemini-cli.ts` 的部分代码实现。在此对 Google 官方团队和 Cline 开发团队的卓越工作表示衷心的感谢！

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=justlovemaki/AIClient-2-API&type=Timeline)](https://www.star-history.com/#justlovemaki/AIClient-2-API&Timeline)

---

## ⚠️ 免责声明

### 使用风险提示
本项目（AIClient-2-API）仅供学习和研究使用。用户在使用本项目时，应自行承担所有风险。作者不对因使用本项目而导致的任何直接、间接或 consequential 损失承担责任。

### 第三方服务责任说明
本项目是一个API代理工具，不提供任何AI模型服务。所有AI模型服务由相应的第三方提供商（如Google、OpenAI、Anthropic等）提供。用户在使用本项目访问这些第三方服务时，应遵守各第三方服务的使用条款和政策。作者不对第三方服务的可用性、质量、安全性或合法性承担责任。

### 数据隐私说明
本项目在本地运行，不会收集或上传用户的任何数据。但用户在使用本项目时，应注意保护自己的API密钥和其他敏感信息。建议用户定期检查和更新自己的API密钥，并避免在不安全的网络环境中使用本项目。

### 法律合规提醒
用户在使用本项目时，应遵守所在国家/地区的法律法规。严禁将本项目用于任何非法用途。如因用户违反法律法规而导致的任何后果，由用户自行承担全部责任。
