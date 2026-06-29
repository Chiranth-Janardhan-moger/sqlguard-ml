# SQLGuard-ML: Core Security Features and Architecture

SQLGuard-ML is not just a pattern matcher; it is a hardened, enterprise-grade Web Application Firewall designed to operate under hostile conditions. Below is a comprehensive breakdown of the advanced security mechanisms built into the platform.

## 1. The Hybrid AI Bridge
Traditional WAFs rely on static heuristics, leading to false positives or zero-day bypasses. AI-only WAFs introduce massive latency to HTTP requests. SQLGuard-ML solves this with a Hybrid Bridge:
* **The Edge Node:** A blazing-fast Node.js Express middleware scans incoming requests using optimized RegEx heuristics for both SQLi and NoSQLi.
* **The Threshold Gate:** If a payload scores high (Confidence > 0.5), it is instantly blocked. If it scores low (Confidence < 0.2), it is instantly allowed.
* **The ML Core (CNN-LSTM):** If a payload is ambiguous, the Edge Node triggers an asynchronous POST request to a specialized Python FastAPI Deep Learning service. The neural network provides a highly accurate prediction in milliseconds without blocking the Node event loop.

## 2. Universal Vector Scanning (Parameter and Cookie Protection)
Standard middleware often only scans `req.body`, `req.query`, and `req.headers`. Attackers commonly bypass these checks by injecting malicious payloads into session cookies or dynamic route parameters (e.g., `/api/user/:id`).
* SQLGuard-ML scans the entire HTTP envelope, including `req.params` and `req.cookies`, ensuring there are no blind spots in the request lifecycle.

## 3. Deep Payload Decoding and Key-Scanning
Attackers attempt to hide payloads deep inside JSON structures or use URL/Base64 encoding.
* **Recursive Unwrapping:** The WAF intercepts and normalizes Base64 and deeply URL-encoded strings before running heuristics.
* **Key and Value Traversal:** A critical vulnerability in many WAFs is scanning only JSON values (e.g., `{"$where": "password == 'admin'"}`). By scanning only the value, the NoSQL injection operator `$where` is ignored. SQLGuard-ML recursively scans both the **Keys** and **Values** of every JSON object to ensure complete coverage.

## 4. Stack Overflow Denial of Service (DoS) Prevention
A common attack vector against recursive JSON parsers is sending a maliciously crafted, infinitely nested JSON object (e.g., `{"a":{"b":{"c": ...}}}`). This causes a "Maximum call stack size exceeded" error, crashing the Express server.
* SQLGuard-ML implements a hard recursion depth limit (`currentDepth > 20`). If exceeded, the request is instantly dropped and logged as a DoS attempt, protecting the server's uptime.

## 5. ML Resource Exhaustion Prevention (DDoS Protection)
If an attacker sends a JSON array containing 10,000 "borderline" payloads, the Node server would normally attempt to make 10,000 HTTP `fetch` requests to the Python ML server. This exhausts network connections and locks the event loop.
* SQLGuard-ML enforces a strict ML call rate limit (`MAX_ML_CALLS = 10` per request). If an attacker spams borderline strings to trigger the AI, the middleware falls back to strict heuristic blocking instantly.

## 6. Python Out-of-Memory (OOM) Protection
If an attacker discovers the internal Python ML backend URL and POSTs a massive string (e.g., 1-Gigabyte), the deep learning model will attempt to allocate massive memory tensors, resulting in an OOM crash.
* The Python FastAPI backend utilizes strict Pydantic `max_length=50000` validation. Massive payloads are rejected at the network edge with a `422 Unprocessable Entity` error before they are processed by TensorFlow.
