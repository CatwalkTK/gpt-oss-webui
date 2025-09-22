'use client'

import React from 'react'
import 'katex/dist/katex.min.css'
// @ts-ignore
import katex from 'katex'

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  
  const processContent = () => {
    const lines = content.split('\n')
    const result: React.ReactNode[] = []
    let tableRows: string[] = []
    let latexBlock: string[] = []
    let inLatexBlock = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // LaTeX block expressions \[ ... \] (multi-line support)
      if (line.includes('\\[')) {
        // Flush any pending table
        if (tableRows.length > 0) {
          result.push(renderTable(tableRows, `table-${i}`))
          tableRows = []
        }
        
        inLatexBlock = true
        const latexStart = line.indexOf('\\[')
        const beforeLatex = line.slice(0, latexStart)
        
        // Add any text before the LaTeX block
        if (beforeLatex.trim()) {
          result.push(
            <p key={`before-latex-${i}`} className="my-2">
              {renderInlineFormatting(beforeLatex, `before-latex-${i}`)}
            </p>
          )
        }
        
        // Check if LaTeX ends on same line
        if (line.includes('\\]')) {
          const latexEnd = line.indexOf('\\]', latexStart)
          const latexContent = line.slice(latexStart + 2, latexEnd)
          const afterLatex = line.slice(latexEnd + 2)
          
          try {
            const rendered = katex.renderToString(latexContent, {
              displayMode: true,
              throwOnError: false
            })
            result.push(
              <div key={`latex-block-${i}`} className="my-4 p-4 bg-gpt-gray-700 rounded-lg overflow-x-auto text-center">
                <div dangerouslySetInnerHTML={{ __html: rendered }} />
              </div>
            )
          } catch (e) {
            result.push(
              <div key={`latex-block-${i}`} className="my-4 p-4 bg-gpt-gray-700 rounded-lg overflow-x-auto text-center">
                <span className="text-lg text-blue-300 font-mono whitespace-pre-wrap">{latexContent}</span>
              </div>
            )
          }
          
          // Add any text after the LaTeX block
          if (afterLatex.trim()) {
            result.push(
              <p key={`after-latex-${i}`} className="my-2">
                {renderInlineFormatting(afterLatex, `after-latex-${i}`)}
              </p>
            )
          }
          
          inLatexBlock = false
        } else {
          latexBlock = [line.slice(latexStart + 2)]
        }
        continue
      }
      
      if (inLatexBlock) {
        if (line.includes('\\]')) {
          const latexEnd = line.indexOf('\\]')
          latexBlock.push(line.slice(0, latexEnd))
          
          const latexContent = latexBlock.join('\n')
          try {
            const rendered = katex.renderToString(latexContent, {
              displayMode: true,
              throwOnError: false
            })
            result.push(
              <div key={`latex-block-${i}`} className="my-4 p-4 bg-gpt-gray-700 rounded-lg overflow-x-auto text-center">
                <div dangerouslySetInnerHTML={{ __html: rendered }} />
              </div>
            )
          } catch (e) {
            result.push(
              <div key={`latex-block-${i}`} className="my-4 p-4 bg-gpt-gray-700 rounded-lg overflow-x-auto text-center">
                <span className="text-lg text-blue-300 font-mono whitespace-pre-wrap">{latexContent}</span>
              </div>
            )
          }
          
          const afterLatex = line.slice(latexEnd + 2)
          if (afterLatex.trim()) {
            result.push(
              <p key={`after-latex-${i}`} className="my-2">
                {renderInlineFormatting(afterLatex, `after-latex-${i}`)}
              </p>
            )
          }
          
          inLatexBlock = false
          latexBlock = []
        } else {
          latexBlock.push(line)
        }
        continue
      }
      
      // Horizontal rule
      if (line.trim() === '---') {
        // Flush any pending table
        if (tableRows.length > 0) {
          result.push(renderTable(tableRows, `table-${i}`))
          tableRows = []
        }
        
        result.push(<hr key={`hr-${i}`} className="my-4 border-gpt-gray-600" />)
        continue
      }
      
      // Table rows
      if (line.includes('|') && line.trim().startsWith('|') && line.trim().endsWith('|')) {
        tableRows.push(line)
        continue
      } else if (tableRows.length > 0) {
        // End of table, render it
        result.push(renderTable(tableRows, `table-${i}`))
        tableRows = []
      }
      
      // Headers
      if (line.startsWith('# ')) {
        result.push(<h1 key={`h1-${i}`} className="text-2xl font-bold my-4">{line.slice(2)}</h1>)
      } else if (line.startsWith('## ')) {
        result.push(<h2 key={`h2-${i}`} className="text-xl font-bold my-3">{line.slice(3)}</h2>)
      } else if (line.startsWith('### ')) {
        result.push(<h3 key={`h3-${i}`} className="text-lg font-bold my-2">{line.slice(4)}</h3>)
      }
      // Lists
      else if (line.match(/^\s*[-•*]\s/)) {
        const listItem = line.replace(/^\s*[-•*]\s/, '')
        result.push(
          <div key={`list-${i}`} className="ml-4 my-1">
            • {renderInlineFormatting(listItem, `list-${i}`)}
          </div>
        )
      }
      // Empty lines
      else if (line.trim() === '') {
        result.push(<div key={`empty-${i}`} className="my-2"></div>)
      }
      // Regular paragraphs
      else {
        result.push(
          <p key={`para-${i}`} className="my-2">
            {renderInlineFormatting(line, `para-${i}`)}
          </p>
        )
      }
    }
    
    // Render any remaining table
    if (tableRows.length > 0) {
      result.push(renderTable(tableRows, 'table-final'))
    }
    
    return result
  }
  
  const renderTable = (rows: string[], keyPrefix: string): React.ReactNode => {
    
    // Filter out empty rows and separator rows
    const validRows = rows.filter(row => {
      const trimmed = row.trim()
      return trimmed.length > 0 && !trimmed.match(/^\|[\s\-\|]*\|$/)
    })
    
    if (validRows.length === 0) return null
    
    const tableData = validRows.map(row => 
      row.split('|').slice(1, -1).map(cell => cell.trim())
    )
    
    if (tableData.length === 0) return null
    
    const hasHeaders = tableData.length > 1
    const headerRow = hasHeaders ? tableData[0] : []
    const bodyRows = hasHeaders ? tableData.slice(1) : tableData
    
    return (
      <div key={keyPrefix} className="my-4 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gpt-gray-600">
          {hasHeaders && (
            <thead>
              <tr className="bg-gpt-gray-700">
                {headerRow.map((header, idx) => (
                  <th key={`${keyPrefix}-header-${idx}`} className="px-4 py-2 text-left border-b border-r border-gpt-gray-600 font-medium last:border-r-0">
                    {renderInlineFormatting(header, `${keyPrefix}-header-${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row, rowIdx) => (
              <tr key={`${keyPrefix}-row-${rowIdx}`} className="border-b border-gpt-gray-700 last:border-b-0">
                {row.map((cell, cellIdx) => (
                  <td key={`${keyPrefix}-cell-${rowIdx}-${cellIdx}`} className="px-4 py-2 border-r border-gpt-gray-600 last:border-r-0">
                    {renderInlineFormatting(cell, `${keyPrefix}-cell-${rowIdx}-${cellIdx}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  const renderInlineFormatting = (text: string, keyPrefix: string): React.ReactNode => {
    
    // Handle inline LaTeX expressions \( ... \)
    if (text.includes('\\(') && text.includes('\\)')) {
      const result: React.ReactNode[] = []
      let remaining = text
      let partIndex = 0
      
      while (remaining.includes('\\(')) {
        const start = remaining.indexOf('\\(')
        const end = remaining.indexOf('\\)', start)
        
        if (end === -1) break
        
        // Add text before LaTeX
        if (start > 0) {
          const beforeText = remaining.slice(0, start)
          result.push(renderFormattedText(beforeText, `${keyPrefix}-pre-${partIndex}`))
        }
        
        // Add LaTeX expression
        const latexExpr = remaining.slice(start + 2, end) // Remove \( and \)
        try {
          const rendered = katex.renderToString(latexExpr, {
            displayMode: false,
            throwOnError: false
          })
          result.push(
            <span key={`${keyPrefix}-latex-${partIndex++}`} className="inline-block bg-gpt-gray-700 px-2 py-1 rounded mx-1">
              <span dangerouslySetInnerHTML={{ __html: rendered }} />
            </span>
          )
        } catch (e) {
          result.push(
            <span key={`${keyPrefix}-latex-${partIndex++}`} className="bg-gpt-gray-700 px-2 py-1 rounded text-sm text-blue-300 font-mono">
              {latexExpr}
            </span>
          )
        }
        
        // Continue with remaining text
        remaining = remaining.slice(end + 2)
      }
      
      // Add remaining text
      if (remaining.length > 0) {
        result.push(renderFormattedText(remaining, `${keyPrefix}-post`))
      }
      
      return <React.Fragment key={`${keyPrefix}-fragment`}>{result}</React.Fragment>
    }

    return renderFormattedText(text, keyPrefix)
  }
  
  const renderFormattedText = (text: string, keyPrefix: string): React.ReactNode => {
    
    if (!text.includes('**') && !text.includes('*')) {
      return text
    }
    
    const result: React.ReactNode[] = []
    let remaining = text
    let partIndex = 0
    
    while (remaining.length > 0) {
      // Look for bold first (highest priority)
      const boldStart = remaining.indexOf('**')
      if (boldStart !== -1) {
        const boldEnd = remaining.indexOf('**', boldStart + 2)
        if (boldEnd !== -1) {
          // Add text before bold
          if (boldStart > 0) {
            const beforeText = remaining.slice(0, boldStart)
            if (beforeText.includes('*')) {
              result.push(renderFormattedText(beforeText, `${keyPrefix}-pre-${partIndex++}`))
            } else {
              result.push(<span key={`${keyPrefix}-text-${partIndex++}`}>{beforeText}</span>)
            }
          }
          
          // Add bold text
          const boldText = remaining.slice(boldStart + 2, boldEnd)
          result.push(<strong key={`${keyPrefix}-bold-${partIndex++}`} className="font-bold">{boldText}</strong>)
          
          // Continue with remaining text
          remaining = remaining.slice(boldEnd + 2)
          continue
        }
      }
      
      // Look for italic
      const italicStart = remaining.indexOf('*')
      if (italicStart !== -1) {
        const italicEnd = remaining.indexOf('*', italicStart + 1)
        if (italicEnd !== -1) {
          // Add text before italic
          if (italicStart > 0) {
            result.push(<span key={`${keyPrefix}-pre-italic-${partIndex++}`}>{remaining.slice(0, italicStart)}</span>)
          }
          
          // Add italic text
          const italicText = remaining.slice(italicStart + 1, italicEnd)
          result.push(<em key={`${keyPrefix}-italic-${partIndex++}`} className="italic">{italicText}</em>)
          
          // Continue with remaining text
          remaining = remaining.slice(italicEnd + 1)
          continue
        }
      }
      
      // No more formatting found
      if (remaining.length > 0) {
        result.push(<span key={`${keyPrefix}-remaining-${partIndex}`}>{remaining}</span>)
      }
      break
    }
    
    return <React.Fragment key={`${keyPrefix}-text-fragment`}>{result}</React.Fragment>
  }

  return (
    <div className="max-w-none text-white">
      {processContent()}
    </div>
  )
}