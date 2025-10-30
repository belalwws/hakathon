'use client'

import React, { useRef, useEffect, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Code,
  Quote,
  Minus,
  Type,
  Palette,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({ value, onChange, placeholder = 'ابدأ الكتابة...', minHeight = '300px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selectedColor, setSelectedColor] = useState('#000000')

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertLink = () => {
    if (linkUrl) {
      applyFormatting('createLink', linkUrl)
      setLinkUrl('')
      setShowLinkDialog(false)
    }
  }

  const insertVariable = (variable: string) => {
    const selection = window.getSelection()
    if (selection && editorRef.current) {
      const range = selection.getRangeAt(0)
      const span = document.createElement('span')
      span.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm'
      span.textContent = variable
      span.contentEditable = 'false'
      range.insertNode(span)
      range.setStartAfter(span)
      range.setEndAfter(span)
      selection.removeAllRanges()
      selection.addRange(range)
      handleInput()
    }
  }

  const toolbarButtons = [
    {
      icon: Bold,
      command: 'bold',
      tooltip: 'عريض (Ctrl+B)',
      group: 'text'
    },
    {
      icon: Italic,
      command: 'italic',
      tooltip: 'مائل (Ctrl+I)',
      group: 'text'
    },
    {
      icon: Underline,
      command: 'underline',
      tooltip: 'تحته خط (Ctrl+U)',
      group: 'text'
    },
    {
      icon: Heading1,
      command: 'formatBlock',
      value: 'h1',
      tooltip: 'عنوان 1',
      group: 'heading'
    },
    {
      icon: Heading2,
      command: 'formatBlock',
      value: 'h2',
      tooltip: 'عنوان 2',
      group: 'heading'
    },
    {
      icon: Heading3,
      command: 'formatBlock',
      value: 'h3',
      tooltip: 'عنوان 3',
      group: 'heading'
    },
    {
      icon: AlignLeft,
      command: 'justifyLeft',
      tooltip: 'محاذاة لليسار',
      group: 'align'
    },
    {
      icon: AlignCenter,
      command: 'justifyCenter',
      tooltip: 'محاذاة للوسط',
      group: 'align'
    },
    {
      icon: AlignRight,
      command: 'justifyRight',
      tooltip: 'محاذاة لليمين',
      group: 'align'
    },
    {
      icon: List,
      command: 'insertUnorderedList',
      tooltip: 'قائمة نقطية',
      group: 'list'
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      tooltip: 'قائمة مرقمة',
      group: 'list'
    },
    {
      icon: Quote,
      command: 'formatBlock',
      value: 'blockquote',
      tooltip: 'اقتباس',
      group: 'special'
    },
    {
      icon: Code,
      command: 'formatBlock',
      value: 'pre',
      tooltip: 'كود',
      group: 'special'
    },
    {
      icon: Minus,
      command: 'insertHorizontalRule',
      tooltip: 'خط فاصل',
      group: 'special'
    }
  ]

  const variables = [
    { label: 'الاسم الكامل', value: '[الاسم الكامل]' },
    { label: 'البريد الإلكتروني', value: '[البريد الإلكتروني]' },
    { label: 'رقم الهاتف', value: '[رقم الهاتف]' },
    { label: 'اسم الهاكاثون', value: '[اسم الهاكاثون]' },
    { label: 'تاريخ البدء', value: '[تاريخ البدء]' },
    { label: 'تاريخ الانتهاء', value: '[تاريخ الانتهاء]' },
    { label: 'رابط التسجيل', value: '[رابط التسجيل]' },
    { label: 'رابط الدعوة', value: '[رابط الدعوة]' }
  ]

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff6600', '#6600ff',
    '#01645e', '#3ab666', '#c3e956', '#8b7632'
  ]

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          {toolbarButtons.filter(b => b.group === 'text').map((button, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              onClick={() => applyFormatting(button.command, button.value)}
              title={button.tooltip}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          {toolbarButtons.filter(b => b.group === 'heading').map((button, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              onClick={() => applyFormatting(button.command, button.value)}
              title={button.tooltip}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          {toolbarButtons.filter(b => b.group === 'align').map((button, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              onClick={() => applyFormatting(button.command, button.value)}
              title={button.tooltip}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          {toolbarButtons.filter(b => b.group === 'list').map((button, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              onClick={() => applyFormatting(button.command, button.value)}
              title={button.tooltip}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Special */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          {toolbarButtons.filter(b => b.group === 'special').map((button, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              onClick={() => applyFormatting(button.command, button.value)}
              title={button.tooltip}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Link */}
        <div className="border-l border-gray-300 pl-2">
          <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                title="إضافة رابط"
                className="h-8 w-8 p-0"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <Label>أدخل الرابط</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                />
                <Button onClick={insertLink} size="sm" className="w-full">
                  إدراج الرابط
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Color Picker */}
        <div className="border-l border-gray-300 pl-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                title="لون النص"
                className="h-8 w-8 p-0"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-3">
                <Label>اختر اللون</Label>
                <div className="grid grid-cols-7 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        applyFormatting('foreColor', color)
                        setSelectedColor(color)
                      }}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Variables */}
        <div className="border-l border-gray-300 pl-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                title="إدراج متغير"
                className="h-8 px-3"
              >
                <Type className="h-4 w-4 ml-1" />
                متغيرات
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <Label>اختر متغير لإدراجه</Label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {variables.map((variable) => (
                    <Button
                      key={variable.value}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-right"
                      onClick={() => insertVariable(variable.value)}
                    >
                      {variable.label}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 focus:outline-none prose prose-sm max-w-none"
        style={{ minHeight, direction: 'rtl' }}
        data-placeholder={placeholder}
      />

      <style jsx global>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        [contentEditable] blockquote {
          border-right: 4px solid #01645e;
          padding-right: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #4b5563;
        }
        [contentEditable] pre {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        [contentEditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          color: #01645e;
        }
        [contentEditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
          color: #01645e;
        }
        [contentEditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
          color: #01645e;
        }
        [contentEditable] ul, [contentEditable] ol {
          padding-right: 1.5rem;
        }
        [contentEditable] a {
          color: #3ab666;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
