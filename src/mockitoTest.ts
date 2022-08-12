import { ClassProvider, FactoryProvider, ModuleMetadata, Provider, Type } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { MockedModuleBuilder, MockedModuleMetadata, MockedTest, MockMap } from 'nestjs-auto-mock';
import { instance, mock } from '@johanblumenberg/ts-mockito';

import { MockitoModuleBuilder } from './mockitoModule';
import { betterMock } from './util';

export class MockitoTest extends MockedTest {
  static mockedMetadataScanner = new MetadataScanner();

  static createMockitoModule(
    metadata: ModuleMetadata = {},
    metadataToMock: MockedModuleMetadata = {},
    deepModuleMocked = true,
  ): MockitoModuleBuilder {
    return super.createMockedModule<any, any>(metadata, metadataToMock, deepModuleMocked) as MockitoModuleBuilder;
  }

  static mockedModuleBuilderFactory(mockMap: MockMap, mergedMetadata: ModuleMetadata): MockedModuleBuilder<any, any> {
    return new MockitoModuleBuilder(mockMap, MockitoTest.mockedMetadataScanner, mergedMetadata);
  }

  static mockProvider<T>(providerToMock: Provider<T>, mockMap: MockMap): Provider<T> {
    const providerClass = providerToMock as ClassProvider;
    const providerFactory = providerToMock as FactoryProvider;
    const providerAsType = providerToMock as Type<any>;

    let useValue: any;
    if (typeof providerAsType === 'function' || providerClass.useClass) {
      const mocked = mock(providerClass.useClass || providerAsType);
      useValue = instance(mocked);
      mockMap.set(providerClass.provide ?? providerAsType, mocked);
    }

    return {
      ...providerToMock,
      provide: providerClass.provide ?? providerAsType,
      useValue: useValue,
      useFactory: providerFactory.useFactory && this.mockFactoryTransformer(providerFactory, mockMap),
      useClass: undefined,
    } as Provider;
  }

  static mockFactoryTransformer<T = any>(
    providerFactory: FactoryProvider,
    mockMap: MockMap,
  ): (...args: any[]) => Promise<T> {
    return async (...args) => {
      const mocked = await providerFactory.useFactory(args);

      mockMap.set(providerFactory.provide, mocked);
      return instance(mocked);
    };
  }
}
