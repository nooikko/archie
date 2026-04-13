export type FeedbackCategory = 'data-correction' | 'new-game' | 'missing-info' | 'community-feedback' | 'other';

export const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string; description: string }[] = [
  { value: 'data-correction', label: 'Data Correction', description: 'Something in an existing entry is wrong' },
  { value: 'new-game', label: 'New Game', description: 'A game is missing from the directory' },
  { value: 'missing-info', label: 'Missing Info', description: 'An entry is incomplete or has blank fields' },
  { value: 'community-feedback', label: 'Community Feedback', description: 'General thoughts, suggestions, or questions' },
  { value: 'other', label: 'Other', description: 'Anything that does not fit the above' },
];

// Categories where a game name is required
export const CATEGORY_REQUIRES_GAME = new Set<FeedbackCategory>(['data-correction', 'missing-info', 'new-game']);
// Categories where a game name is optional (may or may not relate to a specific game)
export const CATEGORY_GAME_OPTIONAL = new Set<FeedbackCategory>(['community-feedback', 'other']);

export interface FeedbackSubmission {
  gameName: string; // empty string when not applicable
  category: FeedbackCategory;
  description: string;
  downloadUrl?: string; // new-game only
  contactInfo?: string;
  honeypot?: string;
}

export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
  data?: FeedbackSubmission;
}

const VALID_CATEGORIES = new Set<string>(['data-correction', 'new-game', 'missing-info', 'community-feedback', 'other']);

export function validateFeedback(body: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (typeof body !== 'object' || body === null) {
    return { success: false, errors: { form: 'Invalid request body' } };
  }

  const raw = body as Record<string, unknown>;

  const category = typeof raw.category === 'string' ? raw.category.trim() : '';
  if (!category) {
    errors.category = 'Category is required';
  } else if (!VALID_CATEGORIES.has(category)) {
    errors.category = 'Invalid category';
  }

  const gameName = typeof raw.gameName === 'string' ? raw.gameName.trim() : '';
  const requiresGame = category && CATEGORY_REQUIRES_GAME.has(category as FeedbackCategory);
  if (requiresGame && !gameName) {
    errors.gameName = 'Game name is required';
  } else if (gameName.length > 200) {
    errors.gameName = 'Game name must be 200 characters or fewer';
  }

  const description = typeof raw.description === 'string' ? raw.description.trim() : '';
  if (!description) {
    errors.description = 'Description is required';
  } else if (description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (description.length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer';
  }

  const downloadUrl = typeof raw.downloadUrl === 'string' ? raw.downloadUrl.trim() : undefined;
  if (downloadUrl && downloadUrl.length > 500) {
    errors.downloadUrl = 'URL must be 500 characters or fewer';
  }

  const contactInfo = typeof raw.contactInfo === 'string' ? raw.contactInfo.trim() : undefined;
  if (contactInfo && contactInfo.length > 200) {
    errors.contactInfo = 'Contact info must be 200 characters or fewer';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    errors: {},
    data: {
      gameName,
      category: category as FeedbackCategory,
      description,
      downloadUrl: downloadUrl || undefined,
      contactInfo: contactInfo || undefined,
      honeypot: typeof raw.honeypot === 'string' ? raw.honeypot : '',
    },
  };
}
