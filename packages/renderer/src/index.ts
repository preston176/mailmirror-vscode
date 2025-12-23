import mjml2html from 'mjml';
import * as Maizzle from '@maizzle/framework';

export interface CompileResult {
  html: string;
  errors: string[];
}

/**
 * Compile MJML to HTML
 */
export function compileMJML(content: string): CompileResult {
  try {
    const result = mjml2html(content, {
      validationLevel: 'soft',
      minify: false
    });

    return {
      html: result.html,
      errors: result.errors.map(err => err.message)
    };
  } catch (error) {
    return {
      html: '',
      errors: [error instanceof Error ? error.message : 'Unknown MJML compilation error']
    };
  }
}

/**
 * Compile Maizzle template to HTML
 */
export async function compileMaizzle(content: string): Promise<CompileResult> {
  try {
    const result = await Maizzle.render(content, {
      tailwind: {
        config: {},
        css: ''
      },
      maizzle: {
        env: 'local'
      }
    });

    return {
      html: result.html,
      errors: []
    };
  } catch (error) {
    return {
      html: '',
      errors: [error instanceof Error ? error.message : 'Unknown Maizzle compilation error']
    };
  }
}

/**
 * Auto-detect and compile email template
 */
export async function compileEmail(content: string): Promise<CompileResult> {
  // Simple detection: if it has <mjml> tag, it's MJML
  if (content.trim().startsWith('<mjml') || content.includes('<mj-')) {
    return compileMJML(content);
  }

  // Otherwise, try Maizzle
  return compileMaizzle(content);
}
