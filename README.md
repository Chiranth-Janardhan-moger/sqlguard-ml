# SQLGuard ML (Machine Learning Injection Detector)

<div align="center">
  <img src="https://img.shields.io/npm/v/sqlguard-ml?color=blue&style=for-the-badge" alt="NPM Version">
  <img src="https://img.shields.io/github/actions/workflow/status/Chiranth-Janardhan-moger/sqlguard-ml/ci.yml?branch=main&style=for-the-badge" alt="CI Status">
  <img src="https://img.shields.io/npm/dt/sqlguard-ml?style=for-the-badge" alt="NPM Downloads">
</div>

> **Advanced ML-powered SQL Injection (SQLi) and Cross-Site Scripting (XSS) detection engine.** Includes a Node.js heuristic scanner, Express.js middleware, and a Python FastAPI detector for maximum web application security.

## Quick Start (Node.js)

Install the package globally or in your project via NPM:

```bash
# To use as a CLI tool or middleware in your project
npm install sqlguard-ml

# To install globally for terminal usage anywhere
npm install -g sqlguard-ml
```

See the [Usage](#-usage) section below for how to integrate it into Express.js!

---

## Overview

**SQLGuard ML** is a powerful cybersecurity tool for detecting SQL Injection (SQLi) and Cross-Site Scripting (XSS) attacks in real-time. It provides a highly accurate **Machine Learning (CNN-LSTM)** Python package and a blazing fast **Heuristic-based** Node.js package.



## Features

- **Hybrid AI Bridge**: Automatically queries the Python Machine Learning engine for a second opinion on borderline payloads to drastically reduce false positives.
- **NoSQL Injection Detection**: Captures modern NoSQL injection attempts (e.g., MongoDB `$where`, `$ne`, `$gt`).
- **Deep Payload Decoding**: Unravels multi-layer URL encoding, Hex, and Base64 payloads before scanning to catch obfuscated attacks.
- **Express.js Middleware**: Plug-and-play middleware that automatically scans `req.query`, `req.body`, and `req.headers`.
- **ReDoS Protection**: Enforces strict payload length caps to prevent Regular Expression Denial of Service.
- **Dual Architecture**: Use the ultra-fast Node.js heuristics for high-throughput edge scanning, and the Python CNN-LSTM deep learning model for offline or API-based deep inspection.
---
---

## Installation

SQLGuard ML is designed to be easily installable via your favorite package managers!

### Node.js / NPM (Heuristic Scanner)
To install the fast heuristic CLI and NPM library globally:

```bash
npm install -g sqlguard-ml
```

Or install it as a dependency in your project:
```bash
npm install sqlguard-ml
```

### Python / PyPI (Machine Learning Detector)
To install the deep-learning based detector and CLI:

```bash
pip install sqlguard-ml
```

*(Note: Ensure you are using Python 3.10+ for full TensorFlow compatibility).*

---

## Usage

### Using the NPM Package (`sqlguard-ml`)
Once installed, you can use the Node CLI from anywhere:

```bash
# Scan a single payload
sqlguard-ml scan "<script>alert('XSS')</script>"

# Scan a file of payloads and output as CSV
sqlguard-ml scan-file payloads.txt --format csv
```

**As a Node.js Library:**
```javascript
const { Detector } = require('sqlguard-ml');

const detector = new Detector();
const result = detector.detect("' OR 1=1 --");

console.log(result.label); // 'sqli'
console.log(result.confidence);
```

### Using as Express.js Middleware (Advanced)
You can easily protect your Express.js applications by plugging in the `expressMiddleware`. It supports a Hybrid AI bridge to reduce false positives.

```javascript
const express = require('express');
const { expressMiddleware } = require('sqlguard-ml');

const app = express();

app.use(expressMiddleware({
  threshold: 0.5,
  mlEndpoint: 'http://127.0.0.1:8000/api/detect' // Optional: Fallback to Python AI for borderline payloads
}));

app.get('/api/data', (req, res) => {
  res.send("If you see this, your request was safe!");
});

app.listen(3000);
```

### Using the Python ML Package (`sqlguard`)
Once installed via pip, the Python CLI is immediately available:

```bash
# Detect attacks using the CLI
sqlguard detect "admin' --"

# Run the Machine Learning API Backend
uvicorn sqlguard_ml.api:app --port 8000
```

---

## Publishing the Packages (For Maintainers)

Want to publish these to the official registries so that `npm i` and `pip install` work for the public? Here's how:

**Publish to NPM:**
```bash
cd npm
npm login
npm publish
```

**Publish to PyPI:**
```bash
cd python
pip install build twine
python -m build
twine upload dist/*
```

---



## Contributing
Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License
Copyright © 2026. This project is [MIT](LICENSE) licensed.



