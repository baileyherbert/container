import * as Main from '../src/main';

describe('main', function() {
	it('exports the expected items', function() {
		expect(typeof Main.Container).toBe('function');
		expect(typeof Main.ContainerDispatcher).toBe('function');
		expect(typeof Main.Injectable).toBe('function');
		expect(typeof Main.Singleton).toBe('function');
		expect(typeof Main.Transient).toBe('function');
		expect(typeof Main.Lifecycle).toBe('object');

		expect(typeof Main.container).toBe('object');
		expect(typeof Main.resolver).toBe('object');
		expect(typeof Main.registry).toBe('object');
	})
});
