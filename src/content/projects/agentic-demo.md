---
title: Agentic AI Demo
summary: A bounded support-operations demo exploring tool use, deterministic policy, and explicit human approval.
tags: [Python, Tool calling, Agent safety]
draft: false
repository: https://github.com/sunshine-engineer/AgenticAI_Demo
status: Portfolio prototype
featuredOrder: 2
cover: images/agentic.svg
---

## The problem

A model can propose a tool call without being the right authority to approve it. This project explores that distinction in a small support-operations application: investigate a simulated service issue, find guidance, and prepare a dummy ticket.

## Architecture

The repository demonstrates a deterministic workflow and a bounded model-directed agent loop. Tool requests pass through application-controlled validation and policy checks. The write tools operate on an in-memory dummy ticket store.

```text
user request → workflow or bounded agent loop
                         ↓
              tool registry + validation
                         ↓
                policy + write approval
                         ↓
                  dummy ticket store
```

Optional examples explore supervisor/specialist handoffs, LangGraph interrupts and checkpoints, and an in-process MCP server.

## My contribution

This independent learning application lets me compare fixed orchestration with model-directed tool selection while keeping the tools deliberately narrow.

The learning focus is the control boundary: understand what the model proposes, what the application validates, when a human must approve, and why a loop terminates.

## Technical decisions

- **Simulated operations:** tools cannot send real emails, run shell commands, or write to a real ticket system.
- **Policy outside the model:** prompts are not treated as authorization.
- **Bounded execution:** repeat detection and step limits constrain the agent loop.
- **Optional integrations:** the base application and offline tests use Python's standard library; graph and MCP examples are optional extras.
- **Explicit state limitations:** checkpoints and ticket writes are in memory, without a claim of durable recovery.

## Validation and evidence

The [repository README](https://github.com/sunshine-engineer/AgenticAI_Demo/blob/main/README.md) documents an offline regression-test command and a manual sequence for checking denied writes, proposed arguments, approval, traces, and loop termination.

The README was reviewed on September 21, 2026. Offline tests and live provider calls were not rerun for this website. A provider connection check would demonstrate connectivity, not answer quality or safe behavior across a representative evaluation set.

## Limitations and next steps

This is a portfolio prototype using dummy data. It does not establish production authentication, durable idempotency, concurrency safety, deployment recovery, or live-model quality.

The next step is a versioned scenario set with expected tool and policy outcomes. That would support a measured comparison between deterministic workflows and model-directed orchestration before adding complexity.
