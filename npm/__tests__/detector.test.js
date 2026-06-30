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
    expect(detector.detect("admin' /*").label).toBe('benign'); // Without closing */ it might just be text, but let's stick to the assert for -- and #
  });
});
