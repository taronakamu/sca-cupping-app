import { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { BookOpen } from "lucide-react";

interface UsageGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function UsageGuideModal({ open, onClose }: UsageGuideModalProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}USAGE_GUIDE.md`);
        const markdown = await response.text();
        
        // Configure marked options
        marked.setOptions({
          breaks: true,
          gfm: true,
        });
        
        const html = await marked(markdown);
        const sanitizedHtml = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'hr'],
          ALLOWED_ATTR: ['href', 'target', 'rel']
        });
        
        setHtmlContent(sanitizedHtml);
      } catch (error) {
        console.error("Failed to load usage guide:", error);
        setHtmlContent("<p>Failed to load usage guide.</p>");
      }
    };

    if (open) {
      loadMarkdown();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col gap-0">
        <DialogHeader className="px-8 pt-8 pb-6 border-b shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <DialogTitle>使い方ガイド</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            SCA Cupping Appの使い方ガイドです。カッピング評価の方法を詳しく説明します。
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden px-8">
          <div className="h-full overflow-y-auto overflow-x-hidden py-6 pr-2">
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
        
        <div className="px-8 py-6 border-t shrink-0">
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-[#2C2C2C] hover:bg-[#1a1a1a]"
          >
            はじめる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
