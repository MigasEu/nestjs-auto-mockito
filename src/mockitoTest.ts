import { ClassProvider, FactoryProvider, ModuleMetadata, Provider, Type } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { MockedModuleMetadata, MockedTest } from 'nestjs-auto-mock';
import { instance } from 'ts-mockito';
import { MockitoModuleBuilder, MockMap, TypeOrToken } from './mockitoModule';
import { betterMock } from './util';

export class MockitoTest extends MockedTest {
  static mockedMetadataScanner = new MetadataScanner();

  static createMockedModule(
    metadata: ModuleMetadata = {},
    metadataToMock: MockedModuleMetadata = {},
    deepModuleMocked = true,
  ): MockitoModuleBuilder {
    const { mockMap, mockedMetadata } = MockitoTest.createMockedMetadata(metadataToMock, deepModuleMocked);

    const mergedMetadata: ModuleMetadata = {
      ...metadata,
      providers: [...(mockedMetadata.providers ?? []), ...(metadata.providers ?? [])],
    };

    return new MockitoModuleBuilder(mockMap, MockitoTest.mockedMetadataScanner, mergedMetadata);
  }

  static createMockedMetadata(
    metadataToMock: MockedModuleMetadata,
    deepModuleMocked = true,
  ): {
    mockedMetadata: ModuleMetadata;
    mockMap: MockMap;
  } {
    const mockMap: MockMap = new Map<TypeOrToken<any>, any>();
    const mockedMetadata: MockedModuleMetadata = {};
    const allProviders = [
      ...MockedTest.providersFromModules(metadataToMock.imports ?? [], deepModuleMocked),
      ...(metadataToMock.providers ?? []),
    ];

    mockedMetadata.providers = allProviders.map((provider) => MockitoTest.mockProvider(provider, mockMap));

    return {
      mockedMetadata,
      mockMap,
    };
  }

  static mockProvider<T>(providerToMock: Provider<T>, mockMap: MockMap): Provider<T> {
    const providerClass = providerToMock as ClassProvider;
    const providerFactory = providerToMock as FactoryProvider;
    const providerAsType = providerToMock as Type<any>;

    let useValue: any;
    if (typeof providerAsType === 'function' || providerClass.useClass) {
      const mocked = betterMock(providerClass.useClass || providerAsType);
      useValue = instance(mocked);
      mockMap.set(providerClass.provide ?? providerAsType, mocked);
    }

    return {
      ...providerToMock,
      provide: providerClass.provide ?? providerAsType,
      useValue: useValue,
      useFactory: providerFactory.useFactory && this.mockFactoryTransformer(providerFactory, mockMap),
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
