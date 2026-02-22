import StatusMessages from '../../modules/common/components/statusMessages';

describe('StatusMessages', () => {
  it('maps known statuses to keys', () => {
    expect(StatusMessages('ganando')).toBe('project.bid.status.winning');
    expect(StatusMessages('ganado')).toBe('project.bid.status.won');
    expect(StatusMessages('perdedora')).toBe('project.bid.status.lost');
  });

  it('defaults to unknown', () => {
    expect(StatusMessages('otro')).toBe('project.bid.status.unknown');
  });
});

