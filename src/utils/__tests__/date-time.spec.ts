import { addHours, addMinutes, createDate } from '../date-time';

describe('Utils - date-time', () => {
  describe('date-time', () => {
    it('should add hours using addHours function', async () => {
      const startDate = new Date('12/04/2024 10:30 AM');
      const futureDate = addHours(new Date('12/04/2024 10:30 AM'), 1);

      expect(futureDate.getTime()).toEqual(startDate.getTime() + 3600000);
    });

    it('should add minutes using addMinutes function', async () => {
      const startDate = new Date('12/04/2024 10:30 AM');
      const futureDate = addMinutes(new Date('12/04/2024 10:30 AM'), 60);

      expect(futureDate.getTime()).toEqual(startDate.getTime() + 3600000);
    });

    it('should check positive createDate function', async () => {
      const startDate = createDate('12/04/2024 10:30 AM');

      expect(startDate.getTime()).toEqual(startDate.getTime());
    });
    it('should check negative createDate function', async () => {
      expect(() => createDate('2016--01---01')).toThrow(Error);
    });
  });
});
