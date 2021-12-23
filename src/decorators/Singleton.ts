import { Constructor } from '@baileyherbert/types';
import { Lifecycle } from '../containers/Container';
import { resolver } from '../containers/ContainerResolver';
import { Injectable } from './Injectable';

/**
 * This decorator registers a class as a singleton in the global container instance. If a container name is
 * provided, then it will be registered on the specified named container instead.
 */
export function Singleton(constructor: Constructor<any>): void;
export function Singleton(): (constructor: Constructor<any>) => void;
export function Singleton(containerName: string): (constructor: Constructor<any>) => void;
export function Singleton(nameOrConstructor?: Constructor<any> | string) {
	if (typeof nameOrConstructor === 'function') {
		resolver.getGlobalInstance().register(
			nameOrConstructor,
			{ useClass: nameOrConstructor },
			{ lifecycle: Lifecycle.Singleton }
		);

		Injectable(nameOrConstructor);

		return;
	}

	return function (constructor: Constructor<any>) {
		const container = (typeof nameOrConstructor === 'string') ?
			resolver.getInstance(nameOrConstructor) :
			resolver.getGlobalInstance();

		container.register(
			constructor,
			{ useClass: constructor },
			{ lifecycle: Lifecycle.Singleton }
		);

		Injectable(constructor);
	}
}
