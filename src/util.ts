import { instance } from '@johanblumenberg/ts-mockito';
import { Mocker, MockPropertyPolicy } from '@johanblumenberg/ts-mockito/lib/Mock';

// eslint-disable-next-line @typescript-eslint/ban-types
export function betterMock<T>(clazz?: (new (...args: any[]) => T) | (Function & { prototype: T })): T {
  const mocker = new Mocker(clazz, MockPropertyPolicy.StubAsProperty);
  mocker['excludedPropertyNames'] = ['hasOwnProperty', 'then'];

  const moc = mocker.getMock();
  delete instance(moc).then;

  return moc;
}
