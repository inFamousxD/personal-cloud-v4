import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text } from 'mdast';

/**
 * Custom remark plugin that transforms :::indent marker into em-space indentation.
 * 
 * Usage in markdown:
 * :::indent This paragraph will have a nice indent at the start.
 * 
 * Or at the start of a line within a paragraph:
 * :::indent First indented paragraph.
 * :::indent Second indented paragraph.
 */

const INDENT_MARKER = ':::';
const EM_SPACES = '\u2003\u2003\u2003'; 

export const remarkIndent: Plugin<[], Root> = () => {
    return (tree: Root) => {
        visit(tree, 'text', (node: Text) => {
            if (node.value.includes(INDENT_MARKER)) {
                // Replace all occurrences of the marker with em spaces
                node.value = node.value.replace(
                    new RegExp(INDENT_MARKER + '\\s*', 'g'),
                    EM_SPACES
                );
            }
        });
    };
};

export default remarkIndent;