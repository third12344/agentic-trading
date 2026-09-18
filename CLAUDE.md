# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This repository is currently a bare scaffold. The only file present is `.mcp.json`, which registers the Robinhood Trading MCP server (`https://agent.robinhood.com/mcp/trading`) for use by Claude Code sessions in this repo. There is no application code, build system, test suite, or README yet.

## MCP configuration

`.mcp.json` configures an HTTP MCP server named `robinhood-trading`. Tools from this server require the user to authenticate it (via `claude mcp` or `/mcp`) before they can be called — sessions without that authorization will see the server's tools listed but unusable.

As real code is added to this repository, update this file with build/lint/test commands and the architecture that emerges.
