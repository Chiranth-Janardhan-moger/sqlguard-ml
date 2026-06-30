# How I Built a Hybrid AI Web Application Firewall to Stop Zero-Day SQL Injections

As developers, we are constantly told to "sanitize our inputs." But in the modern web, relying solely on static regex patterns to catch SQL Injections (SQLi) and Cross-Site Scripting (XSS) is a losing battle. Attackers use deep URL encoding, base64 obfuscation, and zero-day NoSQL syntax that slip right past standard regex filters.

I wanted to build something better. I wanted a Web Application Firewall (WAF) that was as blazing fast as standard regex, but as smart as a Deep Learning model.

So, I built **SQLGuard ML**—a dual-architecture, AI-powered WAF that acts as Express.js middleware.

Here is a deep dive into the technical architecture of how it works.

---

## 1. The Dual Architecture Problem

Using Machine Learning to scan every single HTTP request is computationally expensive. If you pipe every `req.body` into a Python deep learning model, your Node.js server's latency will skyrocket, and your API will bottleneck.

To solve this, I designed a **Dual Architecture**:
1. **The Edge Node (Fast Heuristics):** A lightweight Node.js Express middleware that acts as the first line of defense.
2. **The ML Core (Deep Learning):** A Python FastAPI backend running a CNN-LSTM model that acts as the "second opinion."

## 2. The Edge Node: Blazing Fast Heuristics

The Node.js middleware intercepts `req.query`, `req.body`, and `req.headers`. 

Before it even scans the payload, it runs a **Deep Payload Decoder**. Attackers often try to bypass WAFs by nesting encodings (e.g., URL encoding a Base64 string). The Edge Node recursively unwraps the payload:
- It caps the string at 50,000 characters to prevent ReDoS (Regular Expression Denial of Service).
- It attempts deeply nested `decodeURIComponent`.
- It dynamically detects and unpacks Base64 payloads.

Once the payload is normalized, it is run against a highly optimized set of RegEx heuristics targeting both traditional SQLi and modern NoSQLi (like MongoDB `$where` and `$ne` operators). 

## 3. The Hybrid AI Bridge

Here is where the magic happens. 

Standard WAFs operate on a binary pass/fail. SQLGuard ML operates on a **confidence threshold**.

- If the heuristic scores the payload at `Confidence > 0.5`, it is **instantly blocked** at the edge. Zero latency added.
- If the heuristic scores `Confidence < 0.2`, it is **instantly allowed**. Zero latency added.

But what if the payload is weird? What if it looks highly suspicious, scoring a `0.35`, but isn't an explicit match? 

Instead of guessing, the Node.js middleware triggers the **Hybrid AI Bridge**. It pauses the request and fires an asynchronous `POST` request to the Python ML Core.

```javascript
// Inside the Node.js Middleware
const mlRes = await fetch(mlEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: val })
});
```

## 4. The ML Core: CNN-LSTM Deep Learning

The Python backend is powered by **FastAPI** and **TensorFlow/Keras**. 

I trained a custom neural network using a massive dataset of known SQLi/XSS attack vectors and benign traffic. The architecture combines:
- **CNN (Convolutional Neural Networks):** Excellent at picking up spatial patterns and structural syntax anomalies in code.
- **LSTM (Long Short-Term Memory):** Excellent at understanding the sequential context of the payload.
- **Custom Attention Layer:** Highlights the exact characters in the sequence that indicate malicious intent.

Because the ML model runs as a separate microservice, it doesn't block the Node.js event loop. The Python API returns a prediction (`sqli`, `xss`, or `benign`) in milliseconds. 

If the ML Core flags it as an attack, the Node.js middleware instantly returns a `403 Forbidden`, blocking the attacker in their tracks.

## 5. Security by Design: Preventing the "Nested JSON" Bypass

During development, I found a critical vulnerability common in many open-source WAFs: they only scan the top-level keys of a JSON body. If an attacker sends `{ "user": { "name": "<script>alert(1)</script>" } }`, standard middleware misses it because the value is an `object`, not a `string`.

I patched this by implementing a **recursive deep scanner** that safely traverses arbitrarily nested JSON bodies, ensuring no payload can hide deep within the object tree.

## Conclusion

By combining the raw speed of Node.js heuristics with the deep analytical power of a Python CNN-LSTM model, SQLGuard ML achieves the best of both worlds: ultra-low latency for normal traffic, and impenetrable security for zero-day attacks.

The project is entirely open source. If you are building a Node.js API and want to protect it, you can drop it into your project today:

```bash
npm install sqlguard-ml
```

Check out the code on GitHub: https://github.com/Chiranth-Janardhan-moger/sqlguard-ml

I'd love to hear your feedback or thoughts on this architecture!
