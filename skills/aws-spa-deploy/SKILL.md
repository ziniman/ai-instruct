---
name: aws-spa-deploy
description: 'Use this skill whenever the user is deploying a React/Vite single-page app to AWS, or mentions Amplify Hosting, amplify.yml, CDK, Lambda function URLs, or wiring up Lambda + API Gateway for a frontend. Covers Amplify hosting (SPA rewrites, build cache, Node version, security headers), custom domains and certificates, CDK backend (Lambda Node.js 24 + HTTP API or function URLs), SES email, CORS configuration, and Vite environment variables. Skip for non-AWS hosts (Vercel, Netlify, Cloudflare Pages), pure backend services without an SPA, or server-rendered apps (Next.js SSR on Vercel).'
---

# Deploying a Static SPA on AWS

> Applies to: React/Vite SPAs on AWS (Amplify Hosting + CDK) | Updated: October 2026

A focused guide for deploying a React/Vite single-page app on AWS with an optional API backend built with the AWS CDK (Cloud Development Kit). Covers Amplify Hosting, Lambda behind API Gateway or a function URL, and SES (Simple Email Service) email.

---

## Section 0: Before You Start

Answer these questions before generating any code. Each has a default assumption  -  confirm or override before proceeding.

**Q: Do you need a backend API, or is this a static site with no server logic?**
Default: static only, with no backend. In that case skip the entire CDK section.

**Q: Do you have a custom domain name you want to use?**
Default: no  -  skip the domain and SSL subsections.

**Q: What is your target AWS region, and does it match your default AWS CLI region?**
Default: us-east-1. Check with `aws configure get region`. If they differ, pass `--region` explicitly to every CLI command and pin the region in the CDK app (see CDK section).

**Q: Do you need to send emails from the site (contact forms, notifications)?**
Default: no  -  skip the SES section entirely.

**Q: Is this a brand new AWS account?**
Default: no (existing account). If new: SES starts in sandbox mode in every region (it can only send to verified addresses), CDK bootstrap is required before any deploy, and accounts created on or after July 15, 2025 use the credit-based Free Tier (see cost table).

**Q: What is the expected traffic?**
Default: low (a few visitors per day)  -  this typically costs $0 to a few cents per month. See cost table below.

> **AI assistant:** If the user only needs static hosting, generate only the Amplify Hosting section. Only include CDK/Lambda/SES content if they confirm they need a backend. For new Lambda functions use `lambda.Runtime.NODEJS_24_X` with an async handler.

---

## Contents

This guide is split into reference files. Use the Section 0 answers to decide which apply, then read only those; skip the rest.

- [Architecture](references/architecture.md): Starting out, to see how Amplify Hosting, the separate CDK backend, and VITE_* variables fit together (and when an amplify/ directory means a different setup).
- [Costs at a glance](references/costs-at-a-glance.md): The user asks what the stack will cost or which free allowances apply.
- [Amplify Hosting](references/amplify-hosting.md): Setting up or fixing Amplify Hosting: amplify.yml, SPA rewrites, custom domain and SSL, environment variables, build cache, Node.js version, or security headers.
- [CDK Backend](references/cdk-backend.md): Adding or changing the backend: API Gateway vs Lambda function URLs, Lambda runtime, project structure, bootstrapping, the minimal stack, CORS, and deploy order.
- [SES Email](references/ses-email.md): The backend sends email: domain verification, IAM scoping, sending from Lambda, abuse controls, and leaving the SES sandbox.
- [Common problems](references/common-problems.md): Something is broken: symptom to fix table, Amplify build logs, CORS errors, and Lambda timeouts.
