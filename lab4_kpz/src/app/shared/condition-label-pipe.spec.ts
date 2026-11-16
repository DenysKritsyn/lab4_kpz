import { ConditionLabelPipe } from './condition-label-pipe';

describe('ConditionLabelPipe', () => {
  it('should transform numeric condition state IDs into readable labels', () => {
    const pipe = new ConditionLabelPipe();

    expect(pipe.transform(1)).toBe('1 - Critical');
    expect(pipe.transform(3)).toBe('3 - Moderate');
    expect(pipe.transform(5)).toBe('5 - Excellent');
    expect(pipe.transform(99)).toBe('Unknown');
  });
});

