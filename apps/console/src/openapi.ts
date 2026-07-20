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
								required: ["url"],
								properties: {
									url: {
										type: "string",
										format: "uri",
										description: "Page URL to summarize"
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
