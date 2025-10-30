'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Type
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useState, useCallback } from 'react'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export function TipTapEditor({ content, onChange, placeholder = 'ابدأ الكتابة...', minHeight = '400px' }: TipTapEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [textColor, setTextColor] = useState('#000000')

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[' + minHeight + '] p-4 border rounded-md',
        dir: 'rtl',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setLinkUrl('')
    setShowLinkDialog(false)
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    const url = window.prompt('أدخل رابط الصورة:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run()
      setTextColor(color)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ onClick, active, disabled, children, title }: any) => (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  )

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="عريض (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="مائل (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="تحته خط (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="يتوسطه خط"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="كود"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="عنوان 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="عنوان 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="عنوان 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="قائمة نقطية"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="قائمة مرقمة"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="اقتباس"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="محاذاة لليسار"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="محاذاة للوسط"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="محاذاة لليمين"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            active={editor.isActive({ textAlign: 'justify' })}
            title="ضبط"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Color */}
        <div className="flex gap-1 border-r pr-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="لون النص">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <label className="text-sm font-medium">اختر لون النص:</label>
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-full"
                />
                <div className="grid grid-cols-6 gap-2">
                  {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080', '#808080'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="h-8 w-8 rounded border-2 border-gray-300 hover:border-gray-500"
                      style={{ backgroundColor: color }}
                      onClick={() => setColor(color)}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Link & Image */}
        <div className="flex gap-1 border-r pr-2">
          <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={editor.isActive('link') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                title="إضافة رابط"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <label className="text-sm font-medium">أدخل الرابط:</label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setLink()}
                />
                <Button onClick={setLink} className="w-full">إضافة</Button>
              </div>
            </PopoverContent>
          </Popover>
          <ToolbarButton onClick={addImage} title="إضافة صورة">
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="تراجع (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="إعادة (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  )
}

