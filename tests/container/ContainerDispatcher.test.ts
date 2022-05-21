import { container, Injectable, Token } from '../../src/main';

describe('ContainerDispatcher', function() {

	class DependencyA {}
	class DependencyB {}

	@Injectable
	class DispatcherTest {
		@Injectable
		public A(a: DependencyA, b: DependencyB) {}

		@Injectable
		public B(dep: any) { return dep; }

		@Injectable
		public C(@Token(() => DependencyA) dep: any) {}
	}

	container.registerSingleton(DependencyA);
	container.registerSingleton(DependencyB);
	container.registerSingleton(DispatcherTest);

	const test = container.resolve(DispatcherTest);

	it('resolves dependencies from natural metadata', function() {
		const dispatcher = container.createDispatcher();
		const params = dispatcher.resolveParameters(test, 'A');

		expect(params[0]).toBeInstanceOf(DependencyA);
		expect(params[1]).toBeInstanceOf(DependencyB);
	});

	it('resolves dependencies with name overrides', function() {
		const dispatcher = container.createDispatcher();
		const value = Symbol();

		dispatcher.setNamedParameter('dep', value);
		const params = dispatcher.resolveParameters(test, 'B');

		expect(params[0]).toBe(value);
	});

	it('resolves dependencies with position overrides', function() {
		const dispatcher = container.createDispatcher();
		const value = Symbol();

		dispatcher.setPositionalParameter(0, value);
		const params = dispatcher.resolveParameters(test, 'B');

		expect(params[0]).toBe(value);
	});

	it('resolves dependencies with token overrides', function() {
		const dispatcher = container.createDispatcher();
		const initialParams = dispatcher.resolveParameters(test, 'C');

		const value = Symbol();
		dispatcher.setTokenParameter(DependencyA, value);
		const finalParams = dispatcher.resolveParameters(test, 'C');

		expect(initialParams[0]).toBeInstanceOf(DependencyA);
		expect(finalParams[0]).toBe(value);
	});

	it('can invoke the method with automatic injection', function() {
		const dispatcher = container.createDispatcher();
		const value = Symbol();

		dispatcher.setNamedParameter('dep', value);

		expect(dispatcher.invoke(test, 'B')).toBe(value);
	});

	describe('TiedContainerDispatcher', function() {
		it('can resolve parameters on the target method', function() {
			const dispatcher = container.createTiedDispatcher(test, 'B');
			const value = Symbol();

			dispatcher.setNamedParameter('dep', value);
			const params = dispatcher.resolveParameters();

			expect(params[0]).toBe(value);
		});

		it('can invoke the target method', function() {
			const dispatcher = container.createTiedDispatcher(test, 'B');
			const value = Symbol();

			dispatcher.setNamedParameter('dep', value);

			expect(dispatcher.invoke()).toBe(value);
		});
	});

});
