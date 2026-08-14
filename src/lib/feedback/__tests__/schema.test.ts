import { describe, expect, it } from 'vitest';
import { CATEGORY_REQUIRES_GAME, type FeedbackCategory, validateFeedback } from '../schema';

const valid = {
  gameName: 'Chrono Trigger',
  category: 'data-correction',
  description: 'The platform field says SNES but it should say SNES/PS1.',
};

describe('validateFeedback', () => {
  it('accepts a well-formed submission', () => {
    const result = validateFeedback(valid);

    expect(result.success).toBe(true);
    expect(result.data?.gameName).toBe('Chrono Trigger');
    expect(result.data?.category).toBe('data-correction');
  });

  it.each([null, undefined, 'a string', 42, true])('rejects a non-object body: %s', (body) => {
    expect(validateFeedback(body).success).toBe(false);
  });

  it('rejects a category outside the allow-list', () => {
    const result = validateFeedback({ ...valid, category: 'arbitrary-label' });

    expect(result.success).toBe(false);
    expect(result.errors.category).toBe('Invalid category');
  });

  it('rejects a missing category', () => {
    expect(validateFeedback({ ...valid, category: '' }).errors.category).toBe('Category is required');
  });

  it.each([...CATEGORY_REQUIRES_GAME])('requires a game name for category %s', (category) => {
    const result = validateFeedback({ ...valid, category, gameName: '' });

    expect(result.success).toBe(false);
    expect(result.errors.gameName).toBe('Game name is required');
  });

  it.each(['community-feedback', 'other'] satisfies FeedbackCategory[])('allows an absent game name for category %s', (category) => {
    expect(validateFeedback({ ...valid, category, gameName: '' }).success).toBe(true);
  });

  it('rejects a description below the minimum length', () => {
    expect(validateFeedback({ ...valid, description: 'too short' }).errors.description).toMatch(/at least 10/);
  });

  it('rejects a missing description', () => {
    expect(validateFeedback({ ...valid, description: '   ' }).errors.description).toBe('Description is required');
  });

  // Length caps are what keep an unbounded payload out of a GitHub issue body.
  it.each([
    ['gameName', 201, /200 characters/],
    ['description', 2001, /2000 characters/],
    ['downloadUrl', 501, /500 characters/],
    ['contactInfo', 201, /200 characters/],
  ])('caps %s length', (field, length, message) => {
    const result = validateFeedback({ ...valid, [field]: 'x'.repeat(length) });

    expect(result.success).toBe(false);
    expect(result.errors[field]).toMatch(message);
  });

  it('trims surrounding whitespace from accepted values', () => {
    const result = validateFeedback({ ...valid, gameName: '  Chrono Trigger  ' });

    expect(result.data?.gameName).toBe('Chrono Trigger');
  });

  it('ignores unexpected extra fields rather than passing them through', () => {
    const result = validateFeedback({ ...valid, isAdmin: true, labels: ['bug'] });

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('isAdmin');
    expect(result.data).not.toHaveProperty('labels');
  });

  it('normalises a non-string honeypot to an empty string', () => {
    expect(validateFeedback({ ...valid, honeypot: { nested: 'object' } }).data?.honeypot).toBe('');
  });

  it('preserves a filled honeypot so the route can discard the submission', () => {
    expect(validateFeedback({ ...valid, honeypot: 'bot-filled' }).data?.honeypot).toBe('bot-filled');
  });

  it('reports every invalid field at once', () => {
    const result = validateFeedback({ gameName: '', category: '', description: '' });

    expect(Object.keys(result.errors).sort()).toEqual(['category', 'description']);
  });
});
