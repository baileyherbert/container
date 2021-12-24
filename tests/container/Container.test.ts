import { Container, Injectable, Lifecycle } from '../../src/main';

describe('Container', function() {
	it('can register values', function() {
		class Test {}

		const container = new Container();
		const instance = new Test();

		container.register(Test, { useValue: instance });

		expect(container.resolve(Test)).toBe(instance);
		expect(container.resolve(Test)).toBe(instance);
	});

	it('can register types', function() {
		@Injectable
		class Singleton {}

		@Injectable
		class Transient {}

		const container = new Container();

		container.register(Transient);
		container.registerSingleton(Singleton);

		const singleton = container.resolve(Singleton);
		const transient = container.resolve(Transient);

		expect(container.resolve(Singleton)).toBe(singleton);
		expect(container.resolve(Transient)).not.toBe(transient);
	});

	it('can register tokens and aliases', function() {
		@Injectable
		class A {}
		class B {}

		const container = new Container();
		container.register(B, { useToken: A });
		container.register('alias', { useToken: A }, { lifecycle: Lifecycle.Singleton });

		expect(container.resolve(B)).toBeInstanceOf(A);
		expect(container.resolve('alias')).toBeInstanceOf(A);
	});

	/**
	 * This tests cases where a token is set to itself. This would cause an infinite loop, but the container should
	 * catch this and convert it to a `useClass` provider automatically.
	 */
	it('can register identical tokens', function() {
		@Injectable
		class Identical {}

		const container = new Container();
		container.register(Identical, { useToken: Identical });

		expect(container.resolve(Identical)).toBeInstanceOf(Identical);
	});

	it('can register factories', async function() {
		@Injectable
		class Time {
			constructor(public time: number) {}
		}

		const container = new Container();
		container.register(Time, { useFactory: () => new Time(Date.now()) });

		const a = container.resolve(Time);
		await new Promise(r => setTimeout(r, 5));
		const b = container.resolve(Time);

		expect(a).toBeInstanceOf(Time);
		expect(b).toBeInstanceOf(Time);

		expect(a.time).not.toEqual(b.time);
	});

	it('can register container scoped', function() {
		@Injectable
		class Scoped {}

		const container = new Container();
		const child = container.createChildContainer();

		container.register(Scoped, { lifecycle: Lifecycle.ContainerScoped });

		const mainInstance = container.resolve(Scoped);
		const childInstance = child.resolve(Scoped);

		expect(container.resolve(Scoped)).toBe(mainInstance);
		expect(child.resolve(Scoped)).toBe(childInstance);
		expect(mainInstance).not.toBe(childInstance);
	});

	it('can dispatch methods with dependencies', function() {
		@Injectable
		class Dependency {}

		class Example {
			@Injectable
			public test(dep: Dependency) {
				return dep;
			}
		}

		const container = new Container();
		const dispatcher = container.createDispatcher();

		container.registerSingleton(Dependency);

		expect(dispatcher.invoke(new Example(), 'test')).toBeInstanceOf(Dependency);
	});

	it('can resolve multiple instances', function() {
		class Test {
			constructor(public value: string) {}
		}

		const parent = new Container();
		const child = parent.createChildContainer();

		parent.registerInstance(new Test('parent'));
		child.registerInstance(new Test('child'));

		const resolved = child.resolveAll(Test);

		expect(resolved.length).toBe(2);
		expect(resolved[0].value).toBe('parent');
		expect(resolved[1].value).toBe('child');
	});

	it('can detect and skip optional dependencies', function() {
		@Injectable
		class Dep {}

		@Injectable
		class Test {
			constructor(public dep: Dep, optional: boolean = true) {}
		}

		const container = new Container();
		container.registerSingleton(Dep);
		container.registerSingleton(Test);

		const test = container.resolve(Test);
	});
});
