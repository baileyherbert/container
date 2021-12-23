import { Constructor } from '@baileyherbert/types';
import { Lifecycle } from '../containers/Container';
import { resolver } from '../containers/ContainerResolver';
import { Injectable } from './Injectable';

/**
 * This decorator registers a class as a transient in the global container instance. If a container name is
 * provided, then it will be registered on the specified named container instead.
 */
export function Transient(constructor: Constructor<any>): void;
export function Transient(): (constructor: Constructor<any>) => void;
export function Transient(containerName: string): (constructor: Constructor<any>) => void;
export function Transient(nameOrConstructor?: Constructor<any> | string) {
	if (typeof nameOrConstructor === 'function') {
		resolver.getGlobalInstance().register(
			nameOrConstructor,
			{ useClass: nameOrConstructor },
			{ lifecycle: Lifecycle.Transient }
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
			{ lifecycle: Lifecycle.Transient }
		);

		Injectable(constructor);
	}
}
