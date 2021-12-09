import { Container, container, Injectable, resolver } from '../../src/main';

describe('ContainerResolver', function() {
	it('can get the global container', function() {
		expect(container).toBe(resolver.getGlobalInstance());
	});

	it('can create named containers', function() {
		const container = resolver.getInstance('named_test');
		const repeat = resolver.getInstance('named_test');

		expect(container).toBeInstanceOf(Container);
		expect(container).toBe(repeat);
	});

	it('can get constructor instance', function() {
		const trigger = jest.fn();

		@Injectable
		class Test {
			public container = resolver.getConstructorInstance();
			public container2: Container;

			public constructor() {
				this.container2 = resolver.getConstructorInstance();
				trigger();
			}
		}

		const container = new Container();
		container.registerSingleton(Test);

		const test = container.resolve(Test);

		expect(trigger).toHaveBeenCalled();
		expect(test).toBeInstanceOf(Test);
		expect(test.container).toBe(container);
		expect(test.container2).toBe(container);
	});
});
