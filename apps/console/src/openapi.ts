/**
 * OpenAPI 3.1 spec for x402.tanship.dev
 * Served at GET /openapi.json for x402scan discovery.
 */
export const OPENAPI_SPEC = {
	openapi: "3.1.0",
	info: {
		title: "Tanship x402 API",
		version: "1.0.0",
		description:
			"Payment-gated AI and browser automation API using the x402 protocol. All /v1/* endpoints require USDC payment on Base (eip155:8453) via x402 v2 exact scheme.",
		contact: {
			email: "inurhuda00@gmail.com"
		},
		"x-guidance":
			"All paid endpoints require an X-PAYMENT header per the x402 v2 spec. Call any endpoint without payment to receive a 402 challenge with accepted payment options. Pay using awal CLI: `npx awal@2.12.0 x402 pay -X POST -d '{...}' https://x402.tanship.dev/v1/<endpoint>`. Free endpoints: GET / and GET /v1/services."
	},
	servers: [{ url: "https://x402.tanship.dev" }],
	paths: {
		"/": {
			get: {
				operationId: "index",
				summary: "API root",
				description:
					"Returns API info and docs link. Free, no payment required.",
				security: [],
				responses: {
					"200": { description: "OK" }
				}
			}
		},
		"/v1/services": {
			get: {
				operationId: "listServices",
				summary: "List available paid services",
				description:
					"Returns all paid endpoint metadata, accepted networks, and facilitator URL. Free, no payment required.",
				security: [],
				responses: {
					"200": { description: "OK" }
				}
			}
		},
		"/v1/ai/chat": {
			post: {
				operationId: "aiChat",
				summary: "LLM chat completion",
				description:
					"LLM chat completion via Cloudflare Workers AI (Llama 3.3 70B by default)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["messages"],
								properties: {
									messages: {
										type: "array",
										items: {
											type: "object",
											required: ["role", "content"],
											properties: {
												role: {
													type: "string",
													enum: [
														"system",
														"user",
														"assistant"
													]
												},
												content: { type: "string" }
											}
										},
										description:
											"Array of { role: system|user|assistant, content: string }"
									},
									model: {
										type: "string",
										description:
											"Optional model id from the allowlist"
									},
									max_tokens: {
										type: "integer",
										default: 1024,
										description:
											"Optional max output tokens"
									}
								}
							},
							example: {
								messages: [
									{
										role: "user",
										content: "Explain x402 in one sentence."
									}
								]
							}
						}
					}
				},
				responses: {
					"200": { description: "Chat completion result" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/image": {
			post: {
				operationId: "aiImage",
				summary: "Text-to-image generation",
				description:
					"Text-to-image generation via Workers AI (FLUX.1 schnell), returns JPEG",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.02" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["prompt"],
								properties: {
									prompt: {
										type: "string",
										description: "Image description"
									},
									steps: {
										type: "integer",
										minimum: 1,
										maximum: 8,
										default: 4,
										description:
											"Optional diffusion steps 1-8"
									},
									width: {
										type: "integer",
										minimum: 256,
										maximum: 1024,
										default: 1024,
										description:
											"Optional image width (default 1024)"
									},
									height: {
										type: "integer",
										minimum: 256,
										maximum: 1024,
										default: 1024,
										description:
											"Optional image height (default 1024)"
									}
								}
							},
							example: {
								prompt: "a red panda coding on a laptop, studio ghibli style"
							}
						}
					}
				},
				responses: {
					"200": { description: "JPEG image bytes" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/embeddings": {
			post: {
				operationId: "aiEmbeddings",
				summary: "Text embeddings",
				description:
					"Multilingual text embeddings via Workers AI (BGE-M3, 1024 dims)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.002" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["text"],
								properties: {
									text: {
										oneOf: [
											{ type: "string" },
											{
												type: "array",
												items: { type: "string" },
												maxItems: 100
											}
										],
										description:
											"A string or array of strings (max 100)"
									}
								}
							},
							example: { text: ["hello world", "hola mundo"] }
						}
					}
				},
				responses: {
					"200": { description: "Embeddings array" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/translate": {
			post: {
				operationId: "aiTranslate",
				summary: "AI-powered translation",
				description:
					"AI-powered translation via Workers AI (m2m100-1.2b)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.003" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["text", "target_lang"],
								properties: {
									text: {
										type: "string",
										description: "Text to translate"
									},
									source_lang: {
										type: "string",
										description:
											"Optional source language code (e.g. en, es, fr)"
									},
									target_lang: {
										type: "string",
										description:
											"Target language code (e.g. id, es, ja)"
									}
								}
							},
							example: {
								text: "Hello world, how are you?",
								source_lang: "en",
								target_lang: "id"
							}
						}
					}
				},
				responses: {
					"200": { description: "Translated text" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/sentiment": {
			post: {
				operationId: "aiSentiment",
				summary: "Sentiment analysis",
				description:
					"Sentiment analysis on text using Workers AI, returns positive/negative label with score",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.002" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["text"],
								properties: {
									text: {
										type: "string",
										description: "Text to analyze"
									}
								}
							},
							example: {
								text: "I love building autonomous agents on Base L2!"
							}
						}
					}
				},
				responses: {
					"200": { description: "Sentiment label and score" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/transcribe": {
			post: {
				operationId: "aiTranscribe",
				summary: "Speech-to-text audio transcription",
				description:
					"Speech-to-text audio transcription via Workers AI (Whisper), returns text and metadata",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.01" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Absolute URL to the audio file to transcribe"
									}
								}
							},
							example: {
								url: "https://x402.tanship.dev/assets/sample.mp3"
							}
						}
					}
				},
				responses: {
					"200": { description: "Transcription text and metadata" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/describe": {
			post: {
				operationId: "aiDescribe",
				summary: "Describe or caption any image",
				description:
					"Describe or caption any image via Workers AI (BLIP), returns description text",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Absolute URL to the image file to describe"
									}
								}
							},
							example: {
								url: "https://x402.tanship.dev/assets/sample.jpg"
							}
						}
					}
				},
				responses: {
					"200": { description: "Image description result" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/rerank": {
			post: {
				operationId: "aiRerank",
				summary: "Rerank documents relative to query",
				description:
					"Rerank a list of documents relative to a query via Workers AI (BGE Reranker Large)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.003" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["query", "documents"],
								properties: {
									query: {
										type: "string",
										description: "Relevance query string"
									},
									documents: {
										type: "array",
										items: { type: "string" },
										description: "Array of strings to rank"
									},
									top_n: {
										type: "integer",
										description:
											"Optional number of top results to return"
									}
								}
							},
							example: {
								query: "base network",
								documents: [
									"Base is a secure, low-cost, builder-friendly Ethereum L2 built on OP Stack.",
									"Solana is a blockchain platform designed for hosting decentralized applications.",
									"The Base network is incubated by Coinbase."
								],
								top_n: 2
							}
						}
					}
				},
				responses: {
					"200": { description: "Reranking scores result" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/classify": {
			post: {
				operationId: "aiClassify",
				summary: "Classify any image into categories",
				description:
					"Classify any image into pre-trained categories via Workers AI (ResNet-50), returns tags and scores",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.003" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Absolute URL to the image file to classify"
									}
								}
							},
							example: {
								url: "https://x402.tanship.dev/assets/sample.jpg"
							}
						}
					}
				},
				responses: {
					"200": {
						description:
							"Classification result categories and scores"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/moderate": {
			post: {
				operationId: "aiModerate",
				summary: "Moderate text content for safety",
				description:
					"Moderate text content for safety categories via Workers AI (Llama Guard 3 8B), returns safety classification",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.002" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["text"],
								properties: {
									text: {
										type: "string",
										description:
											"The text content to moderate"
									}
								}
							},
							example: {
								text: "How do I build a secure API on Cloudflare Workers?"
							}
						}
					}
				},
				responses: {
					"200": { description: "Safety classification result" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/detect": {
			post: {
				operationId: "aiDetect",
				summary: "Detect objects inside image",
				description:
					"Detect objects inside any image via Workers AI (DETR-ResNet-50), returns tags and bounding boxes",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Absolute URL to the image file to detect objects inside"
									}
								}
							},
							example: {
								url: "https://x402.tanship.dev/assets/sample.jpg"
							}
						}
					}
				},
				responses: {
					"200": {
						description:
							"Object detection result bounding boxes and scores"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/compress": {
			post: {
				operationId: "aiCompress",
				summary: "Compress text semantically",
				description:
					"Compress long text semantically using Workers AI (Llama 3.3 70B) to save downstream LLM prompt tokens",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["text"],
								properties: {
									text: {
										type: "string",
										description:
											"The text content to semantically compress"
									}
								}
							},
							example: {
								text: "Model Context Protocol (MCP) is an open standard that enables developers to build secure, bidirectional connections between AI models and their data sources. By using standard JSON-RPC over stdio or SSE, clients can dynamically discover and call tools, read resources, and subscribe to prompts."
							}
						}
					}
				},
				responses: {
					"200": { description: "Semantic compression results" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/answer": {
			post: {
				operationId: "aiAnswer",
				summary: "Visual question answering",
				description:
					"Perform visual question answering (VQA) on any image via Workers AI (PaliGemma), returns the text answer",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.008" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url", "prompt"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Absolute URL to the image file to analyze"
									},
									prompt: {
										type: "string",
										description:
											"Question or prompt about the image"
									}
								}
							},
							example: {
								url: "https://x402.tanship.dev/assets/sample.jpg",
								prompt: "What is written on the laptop screen?"
							}
						}
					}
				},
				responses: {
					"200": {
						description: "Visual question answering text result"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/correct": {
			post: {
				operationId: "aiCorrect",
				summary: "Correct text grammar and spelling",
				description:
					"Automatically correct grammar, spelling, punctuation, and phrasing via Workers AI (Llama 3.3 70B)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["text"],
								properties: {
									text: {
										type: "string",
										description:
											"The text content to check and correct"
									}
								}
							},
							example: {
								text: "i has a error in my code and it dont build"
							}
						}
					}
				},
				responses: {
					"200": { description: "Grammar correction result" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/code": {
			post: {
				operationId: "aiCode",
				summary: "Analyze or debug code",
				description:
					"Analyze, debug, or refactor code via coding-tailored Workers AI (Llama 3.3 70B)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["code", "prompt"],
								properties: {
									code: {
										type: "string",
										description:
											"The code snippet to analyze"
									},
									prompt: {
										type: "string",
										description:
											"Coding instruction (e.g. explain, debug, rewrite)"
									},
									language: {
										type: "string",
										description:
											"Optional programming language name"
									}
								}
							},
							example: {
								code: "function add(a, b) { return a - b; }",
								prompt: "Verify this function name and correct the implementation if needed.",
								language: "javascript"
							}
						}
					}
				},
				responses: {
					"200": { description: "Code analysis result" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/reason": {
			post: {
				operationId: "aiReason",
				summary: "Reasoning model completion",
				description:
					"Reasoning model completion via Workers AI (DeepSeek R1 Distill Qwen 32B), separating thinking process from final answer",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.008" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["messages"],
								properties: {
									messages: {
										type: "array",
										items: {
											type: "object",
											required: ["role", "content"],
											properties: {
												role: {
													type: "string",
													enum: [
														"system",
														"user",
														"assistant"
													]
												},
												content: { type: "string" }
											}
										},
										description:
											"Array of { role: system|user|assistant, content: string }"
									},
									max_tokens: {
										type: "integer",
										default: 2048,
										description:
											"Optional max output tokens"
									}
								}
							},
							example: {
								messages: [
									{
										role: "user",
										content:
											"How many Rs are in strawberry?"
									}
								]
							}
						}
					}
				},
				responses: {
					"200": { description: "Thinking process and final answer" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/similarity": {
			post: {
				operationId: "aiSimilarity",
				summary: "Calculate semantic similarity",
				description:
					"Calculate semantic cosine similarity score between two texts via Workers AI (BGE-M3 embeddings)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.004" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["text1", "text2"],
								properties: {
									text1: {
										type: "string",
										description:
											"First text content to compare"
									},
									text2: {
										type: "string",
										description:
											"Second text content to compare"
									}
								}
							},
							example: {
								text1: "The weather is very warm today.",
								text2: "It is quite hot outside."
							}
						}
					}
				},
				responses: {
					"200": { description: "Semantic similarity score" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/ocr": {
			post: {
				operationId: "aiOcr",
				summary: "Extract text from image",
				description:
					"Extract spelling/text content from any image via Workers AI (PaliGemma OCR)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.008" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Absolute URL to the image file to extract text from"
									}
								}
							},
							example: {
								url: "https://x402.tanship.dev/assets/sample.jpg"
							}
						}
					}
				},
				responses: {
					"200": { description: "Extracted text content result" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/lint": {
			post: {
				operationId: "aiLint",
				summary: "Static code syntax checking",
				description:
					"Perform static code syntax checking and linting via compiler-tailored Workers AI (Llama 3.3 70B)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.008" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["code"],
								properties: {
									code: {
										type: "string",
										description: "The code snippet to lint"
									},
									language: {
										type: "string",
										description:
											"Optional programming language name"
									}
								}
							},
							example: {
								code: "const x = 5\nconsole.log(y)",
								language: "javascript"
							}
						}
					}
				},
				responses: {
					"200": {
						description: "Structured linter analysis results"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/memory/add": {
			post: {
				operationId: "aiMemoryAdd",
				summary: "Insert text to semantic memory",
				description:
					"Insert text chunks semantically into persistent memory using Workers AI (BGE-M3) and Cloudflare Vectorize",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["text"],
								properties: {
									text: {
										type: "string",
										description:
											"The text content to store in semantic memory"
									}
								}
							},
							example: {
								text: "Model Context Protocol (MCP) is standard JSON-RPC over stdio or SSE."
							}
						}
					}
				},
				responses: {
					"200": { description: "Memory added successfully with ID" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/memory/search": {
			post: {
				operationId: "aiMemorySearch",
				summary: "Search semantic memory",
				description:
					"Search semantically matching text chunks from persistent memory via BGE-M3 + Vectorize",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["query"],
								properties: {
									query: {
										type: "string",
										description: "Search query string"
									},
									top_k: {
										type: "integer",
										default: 5,
										description:
											"Optional number of top matches to return"
									}
								}
							},
							example: {
								query: "how does MCP work?",
								top_k: 3
							}
						}
					}
				},
				responses: {
					"200": {
						description: "Semantic memory search matches results"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/sql": {
			post: {
				operationId: "aiSql",
				summary: "Generate SQL query from text",
				description:
					"Generate a clean, optimized SQL query from natural language instructions via Workers AI (Llama 3.3 70B)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["prompt"],
								properties: {
									prompt: {
										type: "string",
										description:
											"Natural language query description"
									},
									schema: {
										type: "string",
										description:
											"Optional database DDL schema structure"
									},
									dialect: {
										type: "string",
										description:
											"Optional target SQL dialect (default sqlite)"
									}
								}
							},
							example: {
								prompt: "Find the top 5 users by spend in June 2026",
								schema: "CREATE TABLE users (id INT, name TEXT, spend REAL, date TEXT);",
								dialect: "sqlite"
							}
						}
					}
				},
				responses: {
					"200": {
						description: "Generated SQL query and explanation"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/ai/emotion": {
			post: {
				operationId: "aiEmotion",
				summary: "Analyze text emotion",
				description:
					"Analyze sentiment and detailed emotion categories (joy, sadness, anger, fear, etc) via Workers AI (Llama 3.3 70B)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["text"],
								properties: {
									text: {
										type: "string",
										description:
											"The text content to analyze emotions on"
									}
								}
							},
							example: {
								text: "I am absolutely thrilled and excited about our launch, but also slightly terrified!"
							}
						}
					}
				},
				responses: {
					"200": {
						description: "Sentiment and emotion scores result"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/search": {
			post: {
				operationId: "browserSearch",
				summary: "Perform web search",
				description:
					"Perform a web search via headless browser rendering, returns structured search results (titles, links, snippets)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.02" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["query"],
								properties: {
									query: {
										type: "string",
										description: "Search query string"
									},
									limit: {
										type: "integer",
										default: 10,
										description:
											"Optional max results to return"
									}
								}
							},
							example: {
								query: "base network coinbase L2",
								limit: 5
							}
						}
					}
				},
				responses: {
					"200": { description: "Structured web search results" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/search/summary": {
			post: {
				operationId: "browserSearchSummary",
				summary: "Perform web search with AI summary",
				description:
					"Perform web search and synthesize results into a structured AI answer with cited sources (Perplexity clone)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.03" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["query"],
								properties: {
									query: {
										type: "string",
										description: "Search query to research"
									}
								}
							},
							example: {
								query: "what is base network and how does it relate to coinbase"
							}
						}
					}
				},
				responses: {
					"200": {
						description:
							"Synthesized research answer with cited sources"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/metadata": {
			post: {
				operationId: "browserMetadata",
				summary: "Extract SEO & OpenGraph metadata",
				description:
					"Extract SEO & OpenGraph metadata from any webpage via browser rendering + AI",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.008" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Page URL to extract metadata from"
									}
								}
							},
							example: {
								url: "https://example.com"
							}
						}
					}
				},
				responses: {
					"200": { description: "Extracted metadata" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/article": {
			post: {
				operationId: "browserArticle",
				summary: "Extract clean structured article",
				description:
					"Extract a clean structured article from any webpage (title, content markdown, read time, etc) via browser rendering + AI",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.012" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Page URL to extract the article from"
									}
								}
							},
							example: {
								url: "https://blog.cloudflare.com/introducing-browser-rendering-api"
							}
						}
					}
				},
				responses: {
					"200": {
						description: "Structured article extraction result"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/news": {
			post: {
				operationId: "browserNews",
				summary: "Perform web news search",
				description:
					"Perform a real-time web news search, returns a structured list of recent news articles (titles, links, dates, sources)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["query"],
								properties: {
									query: {
										type: "string",
										description: "News search query string"
									},
									limit: {
										type: "integer",
										default: 10,
										description:
											"Optional max results to return"
									}
								}
							},
							example: {
								query: "base network coinbase L2",
								limit: 5
							}
						}
					}
				},
				responses: {
					"200": {
						description: "Structured web news search results"
					},
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/seo": {
			post: {
				operationId: "browserSeo",
				summary: "SEO health audit and validation",
				description:
					"Perform an automated SEO health audit and validator on any webpage via browser rendering + AI",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.015" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL to audit for SEO"
									}
								}
							},
							example: {
								url: "https://example.com"
							}
						}
					}
				},
				responses: {
					"200": { description: "SEO health audit results" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/contacts": {
			post: {
				operationId: "browserContacts",
				summary: "Extract contact details",
				description:
					"Extract contact details and social media links from any webpage via browser rendering + AI",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.012" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Page URL to extract contacts from"
									}
								}
							},
							example: {
								url: "https://example.com/contact"
							}
						}
					}
				},
				responses: {
					"200": { description: "Extracted contact details results" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/sitemap": {
			post: {
				operationId: "browserSitemap",
				summary: "Extract website sitemap links",
				description:
					"Extract and filter all internal links from a website root to generate an XML sitemap or JSON URLs array via browser rendering",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.008" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Root website URL to crawl for sitemap generation"
									}
								}
							},
							example: {
								url: "https://example.com"
							}
						}
					}
				},
				responses: {
					"200": { description: "Sitemap links list result" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/forms": {
			post: {
				operationId: "browserForms",
				summary: "Extract web forms",
				description:
					"Extract all web forms and input schemas from any webpage via browser rendering + AI",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.012" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Page URL to extract forms from"
									}
								}
							},
							example: {
								url: "https://example.com/login"
							}
						}
					}
				},
				responses: {
					"200": { description: "Extracted web forms result" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/screenshot": {
			post: {
				operationId: "browserScreenshot",
				summary: "Screenshot any webpage",
				description:
					"Screenshot any webpage — paste a URL, get a pixel-perfect picture of the live page (PNG)",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.01" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL"
									},
									fullPage: {
										type: "boolean",
										default: false,
										description: "Full page screenshot"
									},
									width: {
										type: "integer",
										default: 1280,
										description: "Viewport width"
									},
									height: {
										type: "integer",
										default: 800,
										description: "Viewport height"
									},
									selector: {
										type: "string",
										description:
											"Optional CSS selector to capture specific element instead of viewport"
									}
								}
							},
							example: {
								url: "https://example.com",
								fullPage: true
							}
						}
					}
				},
				responses: {
					"200": { description: "PNG image bytes" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/pdf": {
			post: {
				operationId: "browserPdf",
				summary: "Render URL to PDF",
				description:
					"Render any URL to PDF via Cloudflare Browser Rendering",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.01" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL"
									},
									scale: {
										type: "number",
										minimum: 0.1,
										maximum: 2.0,
										default: 1.0,
										description: "Optional PDF render scale"
									},
									printBackground: {
										type: "boolean",
										default: false,
										description:
											"Optional print background graphics"
									},
									landscape: {
										type: "boolean",
										default: false,
										description:
											"Optional print in landscape orientation"
									},
									pageRanges: {
										type: "string",
										description:
											"Optional paper ranges to print (e.g. 1-5)"
									},
									format: {
										type: "string",
										default: "Letter",
										description:
											"Optional paper format (e.g. Letter, A4)"
									},
									margin: {
										type: "object",
										properties: {
											top: {
												type: "string",
												default: "0px"
											},
											bottom: {
												type: "string",
												default: "0px"
											},
											left: {
												type: "string",
												default: "0px"
											},
											right: {
												type: "string",
												default: "0px"
											}
										},
										description:
											"Optional margin config object"
									}
								}
							},
							example: { url: "https://example.com" }
						}
					}
				},
				responses: {
					"200": { description: "PDF bytes" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/markdown": {
			post: {
				operationId: "browserMarkdown",
				summary: "Page to Markdown",
				description:
					"Turn a page into Markdown — strip the ads and chrome, keep the readable content",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.005" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL"
									}
								}
							},
							example: { url: "https://example.com" }
						}
					}
				},
				responses: {
					"200": { description: "Markdown content" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/snapshot": {
			post: {
				operationId: "browserSnapshot",
				summary: "Page snapshot (HTML + screenshot)",
				description:
					"Snapshot a page — rendered HTML and a screenshot, in a single call",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.012" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL"
									}
								}
							},
							example: { url: "https://example.com" }
						}
					}
				},
				responses: {
					"200": { description: "HTML and screenshot" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/scrape": {
			post: {
				operationId: "browserScrape",
				summary: "Scrape elements via CSS selectors",
				description:
					"Scrape elements — pull specific elements off a page with CSS selectors",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.006" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url", "selectors"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL"
									},
									selectors: {
										type: "array",
										items: { type: "string" },
										maxItems: 20,
										description:
											"Array of CSS selectors (max 20)"
									}
								}
							},
							example: {
								url: "https://news.ycombinator.com",
								selectors: [".titleline > a"]
							}
						}
					}
				},
				responses: {
					"200": { description: "Scraped elements" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/json": {
			post: {
				operationId: "browserExtract",
				summary: "Extract structured data via AI",
				description:
					"Extract structured data — describe what you want, get clean JSON back via AI",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.015" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url", "prompt"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL"
									},
									prompt: {
										type: "string",
										description:
											"What to extract, in plain language"
									},
									schema: {
										type: "object",
										description:
											"Optional JSON Schema for the response shape"
									}
								}
							},
							example: {
								url: "https://example.com",
								prompt: "Extract the page title and main heading"
							}
						}
					}
				},
				responses: {
					"200": { description: "Extracted JSON data" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/links": {
			post: {
				operationId: "browserLinks",
				summary: "Get all links on a page",
				description:
					"Get every link — pull all the links off a page, internal or external",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.003" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL"
									}
								}
							},
							example: { url: "https://example.com" }
						}
					}
				},
				responses: {
					"200": { description: "List of links" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/browser/rss": {
			post: {
				operationId: "browserRss",
				summary: "Page to RSS feed",
				description:
					"Turn a page into an RSS feed — point it at any blog or news page, get a subscribable feed",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.015" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL"
									},
									limit: {
										type: "integer",
										default: 20,
										description: "Optional max items"
									}
								}
							},
							example: {
								url: "https://blog.cloudflare.com",
								limit: 20
							}
						}
					}
				},
				responses: {
					"200": { description: "RSS feed XML" },
					"402": { description: "Payment Required" }
				}
			}
		},
		"/v1/summarize": {
			post: {
				operationId: "summarize",
				summary: "Summarize any webpage",
				description:
					"Summarize any webpage — fetch readable markdown and synthesize highlights using AI",
				"x-payment-info": {
					price: { mode: "fixed", currency: "USD", amount: "0.015" },
					protocols: [{ x402: {} }]
				},
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									url: {
										type: "string",
										format: "uri",
										description:
											"Optional Page URL to summarize (if text is not provided)"
									},
									text: {
										type: "string",
										description:
											"Optional raw text to summarize (if url is not provided)"
									},
									prompt: {
										type: "string",
										description:
											"Optional guidelines or focus areas for the summary"
									}
								}
							},
							example: { url: "https://example.com" }
						}
					}
				},
				responses: {
					"200": { description: "Summary text" },
					"402": { description: "Payment Required" }
				}
			}
		}
	}
} as const;
