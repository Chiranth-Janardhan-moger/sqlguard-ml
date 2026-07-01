const { Detector } = require('../src/detector');

describe('Detector', () => {
  let detector;

  beforeEach(() => {
    detector = new Detector();
  });

  test('should detect benign payloads', () => {
    const result = detector.detect('hello world');
    expect(result.label).toBe('benign');
    expect(result.confidence).toBe(0);
  });

  test('should detect basic SQLi', () => {
    const result = detector.detect("' OR '1'='1");
    expect(result.label).toBe('sqli');
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('should detect basic XSS', () => {
    const result = detector.detect('<script>alert("XSS")</script>');
    expect(result.label).toBe('xss');
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('should not false positive on bare single quote or names', () => {
    const result1 = detector.detect("O'Brien");
    const result2 = detector.detect("SELECT * FROM users WHERE name = 'test'");
    expect(result1.label).toBe('benign');
    expect(result2.label).toBe('benign');
  });

  test('should detect comment obfuscated SQLi bypasses', () => {
    const result = detector.detect("UN/**/ION SEL/**/ECT * FROM users");
    expect(result.label).toBe('sqli');
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('should detect multi-encoded payloads', () => {
    // %253Cscript%253Ealert(1)%253C%252Fscript%253E -> %3Cscript%3E... -> <script>...
    const result = detector.detect('%253Cscript%253Ealert(1)%253C%252Fscript%253E');
    expect(result.label).toBe('xss');
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('should detect comment-terminated auth bypasses', () => {
    expect(detector.detect("admin'--").label).toBe('sqli');
    expect(detector.detect("admin' --").label).toBe('sqli');
    expect(detector.detect("admin'#").label).toBe('sqli');
  });

  describe('Comprehensive 27-Vector Regression Suite', () => {
    test('Benign Text & Normal English', () => {
      const benignPayloads = [
        "hello world",
        "O'Brien",
        "SELECT * FROM users WHERE name = 'test'",
        "The script is ready",
        "javascript is a programming language",
        "I need to drop by the table",
        "Nothing to see here"
      ];
      for (const payload of benignPayloads) {
        expect(detector.detect(payload).label).toBe('benign');
      }
    });

    test('Standard SQL Injection (SQLi)', () => {
      const sqliPayloads = [
        "' OR '1'='1",
        "admin'--",
        "admin' #",
        "UNION SELECT * FROM users",
        "DROP TABLE users;",
        "UPDATE accounts SET balance=0",
        "INSERT INTO users (name) VALUES ('x')"
      ];
      for (const payload of sqliPayloads) {
        expect(detector.detect(payload).label).toBe('sqli');
      }
    });

    test('Obfuscated SQL Injection', () => {
      const obfuscatedSqli = [
        "UN/**/ION SEL/**/ECT * FROM users",
        "%55%4e%49%4f%4e%20%53%45%4c%45%43%54", // UNION SELECT
        "admin%27--" // admin'--
      ];
      for (const payload of obfuscatedSqli) {
        expect(detector.detect(payload).label).toBe('sqli');
      }
    });

    test('Cross-Site Scripting (XSS) with tags', () => {
      const xssPayloads = [
        "<script>alert(1)</script>",
        "<script>alert('XSS')",
        "<img onerror=alert(1)>",
        "<svg onload=alert(1)>",
        "<iframe src=\"javascript:alert(1)\">"
      ];
      for (const payload of xssPayloads) {
        expect(detector.detect(payload).label).toBe('xss');
      }
    });

    test('XSS without HTML Tags (Attribute Injection & Pseudo-protocols)', () => {
      const attributeXss = [
        "javascript:alert(1)",
        "onmouseover=\"alert(1)",
        "onfocus=eval(1)"
      ];
      for (const payload of attributeXss) {
        expect(detector.detect(payload).label).toBe('xss');
      }
    });

    test('Multi-layer Encoded XSS', () => {
      const encodedXss = [
        "%253Cscript%253Ealert(1)%253C%252Fscript%253E", // Double URL-encoded <script>
        "PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" // Base64 <script>alert(1)</script>
      ];
      for (const payload of encodedXss) {
        expect(detector.detect(payload).label).toBe('xss');
      }
    });

    test('NoSQL Injection', () => {
      const nosqlPayloads = [
        '{"$where": "this.password == \'admin\'"}',
        '{"$gt": ""}'
      ];
      for (const payload of nosqlPayloads) {
        expect(detector.detect(payload).label).toBe('sqli');
      }
    });
  });
});
