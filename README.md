# NestJS Auto Mockito

This is a specific implementation of `nestjs-auto-mock`, using `ts-mockito` as the chosen mocking/spying module. Adds an easy way to automatically add mocks of dependencies from the service/controller being tested.

It adds auto mocking of given providers, being it directly or a given module(s) providers.

The mocked service used depends on the actual implementation.

## Base documentation

For more documentation check the abstract module <https://github.com/MigasEu/nestjs-auto-mock>

## Features

### Automatically mocking providers

Automatically reads module like metadata and finds what providers can be mocked.
It will create a mock and an instance for each one of those, using `ts-mockito`.

Instance is provided to nest's testing module like any other provider and the mock is stored, allowing the user to get it easily, with the `.getMock()` function.

#### Exceptions

Most providers will be automatically mocked, unless we can't find a corresponding *Class* for that provider.
When a provider is configured as a factory and a string identifier (`provide`), we do not know what to mock, so it is ignored.

Example: `{ provide: 'providerIdentifier', useFactory: () => { return {a: 1}; }}`

You can create and add [add-ons](https://github.com/MigasEu/nestjs-auto-mock#add-ons) to avoid this issue.

### Mocking providers of a given module

It can reads the metadata for existing modules recursively to create mocks for all the providers withing that module, including nested ones.

## Usage Example

```typescript
  beforeEach(async () => {
    const app = await MockitoTest.createMockitoModule(
      // Real metadata (will start a real service instance)
      {
        providers: [SomeService],
      },
      // Metadata to mock (Providers under SomeModule will also be mocked)
      {
        providers: [
          // Mocking directly a given provider
          {
            provide: getLoggerToken(SomeService.name),
            useClass: PinoLogger,
          },
          MailerService,
        ],
        // Mocking all providers found (deep) inside a given Module
        imports: [SomeModule],
      },
    ).compileMocked();

    service = app.get<SomeService>(SomeService);
    repositoryMock = app.getMock<Repository<SomeEntity>>(
      getRepositoryToken(SomeEntity),
    );
    configMock = app.getMock(ConfigService);
    mailerService = app.getMock(MailerService);
  });

  // (...)

  it('should have only main price', async () => {
    // (...)

    when(repositoryMock.create(anything() as SomeEntity)).thenReturn(SomeEntity);
    when(repositoryMock.save(anything())).thenResolve(SomeEntity);

    const result = await service.create(createDto);

    expect(result).toEqual({ newSomeEntity: SomeEntity, session: stripeSession });
    verify(repositoryMock.create(deepEqual(createDto))).once();
    verify(
    repositoryMock.save(
        deepEqual(
        Object.assign(new SomeEntity(), {
            ...SomeEntity,
            active: false,
        }),
        ),
    ),
    ).once();
  });
```
