---
title: Document QA & RAG
summary: PDF question answering with file/page citations, validated index artifacts, and an offline retrieval regression suite.
tags: [Python, LangChain, FAISS, RAG]
draft: false
repository: https://github.com/sunshine-engineer/Intelligent-Document-QA-Chatbot
status: Portfolio prototype
featuredOrder: 1
---

## The problem

Finding a passage inside a collection of PDFs is only part of answering a question. The user also needs to inspect the evidence and understand whether the answer is grounded in the documents. This independent application combines retrieval with file/page citations in a Streamlit interface.

## What I built

The application discovers PDFs, chunks their contents, creates embeddings through Ollama, and stores them in FAISS. LangChain connects retrieval to a Groq-hosted language model. The interface supports conversation history, source inspection, configurable Top-K retrieval, and response downloads.

```text
PDFs → load and chunk → Ollama embeddings → FAISS index
question → retrieve context → Groq response → answer + file/page citations
```

Docker Compose provides a repeatable local environment. Query and application services are separated so retrieval behavior and error handling can be tested independently of the interface.

## Engineering decisions

- **Inspect the source:** file/page citations let users examine the evidence supporting an answer.
- **Validate persisted artifacts:** a manifest checks schema, embedding provider/model, artifact sizes, and SHA-256 checksums before loading the pickle-backed document mapping. Missing or incompatible indexes are rebuilt.
- **Separate indexing from generation:** indexing can run without a Groq key; answering needs provider access.
- **Make configuration explicit:** chunk size, overlap, Top-K, and relevance thresholds are configurable and validated.

The manifest detects damaged or mismatched artifacts; the index directory still needs to be trusted application-generated state.

## Validation and evidence

The repository includes tests for index metadata and manifests, settings, application errors, query services, integration workflows, and offline evaluation. Its quality workflow also covers formatting, linting, type checking, and core-module coverage.

The versioned synthetic fixture provides deterministic regression checks for retrieval, citations, and refusal behavior. It does not measure live-provider answer quality or performance on a representative document corpus. No production usage or real-world quality score is claimed here.

- [Implementation and setup](https://github.com/sunshine-engineer/Intelligent-Document-QA-Chatbot/blob/main/readme.md)
- [Test suite](https://github.com/sunshine-engineer/Intelligent-Document-QA-Chatbot/tree/main/tests)
- [Quality gates and evaluation scope](https://github.com/sunshine-engineer/Intelligent-Document-QA-Chatbot/blob/main/docs/quality-gates.md)

These public sources were reviewed for this case study; the application tests and model calls were not rerun as part of the website update.

## Next steps

Evaluate a representative document set, inspect retrieval failures before changing prompts, and measure answer support, latency, and provider cost. Incremental indexing, hybrid retrieval, reranking, and authentication remain future improvements.
