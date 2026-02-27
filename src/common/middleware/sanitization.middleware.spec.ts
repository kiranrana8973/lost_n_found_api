import { SanitizationMiddleware } from './sanitization.middleware';

describe('SanitizationMiddleware', () => {
  let middleware: SanitizationMiddleware;
  let mockNext: jest.Mock;
  let mockRes: any;

  beforeEach(() => {
    middleware = new SanitizationMiddleware();
    mockNext = jest.fn();
    mockRes = {};
  });

  it('should sanitize HTML tags from body', () => {
    const req = {
      body: { name: '<script>alert("xss")</script>' },
    } as any;
    middleware.use(req, mockRes, mockNext);
    expect(req.body.name).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should remove $ signs (NoSQL injection prevention)', () => {
    const req = {
      body: { filter: '$gt' },
    } as any;
    middleware.use(req, mockRes, mockNext);
    expect(req.body.filter).toBe('gt');
  });

  it('should skip email field', () => {
    const req = {
      body: { email: 'test@example.com' },
    } as any;
    middleware.use(req, mockRes, mockNext);
    expect(req.body.email).toBe('test@example.com');
  });

  it('should skip password field', () => {
    const req = {
      body: { password: 'p@$$w0rd<>' },
    } as any;
    middleware.use(req, mockRes, mockNext);
    expect(req.body.password).toBe('p@$$w0rd<>');
  });

  it('should skip username field', () => {
    const req = {
      body: { username: 'john$doe' },
    } as any;
    middleware.use(req, mockRes, mockNext);
    expect(req.body.username).toBe('john$doe');
  });

  it('should skip profilePicture field', () => {
    const req = {
      body: { profilePicture: 'pic$name.jpg' },
    } as any;
    middleware.use(req, mockRes, mockNext);
    expect(req.body.profilePicture).toBe('pic$name.jpg');
  });

  it('should not sanitize strings with @ (like emails in text)', () => {
    const req = {
      body: { text: 'Contact me at user@test.com' },
    } as any;
    middleware.use(req, mockRes, mockNext);
    expect(req.body.text).toBe('Contact me at user@test.com');
  });

  it('should not sanitize URLs', () => {
    const req = {
      body: { link: 'http://example.com/<path>' },
    } as any;
    middleware.use(req, mockRes, mockNext);
    expect(req.body.link).toBe('http://example.com/<path>');
  });

  it('should sanitize nested objects', () => {
    const req = {
      body: {
        nested: { name: '<b>bold</b>' },
      },
    } as any;
    middleware.use(req, mockRes, mockNext);
    expect(req.body.nested.name).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('should call next when body is empty', () => {
    const req = { body: undefined } as any;
    middleware.use(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
