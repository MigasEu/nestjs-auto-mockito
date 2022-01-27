import { Module } from '@nestjs/common';
import { when } from 'ts-mockito';

import { MockitoTest } from '../src/mockitoTest';

// TODO: turn this into unit tests
class Class1 {
  test1() {
    return 1;
  }
}
class Class2 {
  test2() {
    return 2;
  }
}
class Class3 {
  test3() {
    return 3;
  }
}

@Module({
  providers: [Class3],
})
export class ModuleTest2 {}

@Module({
  imports: [ModuleTest2],
})
export class ModuleTest {}

(async () => {
  const mockedModule = await MockitoTest.createMockedModule(
    {
      providers: [Class1],
    },
    {
      imports: [ModuleTest],
      providers: [Class2],
    },
  ).compileMocked();

  console.log(mockedModule.get(Class1).test1());
  console.log(mockedModule.get(Class2).test2());
  console.log(mockedModule.get(Class3).test3());
  console.log(mockedModule.getMock(Class1));
  console.log(mockedModule.getMock(Class2));
  console.log(mockedModule.getMock(Class3));
  when(mockedModule.getMock(Class2).test2()).thenReturn(12);
  console.log(mockedModule.get(Class2).test2());
  when(mockedModule.getMock(Class3).test3()).thenReturn(13);
  console.log(mockedModule.get(Class3).test3());
})();
