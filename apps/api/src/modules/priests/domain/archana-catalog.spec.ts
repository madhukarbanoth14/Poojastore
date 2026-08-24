import {
  archanaDeityBySlug,
  priestMatchesArchanaDeity,
} from './archana-catalog';

describe('archana catalog', () => {
  it('resolves deity labels', () => {
    expect(archanaDeityBySlug('ganesha')?.name).toBe('Lord Ganesha');
    expect(archanaDeityBySlug('any')?.name).toBe('Any deity');
  });

  it('matches priests to deity or any', () => {
    expect(priestMatchesArchanaDeity(['ganesha'], 'ganesha')).toBe(true);
    expect(priestMatchesArchanaDeity(['ganesha'], 'lakshmi')).toBe(false);
    expect(priestMatchesArchanaDeity([], 'lakshmi')).toBe(true);
    expect(priestMatchesArchanaDeity(['ganesha'], 'any')).toBe(true);
  });
});
