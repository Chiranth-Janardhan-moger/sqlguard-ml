class IPRateLimiter {
  constructor(windowMs = 300000, maxCapacity = 10000) {
    this.windowMs = windowMs;
    this.maxCapacity = maxCapacity;
    this.ips = new Map();
  }
  
  recordSuspicious(ip) {
    const now = Date.now();
    if (!this.ips.has(ip)) {
      if (this.ips.size >= this.maxCapacity) {
        this.ips.delete(this.ips.keys().next().value);
      }
      this.ips.set(ip, []);
    }
    const timestamps = this.ips.get(ip);
    timestamps.push(now);
    
    // Cleanup old timestamps for this IP
    const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
    this.ips.set(ip, validTimestamps);
    return validTimestamps.length;
  }

}

module.exports = { IPRateLimiter };
