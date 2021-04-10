import { Abstract, ModuleMetadata, Type } from "@nestjs/common";
import { MetadataScanner } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { mock } from "ts-mockito";
import {
  MockedModule,
  MockedModuleBuilder,
} from "mock-nest-abstract";

export type TypeOrToken<TInput = any> =
  | Type<TInput>
  | Abstract<TInput>
  | string
  | symbol;

export type MockMap = Map<TypeOrToken<any>, any>;

export class MockitoModule extends MockedModule<any> {
  public mockMap: MockMap;

  getMock<TInput = any>(typeOrToken: TypeOrToken<TInput>): TInput {
    return undefined;
  }
  setMock<TInput = any>(typeOrToken: TypeOrToken<TInput>, mock: TInput): this {
    return this;
  }
}

export class MockitoModuleBuilder extends MockedModuleBuilder<any> {
  public mockMap: MockMap;

  constructor(
    mockMap: MockMap,
    metadataScanner: MetadataScanner,
    metadata: ModuleMetadata
  ) {
    super(metadataScanner, metadata);
    this.mockMap = mockMap;
  }

  async compileMocked(): Promise<MockitoModule> {
    const parent = await super.compile();

    return Object.assign(parent, {
        mockMap: this.mockMap,
    } as MockitoModule);
  }
}
