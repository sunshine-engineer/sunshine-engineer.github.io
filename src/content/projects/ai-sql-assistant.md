---
title: AI SQL Assistant
summary: A conversational SQL prototype connecting schema discovery and tool calling to SQLite, MySQL, and PostgreSQL.
tags: [Python, LangChain, SQLAlchemy, SQL]
draft: false
repository: https://github.com/sunshine-engineer/ai-sql-assistant
status: Portfolio prototype
featuredOrder: 4
---

## The problem

A natural-language interface can make relational data easier to explore, but generated SQL needs context and controls. I built this independent prototype to connect my SQL and data-engineering background with LLM tool use.

## What I built

A Streamlit chat interface connects to a LangChain SQL agent using a Groq-hosted model. SQLAlchemy supports SQLite, MySQL, and PostgreSQL connectivity. The application exposes schema discovery, database information, session chat history, streaming responses, and response-time tracking.

```text
question → input checks → schema-aware SQL agent → database tools → response
                            Groq + LangChain       SQLAlchemy
```

## Design decisions and access controls

- **Use schema context:** the agent discovers the connected database structure rather than relying only on the user's description.
- **Constrain intent:** input checks reject destructive requests and the prompt instructs the model to use SELECT queries.
- **Apply database controls:** SQLite is opened read-only. MySQL and PostgreSQL need appropriately restricted database credentials for comparable protection.
- **Expose interaction behavior:** session history and response timing make the prototype easier to inspect during a walkthrough.

Prompt instructions and regex-based input checks are prototype safeguards. They cannot establish that all generated queries are safe, inexpensive, or authorized. Database permissions, query limits, and validation of generated SQL are necessary before broader use.

## Evidence and current scope

The [repository](https://github.com/sunshine-engineer/ai-sql-assistant) contains the application and screenshots of chat, database selection, and guardrails. Its README lists authentication, Docker, observability, and unit tests as future work; those capabilities are not claimed here.

The public documentation was reviewed for this case study. Database queries and provider calls were not rerun during the website update.

## What I would improve next

Expose generated SQL and structured results for inspection, add a representative query test set, enforce least-privilege database access and execution limits, and measure correctness separately from response time. These improvements would make the system easier to evaluate before deploying it beyond a controlled demonstration.
