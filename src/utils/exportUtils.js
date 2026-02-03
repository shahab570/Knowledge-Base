import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export const exportNoteToDocx = async (title, htmlContent) => {
    // Simple HTML to Text conversion for V1.
    // In a production app, we would walk the DOM and map to docx Paragraphs/Runs.
    const div = document.createElement("div");
    div.innerHTML = htmlContent;

    // Basic extraction of paragraphs
    const children = [];

    // Title
    children.push(new Paragraph({
        text: title || "Untitled Note",
        heading: HeadingLevel.TITLE,
        spacing: { after: 300 }
    }));

    // Iterate child nodes (Assuming P tags mostly)
    div.childNodes.forEach(node => {
        if (node.nodeName === 'P' || node.nodeName === 'DIV') {
            children.push(new Paragraph({
                text: node.textContent,
                spacing: { after: 120 }
            }));
        } else if (node.nodeName.startsWith('H')) {
            // Handle headings
            const level = node.nodeName;
            children.push(new Paragraph({
                text: node.textContent,
                heading: level === 'H1' ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 }
            }));
        } else if (node.nodeName === 'UL') {
            // Basic list support
            node.childNodes.forEach(li => {
                children.push(new Paragraph({
                    text: `• ${li.textContent}`,
                    indent: { left: 720 }, // 0.5 inch
                }));
            });
        } else if (node.textContent.trim()) {
            // Fallback
            children.push(new Paragraph({
                text: node.textContent,
                spacing: { after: 120 }
            }));
        }
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || 'note'}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
};
