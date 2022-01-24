import { Mocker } from 'ts-mockito/lib/Mock';

// eslint-disable-next-line @typescript-eslint/ban-types
export function betterMock<T>(clazz?: (new (...args: any[]) => T) | (Function & { prototype: T })): T {
  const mocker = new Mocker(clazz);
  // eslint-disable-next-line dot-notation
  mocker['excludedPropertyNames'] = ['hasOwnProperty', 'then'];
  return mocker.getMock();
}
