import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ManikAI from '../App';

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = vi.fn();

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ skills: [], quick_actions: [] }),
  })
);

describe('ManikAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app title', () => {
    render(<ManikAI />);
    const titles = screen.getAllByText('MANIK.AI');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders navigation tabs', () => {
    render(<ManikAI />);
    expect(screen.getByText('chat')).toBeDefined();
    expect(screen.getByText('skills')).toBeDefined();
    expect(screen.getByText('connect')).toBeDefined();
    expect(screen.getByText('brain')).toBeDefined();
  });

  it('renders quick action buttons on welcome screen', () => {
    render(<ManikAI />);
    expect(screen.getByText(/Write a Promo Script/)).toBeDefined();
    expect(screen.getByText(/Architect a Tool/)).toBeDefined();
  });

  it('renders input placeholder', () => {
    render(<ManikAI />);
    expect(screen.getByPlaceholderText('Bol bhai, kya banana hai...')).toBeDefined();
  });

  it('fetches config on mount', () => {
    render(<ManikAI />);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/config'));
  });
});
