import { container, resolver, Singleton } from '../../src/main';

describe('Singleton', function() {
	it('works without parenthesis', function() {
		@Singleton
		class Test {}

		const resolved = container.resolve(Test);
		expect(resolved).toBeInstanceOf(Test);
		expect(container.resolve(Test)).toBe(resolved);
	});

	it('works with parenthesis', function() {
		@Singleton()
		class Test {}

		const resolved = container.resolve(Test);
		expect(resolved).toBeInstanceOf(Test);
		expect(container.resolve(Test)).toBe(resolved);
	});

	it('works with container names', function() {
		@Singleton('test')
		class Test {}

		const testContainer = resolver.getInstance('test');
		const testResolved = testContainer.resolve(Test);
		const globalResolved = container.resolve(Test);

		expect(testResolved).toBeInstanceOf(Test);
		expect(testContainer.resolve(Test)).toBe(testResolved);

		// The global container will still return an instance in this case becaues it's always eager to resolve when
		// given a class constructor. Just make sure it's not the same object.

		expect(globalResolved).not.toBe(testResolved);
	});
});
