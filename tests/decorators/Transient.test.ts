import { container, resolver, Transient } from '../../src/main';

describe('Transient', function() {
	it('works without parenthesis', function() {
		@Transient
		class Test {}

		const resolved = container.resolve(Test);
		expect(resolved).toBeInstanceOf(Test);
		expect(container.resolve(Test)).not.toBe(resolved);
	});

	it('works with parenthesis', function() {
		@Transient()
		class Test {}

		const resolved = container.resolve(Test);
		expect(resolved).toBeInstanceOf(Test);
		expect(container.resolve(Test)).not.toBe(resolved);
	});

	it('works with container names', function() {
		@Transient('test')
		class Test {}

		const testContainer = resolver.getInstance('test');
		const testResolved = testContainer.resolve(Test);
		const globalResolved = container.resolve(Test);

		expect(testResolved).toBeInstanceOf(Test);
		expect(testContainer.resolve(Test)).not.toBe(testResolved);

		expect(globalResolved).not.toBe(testResolved);
	});
});
