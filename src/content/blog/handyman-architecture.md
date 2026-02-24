---
title: "From React Native to Full Stack"
excerpt: "Building a three-module service platform taught me more about architecture than any course. Here's how I structured the Handyman app."
date: "Sep 2023"
readTime: "5 min"
tags: ["React Native", "Full Stack"]
published: true
---

## The Problem

Build a service platform with three completely different user experiences:

1. **Customer app** — browse services, book, pay, rate
2. **Worker app** — accept jobs, navigate, track earnings
3. **Admin dashboard** — manage users, services, analytics

Three frontends, one backend. How do you structure this without losing your mind?

## Architecture Decisions

### Shared Backend, Separate Frontends

The backend is a single Node.js + Express API with MongoDB. All three frontends hit the same API but with different auth roles and permissions.

Why not microservices? Because this isn't Netflix. A well-structured monolith API is simpler to deploy, debug, and maintain for a team of one.

### React Native for Both Mobile Apps

Customer and Worker apps are both React Native. They share about 40% of their code:

- **Shared:** Auth flows, API client, notification handling, chat components
- **Different:** Navigation structure, home screens, core workflows

I used a monorepo structure with shared packages. Not a perfect solution — React Native monorepos have their quirks — but it saved significant time.

### Firebase for Real-Time

Real-time service matching uses Firebase Realtime Database. When a customer posts a job, nearby workers get notified instantly. Firebase handles the WebSocket complexity, and the main API handles everything else.

## Lessons Learned

1. **Design your data model for all three clients before writing code.** I refactored the database schema three times because I kept discovering edge cases from different user perspectives.
2. **Role-based API design is not an afterthought.** Every endpoint needs to know who's calling and what they're allowed to see.
3. **React Native code sharing sounds better than it is.** 40% shared code is good, but the 60% that's different is really different. Don't force shared components where the UX should diverge.

This project taught me more about real-world architecture than any course or tutorial. Highly recommend building something with multiple user types if you want to level up.
