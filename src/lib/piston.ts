
export interface PistonExecutionResult {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
  };
}

export interface PistonLanguage {
  language: string;
  version: string;
  aliases: string[];
}

class PistonService {
  private baseUrl = 'https://emkc.org/api/v2/piston';

  async getLanguages(): Promise<PistonLanguage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/runtimes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  }

  async executeCode(
    language: string,
    code: string,
    input: string = ''
  ): Promise<PistonExecutionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          version: '*',
          files: [
            {
              name: `main.${this.getFileExtension(language)}`,
              content: code,
            },
          ],
          stdin: input,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  }

  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      typescript: 'ts',
    };
    return extensions[language] || 'txt';
  }

  mapLanguageName(displayName: string): string {
    const mapping: Record<string, string> = {
      'JavaScript': 'javascript',
      'Python': 'python',
      'C++': 'cpp',
      'HTML/CSS/JS': 'javascript', // For HTML, we'll run the JS part
    };
    return mapping[displayName] || displayName.toLowerCase();
  }
}

export const pistonService = new PistonService();
