import { ReflectionClass } from '@baileyherbert/reflection';
import { Constructor } from '@baileyherbert/types';
import { registry } from '../containers/ContainerRegistry';

/**
 * This decorator allows a class constructor or method to have its parameter dependencies injected at runtime.
 *
 * Under the hood, this decorator registers type information with the container system.
 */
export function Injectable(constructor: Constructor<any>): void;
export function Injectable(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export function Injectable(): (...args: any[]) => void;

export function Injectable(constructor?: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
	const isClassDecoration = typeof constructor === 'function' && typeof propertyKey === 'undefined';
	const isMethodDecoration = typeof propertyKey !== 'undefined';

	if (isClassDecoration) {
		registry.register(new ReflectionClass(constructor));
		return;
	}

	else if (isMethodDecoration) {
		const classRef = new ReflectionClass(constructor);
		const methodRef = classRef.getMethod(propertyKey)!;

		registry.register(methodRef);
		return;
	}

	return function (constructor: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const isClassDecoration = typeof constructor === 'function' && typeof propertyKey === 'undefined';
		const isMethodDecoration = typeof propertyKey !== 'undefined';

		if (isClassDecoration) {
			registry.register(new ReflectionClass(constructor));
		}

		else if (isMethodDecoration) {
			const classRef = new ReflectionClass(constructor);
			const methodRef = classRef.getMethod(propertyKey)!;

			registry.register(methodRef);
		}
	}
}
