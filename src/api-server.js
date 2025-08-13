/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * 描述 / Description:
 * (最终生产就绪版本 / Final Production Ready Version)
 * 此脚本创建一个独立的 Node.js HTTP 服务器，作为 Google Cloud Code Assist API 的本地代理。
 * 此版本包含所有功能和错误修复，设计为健壮、灵活且易于通过全面可控的日志系统进行监控。
 * 
 * This script creates a standalone Node.js HTTP server that acts as a local proxy for the Google Cloud Code Assist API.
 * This version includes all features and bug fixes, designed to be robust, flexible, and easy to monitor through a comprehensive and controllable logging system.
 *
 * 主要功能 / Key Features:
 * - OpenAI & Gemini & Claude 多重兼容性：无缝桥接使用 OpenAI API 格式的客户端与 Google Gemini API。支持原生 Gemini API (`/v1beta`) 和 OpenAI 兼容 (`/v1`) 端点。
 *   OpenAI & Gemini & Claude Dual Compatibility: Seamlessly bridges clients using the OpenAI API format with the Google Gemini API. Supports both native Gemini API (`/v1beta`) and OpenAI-compatible (`/v1`) endpoints.
 * 
 * - 强大的身份验证管理：支持多种身份验证方法，包括通过 Base64 字符串、文件路径或自动发现本地凭据的 OAuth 2.0 配置。能够自动刷新过期令牌以确保服务持续运行。
 *   Robust Authentication Management: Supports multiple authentication methods, including OAuth 2.0 configuration via Base64 strings, file paths, or automatic discovery of local credentials. Capable of automatically refreshing expired tokens to ensure continuous service operation.
 * 
 * - 灵活的 API 密钥验证：支持三种 API 密钥验证方法：`Authorization: Bearer <key>` 请求头、`x-goog-api-key` 请求头和 `?key=` URL 查询参数，可通过 `--api-key` 启动参数配置。
 *   Flexible API Key Validation: Supports three API key validation methods: `Authorization: Bearer <key>` request header, `x-goog-api-key` request header, and `?key=` URL query parameter, configurable via the `--api-key` startup parameter.
 * 
 * - 动态系统提示管理 / Dynamic System Prompt Management:
 *   - 文件注入：通过 `--system-prompt-file` 从外部文件加载系统提示，并通过 `--system-prompt-mode` 控制其行为（覆盖或追加）。
 *     File Injection: Loads system prompts from external files via `--system-prompt-file` and controls their behavior (overwrite or append) with `--system-prompt-mode`.
 *   - 实时同步：能够将请求中包含的系统提示实时写入 `fetch_system_prompt.txt` 文件，便于开发者观察和调试。
 *     Real-time Synchronization: Capable of writing system prompts included in requests to the `fetch_system_prompt.txt` file in real-time, facilitating developer observation and debugging.
 * 
 * - 智能请求转换和修复：自动将 OpenAI 格式的请求转换为 Gemini 格式，包括角色映射（`assistant` -> `model`）、合并来自同一角色的连续消息以及修复缺失的 `role` 字段。
 *   Intelligent Request Conversion and Repair: Automatically converts OpenAI-formatted requests to Gemini format, including role mapping (`assistant` -> `model`), merging consecutive messages from the same role, and fixing missing `role` fields.
 * 
 * - 全面可控的日志系统：提供两种日志模式（控制台或文件），详细记录每个请求的输入和输出、剩余令牌有效性等信息，用于监控和调试。
 *   Comprehensive and Controllable Logging System: Provides two logging modes (console or file), detailing input and output of each request, remaining token validity, and other information for monitoring and debugging.
 * 
 * - 高度可配置的启动：支持通过命令行参数配置服务监听地址、端口、项目 ID、API 密钥和日志模式。
 *   Highly Configurable Startup: Supports configuring service listening address, port, project ID, API key, and logging mode via command-line parameters.
 *
 * 使用示例 / Usage Examples:
 * 
 * 基本用法 / Basic Usage:
 * node src/api-server.js
 * 
 * 服务器配置 / Server Configuration:
 * node src/api-server.js --host 0.0.0.0 --port 8080 --api-key your-secret-key
 * 
 * OpenAI 提供商 / OpenAI Provider:
 * node src/api-server.js --model-provider openai-custom --openai-api-key sk-xxx --openai-base-url https://api.openai.com/v1
 * 
 * Claude 提供商 / Claude Provider:
 * node src/api-server.js --model-provider claude-custom --claude-api-key sk-ant-xxx --claude-base-url https://api.anthropic.com
 * 
 * Gemini 提供商（使用 Base64 凭据的 OAuth）/ Gemini Provider (OAuth with Base64 credentials):
 * node src/api-server.js --model-provider gemini-cli --gemini-oauth-creds-base64 eyJ0eXBlIjoi... --project-id your-project-id
 * 
 * Gemini 提供商（使用凭据文件的 OAuth）/ Gemini Provider (OAuth with credentials file):
 * node src/api-server.js --model-provider gemini-cli --gemini-oauth-creds-file /path/to/credentials.json --project-id your-project-id
 * 
 * 系统提示管理 / System Prompt Management:
 * node src/api-server.js --system-prompt-file custom-prompt.txt --system-prompt-mode append
 * 
 * 日志配置 / Logging Configuration:
 * node src/api-server.js --log-prompts console
 * node src/api-server.js --log-prompts file --prompt-log-base-name my-logs
 * 
 * 完整示例 / Complete Example:
 * node src/api-server.js \
 *   --host 0.0.0.0 \
 *   --port 3000 \
 *   --api-key my-secret-key \
 *   --model-provider gemini-cli \
 *   --project-id my-gcp-project \
 *   --gemini-oauth-creds-file ./credentials.json \
 *   --system-prompt-file ./custom-system-prompt.txt \
 *   --system-prompt-mode overwrite \
 *   --log-prompts file \
 *   --prompt-log-base-name api-logs
 * 
 * 命令行参数 / Command Line Parameters:
 * --host <address>                    服务器监听地址 / Server listening address (default: localhost)
 * --port <number>                     服务器监听端口 / Server listening port (default: 3000)
 * --api-key <key>                     身份验证所需的 API 密钥 / Required API key for authentication (default: 123456)
 * --model-provider <provider>         AI 模型提供商 / AI model provider: openai-custom, claude-custom, gemini-cli, kiro-api
 * --openai-api-key <key>             OpenAI API 密钥 / OpenAI API key (for openai-custom provider)
 * --openai-base-url <url>            OpenAI API 基础 URL / OpenAI API base URL (for openai-custom provider)
 * --claude-api-key <key>             Claude API 密钥 / Claude API key (for claude-custom provider)
 * --claude-base-url <url>            Claude API 基础 URL / Claude API base URL (for claude-custom provider)
 * --gemini-oauth-creds-base64 <b64>  Gemini OAuth 凭据的 Base64 字符串 / Gemini OAuth credentials as Base64 string
 * --gemini-oauth-creds-file <path>   Gemini OAuth 凭据 JSON 文件路径 / Path to Gemini OAuth credentials JSON file
 * --kiro-oauth-creds-base64 <b64>    Kiro OAuth 凭据的 Base64 字符串 / Kiro OAuth credentials as Base64 string
 * --kiro-oauth-creds-file <path>     Kiro OAuth 凭据 JSON 文件路径 / Path to Kiro OAuth credentials JSON file
 * --project-id <id>                  Google Cloud 项目 ID / Google Cloud Project ID (for gemini-cli provider)
 * --system-prompt-file <path>        系统提示文件路径 / Path to system prompt file (default: input_system_prompt.txt)
 * --system-prompt-mode <mode>        系统提示模式 / System prompt mode: overwrite or append (default: overwrite)
 * --log-prompts <mode>               提示日志模式 / Prompt logging mode: console, file, or none (default: none)
 * --prompt-log-base-name <name>      提示日志文件基础名称 / Base name for prompt log files (default: prompt_log)
 * --request-max-retries <number>     API 请求失败时，自动重试的最大次数。 / Max retries for API requests on failure (default: 3)
 * --request-base-delay <number>      自动重试之间的基础延迟时间（毫秒）。每次重试后延迟会增加。 / Base delay in milliseconds between retries, increases with each retry (default: 1000)
 * --cron-near-minutes <number>       OAuth 令牌刷新任务计划的间隔时间（分钟）。 / Interval for OAuth token refresh task in minutes (default: 15)
 * --cron-refresh-token <boolean>     是否开启 OAuth 令牌自动刷新任务 / Whether to enable automatic OAuth token refresh task (default: true)
 *
 */



import * as http from 'http'
import * as fs from 'fs' // Import fs module
import { promises as pfs } from 'fs'
import 'dotenv/config' // Import dotenv and configure it

import deepmerge from 'deepmerge'
import { getServiceAdapter, serviceInstances } from './adapter.js'
import {
    INPUT_SYSTEM_PROMPT_FILE,
    API_ACTIONS,
    MODEL_PROVIDER,
    ENDPOINT_TYPE,
    isAuthorized,
    handleModelListRequest,
    handleContentGenerationRequest,
    handleError,
} from './common.js'

let CONFIG = {} // Make CONFIG exportable
let PROMPT_LOG_FILENAME = '' // Make PROMPT_LOG_FILENAME exportable

/**
 * Initializes the server configuration from config.json and command-line arguments.
 * @param {string[]} args - Command-line arguments.
 * @param {string} [configFilePath='config.json'] - Path to the configuration file.
 * @returns {Object} The initialized configuration object.
 */
async function initializeConfig (args = process.argv.slice(2), configFilePath = 'config.json') {
    let currentConfig = {}

    try {
        const configData = fs.readFileSync(configFilePath, 'utf8')
        currentConfig = JSON.parse(configData)
        console.log('[Config] Loaded configuration from config.json')
    } catch (error) {
        console.error('[Config Error] Failed to load config.json:', error.message)
        // Fallback to default values if config.json is not found or invalid
        currentConfig = {
            REQUIRED_API_KEY: "123456",
            SERVER_PORT: 3000,
            HOST: 'localhost',
            MODEL_PROVIDER: MODEL_PROVIDER.GEMINI_CLI,
            DEFAULT_MODEL: null,
            DEFAULT_MODEL_MODE: 'fallback',
            OPENAI_API_KEY: null,
            OPENAI_BASE_URL: null,
            OPENROUTER_API_KEY: null,
            OPENROUTER_BASE_URL: null,
            OPENROUTER_REFERER: null,
            OPENROUTER_TITLE: null,
            CLAUDE_API_KEY: null,
            CLAUDE_BASE_URL: null,
            GEMINI_OAUTH_CREDS_BASE64: null,
            GEMINI_OAUTH_CREDS_FILE_PATH: null,
            KIRO_OAUTH_CREDS_BASE64: null,
            KIRO_OAUTH_CREDS_FILE_PATH: null,
            PROJECT_ID: null,
            SYSTEM_PROMPT_FILE_PATH: INPUT_SYSTEM_PROMPT_FILE, // Default value
            SYSTEM_PROMPT_MODE: 'overwrite',
            PROMPT_LOG_BASE_NAME: "prompt_log",
            PROMPT_LOG_MODE: "none",
            REQUEST_MAX_RETRIES: 3,
            REQUEST_BASE_DELAY: 1000,
            CRON_NEAR_MINUTES: 15,
            CRON_REFRESH_TOKEN: true
        }
        console.log('[Config] Using default configuration.')
    }

    // Parse command-line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--api-key') {
            if (i + 1 < args.length) {
                currentConfig.REQUIRED_API_KEY = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --api-key flag requires a value.`)
            }
        } else if (args[i] === '--log-prompts') {
            if (i + 1 < args.length) {
                const mode = args[i + 1]
                if (mode === 'console' || mode === 'file') {
                    currentConfig.PROMPT_LOG_MODE = mode
                } else {
                    console.warn(`[Config Warning] Invalid mode for --log-prompts. Expected 'console' or 'file'. Prompt logging is disabled.`)
                }
                i++
            } else {
                console.warn(`[Config Warning] --log-prompts flag requires a value.`)
            }
        } else if (args[i] === '--port') {
            if (i + 1 < args.length) {
                currentConfig.SERVER_PORT = parseInt(args[i + 1], 10)
                i++
            } else {
                console.warn(`[Config Warning] --port flag requires a value.`)
            }
        } else if (args[i] === '--model-provider') {
            if (i + 1 < args.length) {
                currentConfig.MODEL_PROVIDER = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --model-provider flag requires a value.`)
            }
        } else if (args[i] === '--default-model') {
            if (i + 1 < args.length) {
                currentConfig.DEFAULT_MODEL = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --default-model flag requires a value.`)
            }
        } else if (args[i] === '--default-model-mode') {
            if (i + 1 < args.length) {
                const mode = (args[i + 1] || '').toLowerCase()
                if (mode === 'fallback' || mode === 'force') {
                    currentConfig.DEFAULT_MODEL_MODE = mode
                } else {
                    console.warn(`[Config Warning] Invalid value for --default-model-mode. Expected 'fallback' or 'force'. Using default 'fallback'.`)
                }
                i++
            } else {
                console.warn(`[Config Warning] --default-model-mode flag requires a value.`)
            }
        } else if (args[i] === '--openai-api-key') {
            if (i + 1 < args.length) {
                currentConfig.OPENAI_API_KEY = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --openai-api-key flag requires a value.`)
            }
        } else if (args[i] === '--openai-base-url') {
            if (i + 1 < args.length) {
                currentConfig.OPENAI_BASE_URL = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --openai-base-url flag requires a value.`)
            }
        } else if (args[i] === '--openrouter-api-key') {
            if (i + 1 < args.length) {
                currentConfig.OPENROUTER_API_KEY = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --openrouter-api-key flag requires a value.`)
            }
        } else if (args[i] === '--openrouter-base-url') {
            if (i + 1 < args.length) {
                currentConfig.OPENROUTER_BASE_URL = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --openrouter-base-url flag requires a value.`)
            }
        } else if (args[i] === '--openrouter-referer') {
            if (i + 1 < args.length) {
                currentConfig.OPENROUTER_REFERER = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --openrouter-referer flag requires a value.`)
            }
        } else if (args[i] === '--openrouter-title') {
            if (i + 1 < args.length) {
                currentConfig.OPENROUTER_TITLE = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --openrouter-title flag requires a value.`)
            }
        } else if (args[i] === '--claude-api-key') {
            if (i + 1 < args.length) {
                currentConfig.CLAUDE_API_KEY = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --claude-api-key flag requires a value.`)
            }
        } else if (args[i] === '--claude-base-url') {
            if (i + 1 < args.length) {
                currentConfig.CLAUDE_BASE_URL = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --claude-base-url flag requires a value.`)
            }
        }
        // Gemini-specific arguments
        else if (args[i] === '--gemini-oauth-creds-base64') {
            if (i + 1 < args.length) {
                currentConfig.GEMINI_OAUTH_CREDS_BASE64 = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --gemini-oauth-creds-base64 flag requires a value.`)
            }
        } else if (args[i] === '--gemini-oauth-creds-file') {
            if (i + 1 < args.length) {
                currentConfig.GEMINI_OAUTH_CREDS_FILE_PATH = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --gemini-oauth-creds-file flag requires a value.`)
            }
        } else if (args[i] === '--project-id') {
            if (i + 1 < args.length) {
                currentConfig.PROJECT_ID = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --project-id flag requires a value.`)
            }
        } else if (args[i] === '--system-prompt-file') {
            if (i + 1 < args.length) {
                currentConfig.SYSTEM_PROMPT_FILE_PATH = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --system-prompt-file flag requires a value.`)
            }
        } else if (args[i] === '--system-prompt-mode') {
            if (i + 1 < args.length) {
                const mode = args[i + 1]
                if (mode === 'overwrite' || mode === 'append') {
                    currentConfig.SYSTEM_PROMPT_MODE = mode
                } else {
                    console.warn(`[Config Warning] Invalid mode for --system-prompt-mode. Expected 'overwrite' or 'append'. Using default 'overwrite'.`)
                }
                i++
            } else {
                console.warn(`[Config Warning] --system-prompt-mode flag requires a value.`)
            }
        } else if (args[i] === '--host') {
            if (i + 1 < args.length) {
                currentConfig.HOST = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --host flag requires a value.`)
            }
        } else if (args[i] === '--prompt-log-base-name') {
            if (i + 1 < args.length) {
                currentConfig.PROMPT_LOG_BASE_NAME = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --prompt-log-base-name flag requires a value.`)
            }
        } else if (args[i] === '--kiro-oauth-creds-base64') {
            if (i + 1 < args.length) {
                currentConfig.KIRO_OAUTH_CREDS_BASE64 = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --kiro-oauth-creds-base64 flag requires a value.`)
            }
        } else if (args[i] === '--kiro-oauth-creds-file') {
            if (i + 1 < args.length) {
                currentConfig.KIRO_OAUTH_CREDS_FILE_PATH = args[i + 1]
                i++
            } else {
                console.warn(`[Config Warning] --kiro-oauth-creds-file flag requires a value.`)
            }
        } else if (args[i] === '--cron-near-minutes') {
            if (i + 1 < args.length) {
                currentConfig.CRON_NEAR_MINUTES = parseInt(args[i + 1], 10)
                i++
            } else {
                console.warn(`[Config Warning] --cron-near-minutes flag requires a value.`)
            }
        } else if (args[i] === '--cron-refresh-token') {
            if (i + 1 < args.length) {
                currentConfig.CRON_REFRESH_TOKEN = args[i + 1].toLowerCase() === 'true'
                i++
            } else {
                console.warn(`[Config Warning] --cron-refresh-token flag requires a value.`)
            }
        }
    }

    // Normalize OpenRouter config when selected as provider
    if (currentConfig.MODEL_PROVIDER === MODEL_PROVIDER.OPENAI_OPENROUTER) {
        // Always override to ensure OpenRouter is used even if config.json contains an OpenAI URL
        currentConfig.OPENAI_BASE_URL = currentConfig.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
        if (currentConfig.OPENROUTER_API_KEY) {
            currentConfig.OPENAI_API_KEY = currentConfig.OPENROUTER_API_KEY
        }
    }

    if (!currentConfig.SYSTEM_PROMPT_FILE_PATH) {
        currentConfig.SYSTEM_PROMPT_FILE_PATH = INPUT_SYSTEM_PROMPT_FILE
    }
    currentConfig.SYSTEM_PROMPT_CONTENT = await getSystemPromptFileContent(currentConfig.SYSTEM_PROMPT_FILE_PATH)

    // Set PROMPT_LOG_FILENAME based on the determined config
    if (currentConfig.PROMPT_LOG_MODE === 'file') {
        const now = new Date()
        const pad = (num) => String(num).padStart(2, '0')
        const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
        PROMPT_LOG_FILENAME = `${currentConfig.PROMPT_LOG_BASE_NAME}-${timestamp}.log`
    } else {
        PROMPT_LOG_FILENAME = '' // Clear if not logging to file
    }

    // Assign to the exported CONFIG
    Object.assign(CONFIG, currentConfig)
    return CONFIG
}

/**
 * Gets system prompt content from the specified file path.
 * @param {string} filePath - Path to the system prompt file.
 * @returns {Promise<string|null>} File content, or null if the file does not exist, is empty, or an error occurs.
 */
async function getSystemPromptFileContent (filePath) {
    try {
        await pfs.access(filePath, pfs.constants.F_OK)
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`[System Prompt] Specified system prompt file not found: ${filePath}`)
        } else {
            console.error(`[System Prompt] Error accessing system prompt file ${filePath}: ${error.message}`)
        }
        return null
    }

    try {
        const content = await pfs.readFile(filePath, 'utf8')
        if (!content.trim()) {
            return null
        }
        console.log(`[System Prompt] Loaded system prompt from ${filePath}`)
        return content
    } catch (error) {
        console.error(`[System Prompt] Error reading system prompt file ${filePath}: ${error.message}`)
        return null
    }
}

async function initApiService (config) {
    // Initialize all known service adapters at startup
    for (const provider of Object.values(MODEL_PROVIDER)) {
        try {
            console.log(`[Initialization] Initializing service adapter for ${provider}...`)
            getServiceAdapter({ ...config, MODEL_PROVIDER: provider }) // This call populates serviceInstances
        } catch (error) {
            console.warn(`[Initialization Warning] Failed to initialize service adapter for ${provider}: ${error.message}`)
        }
    }
    return serviceInstances // Return the collection of initialized service instances
}

async function getApiService (config) {
    return getServiceAdapter(config)
}

/**
 * Main request handler. It authenticates the request, determines the endpoint type,
 * and delegates to the appropriate specialized handler function.
 * @param {http.IncomingMessage} req The HTTP request object.
 * @param {http.ServerResponse} res The HTTP response object.
 * @param {Object} currentConfig The current configuration object.
 * @param {string} currentPromptLogFilename The current prompt log filename.
 * @param {Object} apiService The initialized API service instance.
 */
function createRequestHandler (config) {
    return async function requestHandler (req, res) {
        // Deep copy the config for each request to allow dynamic modification
        const currentConfig = deepmerge({}, config)

        console.log(`\n${new Date().toLocaleString()}`)
        console.log(`[Server] Received request: ${req.method} http://${req.headers.host}${req.url}`)

        // Allow overriding MODEL_PROVIDER via request header
        const modelProviderHeader = req.headers['model-provider']
        if (modelProviderHeader) {
            currentConfig.MODEL_PROVIDER = modelProviderHeader
            console.log(`[Config] MODEL_PROVIDER overridden by header to: ${currentConfig.MODEL_PROVIDER}`)
            delete req.headers['model-provider']
        }

        const requestUrl = new URL(req.url, `http://${req.headers.host}`)
        let path = requestUrl.pathname
        // Check if the first path segment matches a MODEL_PROVIDER and switch if it does
        const pathSegments = path.split('/').filter(segment => segment.length > 0)
        if (pathSegments.length > 0) {
            const firstSegment = pathSegments[0]
            // Check if firstSegment is a valid MODEL_PROVIDER value
            const isValidProvider = Object.values(MODEL_PROVIDER).includes(firstSegment)
            if (firstSegment && isValidProvider) {
                currentConfig.MODEL_PROVIDER = firstSegment
                console.log(`[Config] MODEL_PROVIDER overridden by path segment to: ${currentConfig.MODEL_PROVIDER}`)
                // Remove the first segment from the path to maintain routing consistency
                pathSegments.shift()
                path = '/' + pathSegments.join('/')
                // Update the requestUrl pathname as well
                requestUrl.pathname = path
            } else if (firstSegment && !isValidProvider) {
                console.log(`[Config] Ignoring invalid MODEL_PROVIDER in path segment: ${firstSegment}`)
            }
        }

        const apiService = await getApiService(currentConfig)
        const method = req.method
        if (method === 'OPTIONS') {
            // 设置 CORS 头部，允许所有来源和方法
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-goog-api-key')

            // OPTIONS 请求通常返回 204 No Content
            res.writeHead(204)
            res.end()
            return
        }

        // Health check endpoint - no authentication required
        if (method === 'GET' && path === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                provider: currentConfig.MODEL_PROVIDER
            }))
        }

        if (!isAuthorized(req, requestUrl, currentConfig.REQUIRED_API_KEY)) {
            res.writeHead(401, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ error: { message: 'Unauthorized: API key is invalid or missing.' } }))
        }

        try {
            // Route model list requests
            if (method === 'GET') {
                if (path === '/v1/models') {
                    return await handleModelListRequest(req, res, apiService, ENDPOINT_TYPE.OPENAI_MODEL_LIST, currentConfig)
                }
                if (path === '/v1beta/models') {
                    return await handleModelListRequest(req, res, apiService, ENDPOINT_TYPE.GEMINI_MODEL_LIST, currentConfig)
                }
            }

            // Route content generation requests
            if (method === 'POST') {
                if (path === '/v1/chat/completions') {
                    return await handleContentGenerationRequest(req, res, apiService, ENDPOINT_TYPE.OPENAI_CHAT, currentConfig, PROMPT_LOG_FILENAME)
                }
                const geminiUrlPattern = new RegExp(`/v1beta/models/(.+?):(${API_ACTIONS.GENERATE_CONTENT}|${API_ACTIONS.STREAM_GENERATE_CONTENT})`)
                if (geminiUrlPattern.test(path)) {
                    return await handleContentGenerationRequest(req, res, apiService, ENDPOINT_TYPE.GEMINI_CONTENT, currentConfig, PROMPT_LOG_FILENAME)
                }
                if (path === '/v1/messages') {
                    return await handleContentGenerationRequest(req, res, apiService, ENDPOINT_TYPE.CLAUDE_MESSAGE, currentConfig, PROMPT_LOG_FILENAME)
                }
            }

            // Fallback for unmatched routes
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: { message: 'Not Found' } }))

        } catch (error) {
            handleError(res, error)
        }
    }
}

// --- Server Initialization ---
async function startServer () {
    await initializeConfig() // Initialize CONFIG globally
    const services = await initApiService(CONFIG) // Get service instance with the initialized CONFIG
    const requestHandlerInstance = createRequestHandler(CONFIG) // Create request handler with CONFIG and service

    // 定义心跳和令牌刷新函数
    const heartbeatAndRefreshToken = async () => {
        console.log(`[Heartbeat] Server is running. Current time: ${new Date().toLocaleString()}`)
        // 循环遍历所有已初始化的服务适配器，并尝试刷新令牌
        for (const providerKey in services) {
            const serviceAdapter = services[providerKey]
            try {
                await serviceAdapter.refreshToken()
                console.log(`[Token Refresh] Refreshed token for ${providerKey}`)
            } catch (error) {
                console.error(`[Token Refresh Error] Failed to refresh token for ${providerKey}: ${error.message}`)
            }
        }
    }

    const server = http.createServer(requestHandlerInstance)
    server.listen(CONFIG.SERVER_PORT, CONFIG.HOST, () => {
        console.log(`--- Unified API Server Configuration ---`)
        console.log(`  Model Provider: ${CONFIG.MODEL_PROVIDER}`)
        if (CONFIG.MODEL_PROVIDER === MODEL_PROVIDER.OPENAI_CUSTOM) {
            console.log(`  OpenAI API Key: ${CONFIG.OPENAI_API_KEY ? '******' : 'Not Set'}`)
            console.log(`  OpenAI Base URL: ${CONFIG.OPENAI_BASE_URL}`)
        } else if (CONFIG.MODEL_PROVIDER === MODEL_PROVIDER.OPENAI_OPENROUTER) {
            console.log(`  OpenRouter API Key: ${CONFIG.OPENAI_API_KEY ? '******' : 'Not Set'}`)
            console.log(`  OpenRouter Base URL: ${CONFIG.OPENAI_BASE_URL}`)
            if (CONFIG.OPENROUTER_REFERER) console.log(`  OpenRouter Referer: ${CONFIG.OPENROUTER_REFERER}`)
            if (CONFIG.OPENROUTER_TITLE) console.log(`  OpenRouter Title: ${CONFIG.OPENROUTER_TITLE}`)
        } else if (CONFIG.MODEL_PROVIDER === MODEL_PROVIDER.CLAUDE_CUSTOM) {
            console.log(`  Claude API Key: ${CONFIG.CLAUDE_API_KEY ? '******' : 'Not Set'}`)
            console.log(`  Claude Base URL: ${CONFIG.CLAUDE_BASE_URL}`)
        } else if (CONFIG.MODEL_PROVIDER === MODEL_PROVIDER.GEMINI_CLI) {
            console.log(`  Gemini OAuth Creds File Path: ${CONFIG.GEMINI_OAUTH_CREDS_FILE_PATH || 'Default'}`)
            console.log(`  Project ID: ${CONFIG.PROJECT_ID || 'Auto-discovered'}`)
        } else if (CONFIG.MODEL_PROVIDER === MODEL_PROVIDER.KIRO_API) {
            console.log(`  Kiro OAuth Creds File Path: ${CONFIG.KIRO_OAUTH_CREDS_FILE_PATH || 'Default'}`)
        }
        console.log(`  System Prompt File: ${CONFIG.SYSTEM_PROMPT_FILE_PATH || 'Default'}`)
        console.log(`  System Prompt Mode: ${CONFIG.SYSTEM_PROMPT_MODE}`)
        console.log(`  Host: ${CONFIG.HOST}`)
        console.log(`  Port: ${CONFIG.SERVER_PORT}`)
        console.log(`  Required API Key: ${CONFIG.REQUIRED_API_KEY}`)
        console.log(`  Prompt Logging: ${CONFIG.PROMPT_LOG_MODE}${PROMPT_LOG_FILENAME ? ` (to ${PROMPT_LOG_FILENAME})` : ''}`)
        console.log(`------------------------------------------`)
        console.log(`\nUnified API Server running on http://${CONFIG.HOST}:${CONFIG.SERVER_PORT}`)
        console.log(`Supports multiple API formats:`)
        console.log(`  • OpenAI-compatible: /v1/chat/completions, /v1/models`)
        console.log(`  • Gemini-compatible: /v1beta/models, /v1beta/models/{model}:generateContent`)
        console.log(`  • Claude-compatible: /v1/messages`)
        console.log(`  • Health check: /health`)

        if (CONFIG.CRON_REFRESH_TOKEN) {
            console.log(`  • Cron Near Minutes: ${CONFIG.CRON_NEAR_MINUTES}`)
            console.log(`  • Cron Refresh Token: ${CONFIG.CRON_REFRESH_TOKEN}`)
            // 每 CRON_NEAR_MINUTES 分钟执行一次心跳日志和令牌刷新
            setInterval(heartbeatAndRefreshToken, CONFIG.CRON_NEAR_MINUTES * 60 * 1000)
        }
    })
    return server // Return the server instance for testing purposes
}


startServer().catch(err => {
    console.error("[Server] Failed to start server:", err.message)
    process.exit(1)
})
