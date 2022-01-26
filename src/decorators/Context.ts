import { ReflectionClass } from '@baileyherbert/reflection';
import { registry } from '../main';
import { Injectable } from './Injectable';

/**
 * This decorator sets the injection context for a parameter. A value with matching context must be present in the
 * container or resolution will fail.
 *
 * - `@Context('ctx')`
 * - `@Context(128)`
 * - `@Context(symbolOrObject)`
 *
 * @param context
 */
export function Context(context: any) {
	return function(prototype: Object | Function, methodName: string | undefined, parameterIndex: number) {
		const ref = new ReflectionClass(methodName !== undefined ? prototype.constructor : prototype);
		const param = ref.getMethod(methodName ?? 'constructor')!.getParameter(parameterIndex)!;

		registry.registerParameterContext(param, context);
		Injectable()(prototype, methodName);
	}
}
