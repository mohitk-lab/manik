import { describe, it, expect } from 'vitest';
import { detectSkills, SKILLS } from '../constants';

describe('detectSkills', () => {
  it('detects promo skill from script-related keywords', () => {
    const result = detectSkills('write a promo script for bhojpuri show', SKILLS);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe('promo');
  });

  it('detects architect skill', () => {
    const result = detectSkills('build a fastapi backend with react frontend', SKILLS);
    expect(result.some(s => s.id === 'architect')).toBe(true);
  });

  it('returns empty array for unrelated text', () => {
    const result = detectSkills('random gibberish xyz123', SKILLS);
    expect(result.length).toBe(0);
  });

  it('returns max 4 skills', () => {
    const result = detectSkills('promo script bhojpuri voice elevenlabs fastapi react remotion video daksh pipeline', SKILLS);
    expect(result.length).toBeLessThanOrEqual(4);
  });
});
