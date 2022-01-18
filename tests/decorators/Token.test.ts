import { Token } from '../../src/decorators/Token';
import { container, Injectable, registry } from '../../src/main';

describe('Token', function() {
	class A {}
	class B {}

	@Injectable
	class Test {
		public constructor(@Token(A) public param: string) {}
		public method(@Token(() => B) param: number, anotherParam: boolean = true) {}
	}

	it('Writes tokens to the registry', function() {
		expect(registry.getParameterToken(Test, 'constructor', 0)).toBe(A);
		expect(registry.getParameterToken(Test, 'method', 0)).toBe(B);
	});

	it('Overrides constructor resolution', function() {
		const instance = container.resolve(Test);
		expect(instance.param).toBeInstanceOf(A);
	});

	it('Overrides dispatcher resolution', function() {
		const dispatcher = container.createDispatcher();
		const methodParams = dispatcher.resolveParameters(Test, 'method');

		expect(methodParams[0]).toBeInstanceOf(B);
	});
});
