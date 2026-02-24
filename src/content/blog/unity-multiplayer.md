---
title: "Multiplayer Networking in Unity: What I Learned"
excerpt: "After shipping a co-op FPS, here are the hard lessons about client-server architecture, prediction, and why you should never trust the client."
date: "Mar 2025"
readTime: "6 min"
tags: ["Unity", "Networking"]
published: true
---

## Why Multiplayer is Hard

I've been working on The Cube — a 4-player co-op FPS — for over a year now with Limeless Inc. Before this project, I'd built multiplayer games in game jams, but building a production multiplayer game is a completely different challenge.

Here's what I wish someone had told me.

## Rule #1: Never Trust the Client

This is the golden rule and I broke it immediately. My first implementation had clients reporting their own position authoritatively. It worked great in testing. It was a disaster once we introduced any latency.

The fix: server-authoritative movement with client-side prediction. The client predicts where it will be, but the server has final say. If the server disagrees, you reconcile.

## The Prediction-Reconciliation Loop

Here's the simplified flow:

1. Client records input + timestamp
2. Client predicts the result locally (immediate feedback)
3. Client sends input to server
4. Server processes input authoritatively
5. Server sends back state + the timestamp it processed
6. Client compares prediction vs server state
7. If they differ: rewind to server state, replay all unacknowledged inputs

Step 7 is where it gets tricky. You need to keep a buffer of recent inputs and be able to replay them against the corrected state. In Unity, this means your movement code needs to be deterministic and extractable from MonoBehaviour lifecycle.

## Bandwidth Management

Four players shooting, moving, and interacting generates a lot of data. We learned to:

- **Delta compress** — only send what changed since the last acknowledged state
- **Prioritize by relevance** — nearby players get more frequent updates
- **Quantize** — positions don't need float precision, 16-bit fixed point is often enough
- **Batch RPC calls** — instead of one RPC per bullet, batch them per frame

## The Lesson That Stuck

The biggest lesson: **design for latency from day one.** Retrofitting netcode onto a single-player game is pain. Every gameplay system — shooting, doors, pickups, timers — needs to account for the fact that two players might see different things at the same moment.

The Cube is still in development. Every week I learn something new about networking that makes me want to rewrite everything. That's normal. Ship anyway.
