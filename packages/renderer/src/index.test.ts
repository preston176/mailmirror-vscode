import { compileMJML, compileMaizzle, compileEmail } from './index';

describe('Email Renderer', () => {
  describe('compileMJML', () => {
    it('should compile valid MJML to HTML', () => {
      const mjml = `
        <mjml>
          <mj-body>
            <mj-section>
              <mj-column>
                <mj-text>Hello World!</mj-text>
              </mj-column>
            </mj-section>
          </mj-body>
        </mjml>
      `;

      const result = compileMJML(mjml);

      expect(result.html).toBeTruthy();
      expect(result.html).toContain('Hello World!');
      expect(result.html).toContain('<!doctype html>');
      expect(result.errors).toHaveLength(0);
    });

    it('should handle MJML errors gracefully', () => {
      const invalidMjml = '<mjml><mj-invalid></mjml>';
      const result = compileMJML(invalidMjml);

      expect(result.html).toBeTruthy();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should compile MJML with buttons and images', () => {
      const mjml = `
        <mjml>
          <mj-body>
            <mj-section>
              <mj-column>
                <mj-image src="https://example.com/logo.png" alt="Logo" />
                <mj-button href="https://example.com">Click Me</mj-button>
              </mj-column>
            </mj-section>
          </mj-body>
        </mjml>
      `;

      const result = compileMJML(mjml);

      expect(result.html).toContain('https://example.com/logo.png');
      expect(result.html).toContain('Click Me');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('compileMaizzle', () => {
    it('should compile basic Maizzle template', async () => {
      const template = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              .text-blue { color: blue; }
            </style>
          </head>
          <body>
            <div class="text-blue">Hello from Maizzle!</div>
          </body>
        </html>
      `;

      const result = await compileMaizzle(template);

      expect(result.html).toBeTruthy();
      expect(result.html).toContain('Hello from Maizzle!');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('compileEmail', () => {
    it('should auto-detect MJML and compile', async () => {
      const mjml = `
        <mjml>
          <mj-body>
            <mj-section>
              <mj-column>
                <mj-text>Auto-detected MJML</mj-text>
              </mj-column>
            </mj-section>
          </mj-body>
        </mjml>
      `;

      const result = await compileEmail(mjml);

      expect(result.html).toContain('Auto-detected MJML');
      expect(result.errors).toHaveLength(0);
    });

    it('should auto-detect Maizzle template', async () => {
      const template = `
        <!DOCTYPE html>
        <html>
          <body>
            <div>Auto-detected Maizzle</div>
          </body>
        </html>
      `;

      const result = await compileEmail(template);

      expect(result.html).toContain('Auto-detected Maizzle');
    });
  });
});
