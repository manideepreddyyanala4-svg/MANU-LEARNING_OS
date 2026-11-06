/**
 * Saved-content indicators are separate from learning mastery.
 * A created topic, an empty paragraph, or a 'mastered' flag does NOT mean notes exist.
 */
export type NotePresence = 'none' | 'written' | 'image' | 'file' | 'mixed';

export type SavedTopicDocument = {
  topic_id: string;
  plain_text: string | null;
  content_json: unknown;
};

type BlockLike = {
  type?: unknown;
  text?: unknown;
  props?: { url?: unknown };
  content?: unknown;
  children?: unknown;
};

function scanBlocks(value: unknown, kinds: { text: boolean; image: boolean; file: boolean }): void {
  if (Array.isArray(value)) {
    for (const item of value) scanBlocks(item, kinds);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  const block = value as BlockLike;

  if (block.type === 'text' && typeof block.text === 'string' && block.text.trim()) {
    kinds.text = true;
  }
  if (block.type === 'image' && typeof block.props?.url === 'string' && block.props.url.trim()) {
    kinds.image = true;
  }
  if (block.type === 'file' && typeof block.props?.url === 'string' && block.props.url.trim()) {
    kinds.file = true;
  }
  scanBlocks(block.content, kinds);
  scanBlocks(block.children, kinds);
}

export function detectNotePresence(document: SavedTopicDocument): NotePresence {
  const kinds = { text: Boolean(document.plain_text?.trim()), image: false, file: false };
  scanBlocks(document.content_json, kinds);
  const present = Number(kinds.text) + Number(kinds.image) + Number(kinds.file);
  if (!present) return 'none';
  if (present > 1) return 'mixed';
  return kinds.text ? 'written' : kinds.image ? 'image' : 'file';
}

export function noteBadge(presence: NotePresence): { text: string; className: string } {
  switch (presence) {
    case 'written':
      return {
        text: 'Written notes',
        className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      };
    case 'image':
      return {
        text: 'Image notes',
        className: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
      };
    case 'file':
      return {
        text: 'File notes',
        className: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300',
      };
    case 'mixed':
      return {
        text: 'Notes added',
        className: 'border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300',
      };
    default:
      return {
        text: 'No notes yet',
        className: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      };
  }
}
