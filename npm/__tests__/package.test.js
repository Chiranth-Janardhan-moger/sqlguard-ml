const pkg = require('../package.json');

describe('package metadata', () => {
  it('should declare the runtime actually required by the CLI and ML bridge', () => {
    expect(pkg.engines.node).toBe('>=18.0.0');
  });

  it('should publish runtime files only', () => {
    expect(pkg.files).toEqual(['bin', 'src', '__tests__']);
  });
});
