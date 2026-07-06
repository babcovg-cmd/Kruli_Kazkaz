"use client";

// Rich-text редактор на Tiptap для описаний/программы/условий тура.
// Выдаёт HTML через onChange.

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function Btn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`rte-btn ${active ? "active" : ""}`}
      onMouseDown={(e) => e.preventDefault()} // не терять фокус редактора
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3, 4] },
      }),
    ],
    content: value,
    immediatelyRender: false, // важно для Next.js SSR
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rte-content",
        "data-placeholder": placeholder || "Введите текст…",
      },
    },
  });

  // Синхронизируем внешнее значение (например, при загрузке тура на редактирование).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) {
    return <div className="rte-content" style={{ borderRadius: 8 }} />;
  }

  return (
    <div>
      <div className="rte-toolbar">
        <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Жирный">
          <b>Ж</b>
        </Btn>
        <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Курсив">
          <i>К</i>
        </Btn>
        <Btn
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Заголовок"
        >
          H3
        </Btn>
        <Btn
          active={editor.isActive("heading", { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          title="Подзаголовок"
        >
          H4
        </Btn>
        <Btn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Маркированный список"
        >
          • —
        </Btn>
        <Btn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Нумерованный список"
        >
          1.
        </Btn>
        <Btn onClick={() => editor.chain().focus().setParagraph().run()} title="Обычный текст">
          ¶
        </Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
