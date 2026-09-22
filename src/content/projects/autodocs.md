---
title: AutoDocsGenAI
summary: An in-progress pipeline for ingesting official Python documentation, preserving source lineage, and building embedding-based retrieval.
tags: [Python, Documentation, Data pipelines]
draft: false
repository: https://github.com/sunshine-engineer/AutoDocsGenAI
status: In progress
featuredOrder: 3
cover: images/autodocs.svg
---

## The problem

Technical learning material needs a trustworthy connection to its sources. A generated explanation can sound convincing while losing the package version, page context, or evidence that supports it. AutoDocsGenAI explores a documentation pipeline in which source context remains part of the data.

## Architecture

The documented ingestion path starts with a Python package and version. It discovers official documentation through package metadata, plans a crawl, fetches selected pages, extracts the main content, normalizes Markdown, and creates structure-aware chunks.

```text
package + version
  → official-source discovery
  → crawl plan
  → fetch and extract
  → normalize Markdown
  → structure-aware chunks
```

The repository also documents PostgreSQL lineage persistence, repeatable imports,
embedding/indexing commands, and package-version search with a lightweight
identifier-aware reranker. Generation, validation, human review, and export remain
development work; ingestion success does not establish their completion.

## My contribution

This is my independent portfolio project exploring source-grounded GenAI engineering. The work brings data-pipeline concerns—configuration, normalization, traceability, and validation—into a documentation-generation problem.

The repository is the source of implementation evidence. This case study summarizes its documented ingestion design rather than claiming a deployed commercial service.

## Technical decisions

- **Official sources first:** discovery and URL validation establish the intended source boundary before downstream processing.
- **Package and version context:** artifacts are organized around the documentation version being processed.
- **Structure-aware chunks:** deterministic chunking and JSONL artifacts make intermediate output inspectable.
- **Explicit migration control:** the documented development setup reports pending database migrations rather than automatically applying them to a reusable database.

These choices prioritize inspectable stages. An intermediate artifact gives a developer something concrete to examine before attributing a failure to generation.

## Validation and evidence

The [repository README](https://github.com/sunshine-engineer/AutoDocsGenAI/blob/main/README.md) describes the ingestion stages, quality-check commands, and disposable PostgreSQL integration workflow. It also links the architecture and chunking documents.

This case study was prepared from that README on September 21, 2026. The project tests were not rerun as part of building this website, so no current pass count or retrieval-quality metric is claimed here.

## Limitations and next steps

The README contains an older status table alongside later indexing and search
instructions. The ingestion path and documented retrieval commands are described
here separately; no complete documentation-generation workflow is claimed.

The next useful evidence is a reproducible end-to-end run with a pinned source version, inspected artifacts, retrieval evaluation, and citation checks. Generated-document quality and commercial operating reliability remain separate questions.
