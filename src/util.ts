import { Mocker } from 'ts-mockito/lib/Mock';

// eslint-disable-next-line @typescript-eslint/ban-types
export function betterMock<T>(clazz?: (new (...args: any[]) => T) | (Function & { prototype: T })): T {
  const mocker = new Mocker(clazz);
  mocker['excludedPropertyNames'] = ['hasOwnProperty', 'then'];
  return mocker.getMock();
}
