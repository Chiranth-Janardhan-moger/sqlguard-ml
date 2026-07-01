# 🚀 Launching SQLGuard-ML v1.2.0: The Production-Ready Express WAF

Hey everyone,

I'm excited to announce the release of **SQLGuard-ML v1.2.0**! 🎉 

When I first started this project, the goal was simple: stop SQL Injection and XSS before it hits the database. Over the past few days, the project underwent a massive security audit and complete architectural overhaul to transition from an experimental package into a hardened, production-grade Web Application Firewall (WAF) for Express.js.

If you are running a Node/Express backend and want plug-and-play protection against the most common payload attacks, SQLGuard-ML provides a strict heuristic engine out-of-the-box (with an optional ML bridge for anomaly detection).

## 🛡️ What's New in v1.2.0?

We've fundamentally rewritten the core engine to ensure it stands up to real-world, adversarial fuzzing:

* **Deep-Layer Unpacking**: Attackers love hiding payloads in multiple layers of encoding. `v1.2.0` recursively decodes URL strings (up to 5 layers deep), unpacks Base64 payloads, and strips inline SQL comments (e.g. `UN/**/ION`) *before* pattern scanning begins. Double-encoded XSS (`%253Cscript%253E`) doesn't bypass us anymore.
* **Intelligent Rate Limiting**: Sending one weird payload might be a fluke; sending 500 mutated variants is a probe. We introduced an **IP Rate Limiter** with a sliding time window that escalates ambiguous/borderline probes into blocked attacks if an IP is acting suspiciously.
* **Full Surface Area Coverage**: The middleware now deeply traverses and scans `req.query`, `req.body`, `req.params`, `req.cookies`, *and* `req.headers` (like `User-Agent` and `X-Forwarded-For`).
* **Attribute-Injection Detection**: We completely overhauled the XSS pattern matching to correctly catch HTML attribute injections (e.g. `onmouseover="alert(1)"`) even when there is no wrapping `<script>` or HTML tag.
* **Zero-Dependency Core**: The npm package runs strictly on native JavaScript. No bloated `node_modules`.

## 📦 How to Use It

It's designed to be a one-liner drop-in:

```javascript
const express = require('express');
const { expressMiddleware } = require('sqlguard-ml');

const app = express();
app.use(express.json());

// Drop it in globally
app.use(expressMiddleware({ 
  threshold: 0.5, 
  maxSuspiciousRequests: 3 
}));

app.get('/', (req, res) => res.send("You are protected."));
```

## 🤝 Open Source & Honest
We're keeping the heuristics engine 100% open source on NPM. (The Python ML bridge is available in the repository if you want to self-host the AI anomaly detection).

We just locked our test suite at 20/20 passing adversarial bypass tests. We'd love for the community to try and break it. 

Check out the repository here: [GitHub - SQLGuard-ML](https://github.com/Chiranth-Janardhan-moger/sqlguard-ml)
Install it via NPM: `npm i sqlguard-ml`

Let me know what you think, and PRs for new evasion payloads are always welcome!
