import { ModuleMetadata } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { TestingModule } from '@nestjs/testing';
import { MockedModule, MockedModuleBuilder, MockMap, TypeOrToken } from 'nestjs-auto-mock';
import { spy } from 'ts-mockito';

export class MockitoModule extends MockedModule<any, any> {
  constructor(parent: TestingModule, protected mockMap: MockMap) {
    super(parent);
  }

  getMock<TInput = any>(typeOrToken: TypeOrToken<TInput>): TInput {
    return this.mockMap.get(typeOrToken);
  }

  getSpy<TInput = any>(typeOrToken: TypeOrToken<TInput>): TInput {
    return spy(this.get(typeOrToken));
  }
}

export class MockitoModuleBuilder extends MockedModuleBuilder<any, any> {
  constructor(protected mockMap: MockMap, metadataScanner: MetadataScanner, metadata: ModuleMetadata) {
    super(metadataScanner, metadata);
  }

  async compileMocked(): Promise<MockitoModule> {
    const parent = await super.compile();

    return new MockitoModule(parent, this.mockMap);
  }
}
