import { container, Context, Injectable, registry, Singleton } from '../../src/main';

describe('Context', function() {
	@Singleton class A {}
	@Singleton class B {}

	@Injectable
	class Test {
		public constructor(public a: A, public b: B, @Context('c') public c: B) {}
		public method(a: A, b: B, @Context('c') c: B) {}
	}

	const c = new B();
	container.registerInstance(c, 'c');

	it('writes context to the registry', function() {
		expect(registry.getParameterContext(Test, 'constructor', 1)).toBe(undefined);
		expect(registry.getParameterContext(Test, 'method', 1)).toBe(undefined);

		expect(registry.getParameterContext(Test, 'constructor', 2)).toBe('c');
		expect(registry.getParameterContext(Test, 'method', 2)).toBe('c');
	});

	it('affects container resolution correctly', function() {
		const instance = container.resolve(Test);
		expect(instance.a).toBeInstanceOf(A);
		expect(instance.b).toBeInstanceOf(B);
		expect(instance.c).toBe(c);
	});

	it('affects dispatcher resolution correctly', function() {
		const dispatcher = container.createDispatcher();
		const methodParams = dispatcher.resolveParameters(Test, 'method');

		expect(methodParams[0]).toBeInstanceOf(A);
		expect(methodParams[1]).toBeInstanceOf(B);
		expect(methodParams[2]).toBe(c);
	});

	it('supports the defaultResolutionContext variable', function() {
		class Dep {}

		@Injectable
		class Service {
			constructor(public o: Dep) {}
		}

		const a = new Dep();
		const b = new Dep();

		container.registerInstance(a, 'withContext');
		container.registerInstance(b);

		expect(container.resolve(Service).o).toBe(b);

		container.setContext('defaultResolutionContext', 'withContext')
		expect(container.resolve(Service).o).toBe(a);

		container.removeContext('defaultResolutionContext');
		expect(container.resolve(Service).o).toBe(b);

		container.setContext('defaultResolutionContext', 'withNonexistentContext')
		expect(container.resolve(Service).o).toBe(b);

		container.removeContext('defaultResolutionContext');
	});

	it('supports arrays of context', function() {
		class Dep {}

		const a = new Dep();
		const b = new Dep();
		const c = new Dep();

		container.registerInstance(a, 'a');
		container.registerInstance(b, 'b');
		container.registerInstance(c, ['c', 'd']);

		expect(container.resolve(Dep, 'a')).toBe(a);
		expect(container.resolve(Dep, ['a'])).toBe(a);
		expect(container.resolve(Dep, ['a', 'b'])).toBe(a);
		expect(container.resolve(Dep, 'b')).toBe(b);
		expect(container.resolve(Dep, ['b'])).toBe(b);
		expect(container.resolve(Dep, ['b', 'a'])).toBe(b);

		expect(container.resolve(Dep, 'c')).toBe(c);
		expect(container.resolve(Dep, 'd')).toBe(c);
	});
});
