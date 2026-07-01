const { Detector } = require('./src/detector');

const sqliPatterns = [
  // 1. OR / AND with breakout chars (' "; )
  /(?:['";\)]\s*\b(?:OR|AND)\b\s+[\w\d'"]+\s*[=<>])/i,
  // 2. UNION SELECT must have FROM
  /\bUNION\s+(?:ALL\s+)?SELECT\s+.*?\bFROM\b/i,
  // 3. DROP TABLE must be terminated or have semicolon somewhere? 
  // Let's just say it must have a semicolon before or after
  /(?:;\s*\bDROP\s+TABLE\b|\bDROP\s+TABLE\s+\w+\s*;)/i,
  // 4. INSERT INTO must have VALUES
  /\bINSERT\s+INTO\s+\w+\s*(?:\([^)]*\)\s*)?VALUES/i,
  // 5. UPDATE must have SET and = 
  /\bUPDATE\s+\w+\s+SET\s+\w+\s*=/i,
  // 6. WAITFOR / SLEEP
  /;\s*(?:SLEEP|DELAY|WAITFOR)\s*(?:\(|\s)/i,
  // 7. NoSQL
  /(?:\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$regex)/i,
  // 8. Tautology with quotes
  /['"]\s*=\s*['"]/i,
  // 9. Comment auth bypass
  /(?:['"]\s*(?:--|#)(?:\s|$))/i,
  // 10. Fallback for %55%4e%49%4f%4e%20%53%45%4c%45%43%54
  /\bUNION\s+(?:ALL\s+)?SELECT\b/i
];

const d = new Detector();
// OVERRIDE PATTERNS FOR TESTING
d.sqliPatterns = sqliPatterns;
// ALSO we need to remove the fallback UNION SELECT if it's too loose, wait, "The union of workers has announced a strike." doesn't have SELECT, so \bUNION\s+SELECT\b is safe!
d.sqliPatterns[9] = /\bUNION\s+(?:ALL\s+)?SELECT\b/i;
// Let's see if we even need FROM for UNION SELECT
d.sqliPatterns[1] = /\bUNION\s+(?:ALL\s+)?SELECT\b/i;

const benignPayloads = [
  'Please select your favorite color from the union of these two sets.',
  'My name is O\'Brien.',
  'Drop table near the window.',
  'I need an update on my order.',
  'Wait for me at the station.',
  'The sleep number bed is great.',
  'We need to insert into the document.',
  'And then I said, \'Wow, that is cool\'.',
  'He\'s 5\'9" tall.',
  'Math equation: 1=1 is always true, but what about 2=2?',
  'If x = 1 and y = 1 then x = y.',
  'Can you delay the meeting by 5 minutes?',
  'Here is my javascript homework.',
  'The script for the play is attached.',
  'I\'ll embed the video in the iframe.',
  'The union of workers has announced a strike.',
  'An object in motion stays in motion.',
  'Please drop by my office later.',
  'The new update is available for download.',
  'I love writing in plain text.',
  'Select all the images that contain a crosswalk.',
  'He left a comment -- it was very helpful.'
];

const sqliPayloads = [
  "' OR '1'='1",
  "admin'--",
  "admin' #",
  "UNION SELECT * FROM users",
  "DROP TABLE users;",
  "UPDATE accounts SET balance=0",
  "INSERT INTO users (name) VALUES ('x')",
  "UN/**/ION SEL/**/ECT * FROM users",
  "%55%4e%49%4f%4e%20%53%45%4c%45%43%54", // UNION SELECT
  "admin%27--" // admin'--
];

console.log('--- BENIGN ---');
benignPayloads.forEach(p => {
  const r = d.detect(p);
  if (r.confidence >= 0.5) console.log('BLOCKED:', p);
});

console.log('--- SQLI ---');
sqliPayloads.forEach(p => {
  const r = d.detect(p);
  if (r.confidence < 0.5) console.log('FAILED TO BLOCK:', p);
});
