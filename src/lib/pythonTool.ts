export interface PythonToolConfig {
  enabled: boolean
  maxExecutionTime: number // milliseconds
  allowFileSystem: boolean
  allowNetworking: boolean
}

export class PythonTool {
  private config: PythonToolConfig

  constructor(config: PythonToolConfig = {
    enabled: false,
    maxExecutionTime: 30000,
    allowFileSystem: false,
    allowNetworking: false
  }) {
    this.config = config
  }

  isEnabled(): boolean {
    return this.config.enabled
  }

  getToolDescription(): string {
    if (!this.isEnabled()) return ''

    return `
Python Code Execution Tool Available:
- You can execute Python code to solve problems, perform calculations, and analyze data
- Use the format: \`\`\`python to start a code block
- Supported libraries: numpy, pandas, matplotlib, requests (basic scientific computing)
- Security restrictions: ${this.config.allowFileSystem ? 'File system access allowed' : 'No file system access'}, ${this.config.allowNetworking ? 'Network access allowed' : 'No network access'}
- Execution timeout: ${this.config.maxExecutionTime / 1000} seconds

Example usage:
\`\`\`python
import numpy as np
import matplotlib.pyplot as plt

# Generate sample data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create plot
plt.figure(figsize=(10, 6))
plt.plot(x, y)
plt.title('Sine Wave')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.grid(True)
plt.show()
\`\`\`

The code execution environment is sandboxed for security.
`
  }

  async executePythonCode(code: string): Promise<{ output: string; error?: string; executionTime: number }> {
    if (!this.isEnabled()) {
      return {
        output: '',
        error: 'Python tool is not enabled.',
        executionTime: 0
      }
    }

    const startTime = Date.now()

    try {
      // This is a demonstration implementation
      // In a real implementation, you would:
      // 1. Use a sandboxed Python environment (Docker, WebAssembly, etc.)
      // 2. Implement proper security restrictions
      // 3. Handle stdout/stderr capture
      // 4. Manage execution timeouts
      // 5. Support popular libraries

      const result = await this.simulatePythonExecution(code)
      const executionTime = Date.now() - startTime

      return {
        output: result.output,
        error: result.error,
        executionTime
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      return {
        output: '',
        error: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime
      }
    }
  }

  private async simulatePythonExecution(code: string): Promise<{ output: string; error?: string }> {
    // This is a simulation for demonstration purposes
    // In a real implementation, this would execute actual Python code

    if (code.includes('import')) {
      const imports = code.match(/import\s+[\w\s,\.]+/g) || []
      const importList = imports.join(', ')

      if (code.includes('matplotlib') || code.includes('plt')) {
        return {
          output: `📊 Code executed successfully!\n\nImports detected: ${importList}\n\n[Note: In a full implementation, this would show the actual matplotlib plot]\n\nGraph would be displayed here with the generated visualization.`
        }
      }

      if (code.includes('numpy') || code.includes('pandas')) {
        return {
          output: `🔢 Code executed successfully!\n\nImports detected: ${importList}\n\n[Note: In a full implementation, this would show the actual numerical computation results]\n\nNumerical results would be displayed here.`
        }
      }
    }

    if (code.includes('print(')) {
      const printStatements = code.match(/print\([^)]+\)/g) || []
      return {
        output: `✅ Code executed successfully!\n\nOutput:\n${printStatements.map(stmt => `> ${stmt}`).join('\n')}\n\n[Note: This is a simulation. In a full implementation, actual print output would be shown]`
      }
    }

    return {
      output: `✅ Code executed successfully!\n\n[Note: This is a demonstration. To implement real Python execution, you would need:\n\n1. Sandboxed execution environment (Docker, Pyodide, etc.)\n2. Security restrictions and input validation\n3. Library management (numpy, pandas, matplotlib, etc.)\n4. Output capture and formatting\n5. Error handling and timeouts\n\nThe code would be executed in a secure environment.]`
    }
  }

  processMessage(message: string): { processedMessage: string; hasCodeExecution: boolean } {
    if (!this.isEnabled()) {
      return { processedMessage: message, hasCodeExecution: false }
    }

    let processedMessage = message
    let hasCodeExecution = false

    // Process ```python code blocks
    const pythonCodePattern = /```python\n([\s\S]*?)\n```/g
    processedMessage = processedMessage.replace(pythonCodePattern, (match, code) => {
      hasCodeExecution = true

      // Execute the code (in a real implementation)
      const executionPromise = this.executePythonCode(code.trim())

      return `\`\`\`python\n${code}\n\`\`\`\n\n🐍 **Python Execution Result:**\n${this.simulatePythonExecution(code.trim()).then(result => result.output).catch(err => `Error: ${err}`)}`
    })

    return { processedMessage, hasCodeExecution }
  }
}

export const pythonTool = new PythonTool({
  enabled: true,
  maxExecutionTime: 30000,
  allowFileSystem: false,
  allowNetworking: false
})