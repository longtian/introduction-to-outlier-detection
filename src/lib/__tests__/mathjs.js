import { median } from 'mathjs';

it('median', () => {
  expect(median([1, 2, 3, 4, 5])).toBe(3);
  expect(median([1, 2, 3, 4])).toBe(2.5);
});
