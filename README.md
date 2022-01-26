# Container

This package contains a simple, lightweight dependency injection container. It's heavily inspired by tsyringe but has
some cool additional features and uses [my reflection library](https://github.com/baileyherbert/reflection).

- Transient & singleton resolution
- Child containers & container-scoped singleton resolution
- Decorators for singleton and transient registration
- Easily invoke methods with dependency injection
- Named global containers
- Easy container resolution within dependencies at constructor time

## Installation

```
npm install @baileyherbert/container
```

Make sure your `tsconfig.json` file specifies the following options:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
    }
}
```

## Documentation

### Global container

Import the global container from anywhere:

```ts
import { container } from '@baileyherbert/common';
```

### Registration

Then register your types using injection tokens using the register methods.

```ts
container.register(ClassType);
container.register(ClassType, { useClass: ClassType });
container.register(ClassType, { useValue: new ClassType() });
container.register(ClassType, { useFactory: () => new ClassType() });

container.registerSingleton(ClassType);
container.registerSingleton(ClassType, ClassType);

container.registerInstance(new ClassType());
container.registerInstance(ClassType, new ClassType());
```

When registering a class or token provider, or a type, you can provide a lifecycle:

```ts
container.register(ClassType, { lifecycle: Lifecycle.Singleton });
container.register(ClassType, { useClass: ClassType }, { lifecycle: Lifecycle.ContainerScoped });
```

- `Transient` creates a new instance for each resolution. This is the default.
- `Singleton` creates a single instance and caches it for subsequent resolutions.
- `ContainerScoped` creates a single instance per container (i.e. child containers will get their own).

### Decorators

For the container to successfully resolve dependencies, all classes added to it must have the `@Injectable` decorator
applied.

```ts
@Injectable()
export class ClassType {}
```

You can also register a class as a singleton on the global container using the `@Singleton` decorator. This will
also mark the class as injectable so there's no need to add the `@Injectable` decorator.

```ts
@Singleton()
export class ClassType {}
```

You can also enable dependency injection on a **class method** by applying the `@Injectable` decorator to it.

```ts
@Singleton()
export class ClassType {
    @Injectable()
    public methodWithDI() {

    }
}
```

There is a `@Transient` decorator that works just like `@Singleton` but registers the class as transient instead.

```ts
@Transient()
export class ClassType {

}
```

Finally the `@Token` decorator can be applied to method parameters in order to specify or override the injection
token. This is especially useful when dealing with circular dependencies.

```ts
public method(@Token('tokenName') param: any) {}
public method(@Token(Class) param: any) {}
public method(@Token(() => Class) param: any) {}
```

### Resolution

To resolve a single instance, use the `resolve` method. The last provider to be registered will be used.

```ts
const instance = container.resolve(ClassType);
```

If multiple providers are registered, you can retrieve all of their instances as an array with the `resolveAll` method.

```ts
const instances = container.resolveAll(ClassType);
```

### Child containers

You can create child containers on demand. By registering a dependency on a child container, you can override the
return value of the `resolve` method. The `resolveAll` method will return an array of dependencies from both containers
in the order of registration, and with the child container's dependencies last.

```ts
const child = container.createChildContainer();
child.registerInstance(ClassType, new ClassType());
```

### Dispatchers

To invoke methods with dependency injection, first create a dispatcher.

```ts
const dispatcher = container.createDispatcher();
```

You can add custom typed instances which override the container. You can also add named values. If the method
has a parameter which fails to resolve with the container or has a primitive type, but has a matching named value, then
the named value will be used.

```ts
dispatcher.setNamedParameter('name', 'John Doe');
dispatcher.setTypedParameter(ClassType, new ClassType());
```

Finally, use the `invoke` method to resolve dependencies, execute, and get the return value.

```ts
const returnValue = dispatcher.invoke(object, 'methodName');
```

### `resolver`

This helper manages global container instances and makes it easy for various parts of the application to retrieve a
reference to specific containers.

#### Named containers

If the global container is not sufficient, you can use named containers. Simply request a named container and it will
be created and cached globally.

```ts
import { resolver } from '@baileyherbert/common';

const container = resolver.getInstance('name');
```

#### Container references

If your application is using multiple containers, you might be interested in storing a reference to the container used
to construct an object. Generally, this would require injecting the container as a parameter.

The resolver instead makes the container available with the `getConstructorInstance()` method, but note that this
method will throw an error if not called from within a constructor that has been invoked by the container during DI.

Here's a reliable pattern for storing the container that works even if the class is extended:

```ts
import { resolver } from '@baileyherbert/common';

export class DependencyInjectedClass {
    protected container = resolver.getConstructorInstance();

    public constructor() {
        // Now all methods, including the constructor, has a reference to the container
        this.container.resolve();
    }
}
```

With a reference to the container, you could make it easier for nested components in your application to retrieve
top level objects, like a root `App` object.

```ts
export class DependencyInjectedClass {
    protected container = resolver.getConstructorInstance();
    protected app = this.container.resolve(App);
}
```

### Context

When registering multiple values under a single token, **context** allows you to pick a specific instance out of the
registry.

#### Introduction

Context is useful because it allows you to do things like this:

```ts
class Service {
    constructor(
        @Context('db:one') db1: Database,
        @Context('db:two') db2: Database
    ) {}
}
```

In the above example, we have two different `Database` instances which have been registered with their database names
as context, allowing us to easily pick out the instance(s) we need while still using the `Database` token.

You can use string tokens for the same effect, but this permits some organization and works nicely with the
`resolveAll()` method.

#### Registration

When registering an instance or value, you can pass a context value of any type. If there is already a contextual value
under the same token with the same name, it will be overwritten.

```ts
container.registerInstance(new Class(), 'context');
container.register(Class, {
    useValue: new Class(),
    useContext: 'context'
});
```

#### Resolution

You can resolve a value from its context by passing the context into the `resolve()` method.

```ts
container.resolve(Class, 'context');
```

You can also use the `@Context()` decorator in a class or method parameter.

```ts
constructor(@Context('context') instance: Class) {}
```
