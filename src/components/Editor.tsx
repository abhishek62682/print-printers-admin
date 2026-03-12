import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

export default function Editor({ content, setContent }) {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      Underline,
      Placeholder.configure({
        placeholder: "Write your blog content here..."
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    }
  });

  if (!editor) return null;

  const addImage = () => {
    const url = prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt("Enter link URL");
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div>

      <div className="toolbar">

        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>

        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>

        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
          Underline
        </button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullet List
        </button>

        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Ordered List
        </button>

        <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </button>

        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </button>

        <button onClick={addLink}>
          Link
        </button>

        <button onClick={addImage}>
          Image
        </button>

        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          HR
        </button>

        <button onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </button>

        <button onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </button>

      </div>

      <EditorContent editor={editor} />

    </div>
  );
}