import { ReflectionClass } from '@baileyherbert/reflection';
import { InjectionToken, registry } from '../main';
import { Injectable } from './Injectable';

/**
 * This decorator overrides the injection token for a parameter. You can also pass a function that returns the
 * token, which is ideal for resolving circular dependencies:
 *
 * - `@Token(ClassName)`
 * - `@Token(() => ClassName)`
 *
 * @param token
 */
export function Token(token: InjectionTokenResolvable) {
	return function(prototype: Object | Function, methodName: string | undefined, parameterIndex: number) {
		const ref = new ReflectionClass(methodName !== undefined ? prototype.constructor : prototype);
		const param = ref.getMethod(methodName ?? 'constructor')!.getParameter(parameterIndex)!;

		registry.registerParameterToken(param, token);
		Injectable()(prototype, methodName);
	}
}

/**
 * A resolvable injection token. That is, either an explicitly defined token, or a function that returns the token
 * when invoked (mainly for circular dependency resolution).
 */
export type InjectionTokenResolvable = InjectionToken | (() => InjectionToken);
