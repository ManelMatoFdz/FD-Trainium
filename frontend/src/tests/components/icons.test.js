import { iconMap, getHeroIcon } from '../../modules/common/components/icons';

describe('icons mapping', () => {
  it('getHeroIcon returns a value for mapped names', () => {
    const Icon = getHeroIcon('fa-plus');
    expect(Icon).toBeTruthy();
  });

  it('getHeroIcon returns null for unknown names', () => {
    expect(getHeroIcon('fa-non-existent')).toBeNull();
  });

  it('iconMap contains some expected keys', () => {
    expect(iconMap['fa-filter']).toBeDefined();
    expect(iconMap['fa-calendar']).toBeDefined();
  });
});
