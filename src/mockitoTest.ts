import {
  ClassProvider,
  FactoryProvider,
  ModuleMetadata,
  Provider,
  Type,
} from "@nestjs/common";
import { MockedModuleMetadata, MockedTest } from "mock-nest-abstract";
import { instance, mock } from "ts-mockito";
import { MockitoModuleBuilder, MockMap, TypeOrToken } from "./mockitoModule";
import { betterMock } from "./util";

export class MockitoTest extends MockedTest {
  static createMockedModule(
    metadata: ModuleMetadata,
    metadataToMock: MockedModuleMetadata
  ): MockitoModuleBuilder {
    const { mockMap, mockedMetadata } = MockitoTest.createMockedMetadata(
      metadataToMock
    );

    const parent = super.createTestingModule({
      ...mockedMetadata,
      ...metadata,
    });

    return Object.assign(parent, {
      mockMap: mockMap,
    } as MockitoModuleBuilder);
  }

  static createMockedMetadata(
    metadataToMock: MockedModuleMetadata,
  ): {
    mockedMetadata: ModuleMetadata;
    mockMap: MockMap;
  } {
    const mockMap: MockMap = new Map<TypeOrToken<any>, any>();
    const mockedMetadata: MockedModuleMetadata = {};
    mockedMetadata.providers = metadataToMock.providers.map((provider) =>
      MockitoTest.mockProvider(provider, mockMap)
    );

    return {
      mockedMetadata,
      mockMap,
    };
  }

  static mockProvider<T>(
    providerToMock: Provider<T>,
    mockMap: MockMap
  ): Provider<T> {
    const providerClass = providerToMock as ClassProvider;
    const providerFactory = providerToMock as FactoryProvider;
    const providerAsType = providerToMock as Type<any>;

    if (typeof providerAsType === "function" || providerClass.useClass) {
      const mocked = betterMock(providerClass.useClass || providerAsType);
      mockMap.set(providerClass.provide ?? providerAsType, mocked);
    }

    return {
      ...providerToMock,
      useFactory:
        providerFactory.useFactory &&
        this.mockFactoryTransformer(providerFactory, mockMap),
    } as Provider;
  }

  static mockFactoryTransformer<T = any>(
    providerFactory: FactoryProvider,
    mockMap: MockMap
  ): (...args: any[]) => Promise<T> {
    return async (...args) => {
      const mocked = await providerFactory.useFactory(args);

      mockMap.set(providerFactory.provide, mocked);
      return instance(mocked);
    };
  }
}
