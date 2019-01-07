import pageLoader from '../src';

describe('MockTest', () => {
  it('#first', () => {
    const data = pageLoader(1);
    expect(data).toEqual(1);
  });
});
