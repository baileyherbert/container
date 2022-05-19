import { ReflectionClass, ReflectionMethod, ReflectionParameter } from '@baileyherbert/reflection';
import { Type } from '@baileyherbert/types';
import { InjectionTokenResolvable } from '../decorators/Token';
import { InjectionToken } from './Container';

/**
 * This is an internal class which stores type information for classes and methods.
 * @internal
 */
class ContainerRegistry {

	protected classes = new Map<Type<any>, ReflectionParameter<any>[]>();
	protected methods = new Map<Type<any>, Map<string, ReflectionParameter<any>[]>>();
	protected parameterTokens = new Map<Type<any>, Map<string, Map<number, InjectionTokenResolvable>>>();
	protected parameterContexts = new Map<Type<any>, Map<string, Map<number, any>>>();

	/**
	 * Adds the given reflection object to the registry. Parameter types will automatically be detected from the
	 * reflection object and made available to containers.
	 *
	 * @param reflection
	 */
	public register(reflection: ReflectionClass<any>): void;
	public register(reflection: ReflectionMethod<any>): void;
	public register(reflection: ReflectionClass<any> | ReflectionMethod<any>): void {
		if (reflection instanceof ReflectionClass) {
			const params = reflection.getConstructorMethod().getParameters();
			this.classes.set(reflection.target, params);
		}
		else if (reflection instanceof ReflectionMethod) {
			if (!this.methods.has(reflection.class.target)) {
				this.methods.set(reflection.class.target, new Map());
			}

			const map = this.methods.get(reflection.class.target)!;
			map.set(reflection.name, reflection.getParameters());
		}
	}

	/**
	 * Overrides the injection token for the specified parameter.
	 *
	 * @param reflection
	 * @param token
	 */
	public registerParameterToken(reflection: ReflectionParameter<any>, token: InjectionTokenResolvable) {
		const target = reflection.method.class.target;

		if (!this.parameterTokens.has(target)) {
			this.parameterTokens.set(target, new Map());
		}

		if (!this.parameterTokens.get(target)!.has(reflection.method.name)) {
			this.parameterTokens.get(target)!.set(reflection.method.name, new Map());
		}

		const params = this.parameterTokens.get(target)!.get(reflection.method.name)!;
		params.set(reflection.index, token);
	}

	/**
	 * Registers context for the specified parameter.
	 *
	 * @param reflection
	 * @param context
	 */
	public registerParameterContext(reflection: ReflectionParameter<any>, context: any) {
		const target = reflection.method.class.target;

		if (!this.parameterContexts.has(target)) {
			this.parameterContexts.set(target, new Map());
		}

		if (!this.parameterContexts.get(target)!.has(reflection.method.name)) {
			this.parameterContexts.get(target)!.set(reflection.method.name, new Map());
		}

		const params = this.parameterContexts.get(target)!.get(reflection.method.name)!;
		params.set(reflection.index, context);
	}

	/**
	 * Returns an array of parameter types for the given class type, or returns `undefined` if the class was not
	 * registered.
	 *
	 * @param type
	 * @returns
	 */
	public getConstructorParameters(type: Type<any>) {
		return this.classes.get(type);
	}

	/**
	 * Returns an array of parameters for the given method, or returns `undefined` if the method was not registered.
	 *
	 * Note that this array is not an array of parameter *types* but rather an array of `ReflectionParameter`
	 * objects which describe parameter index, type, and name.
	 *
	 * @param type
	 * @param methodName
	 */
	public getMethodParameters(type: Type<any>, methodName: string) {
		return this.methods.get(type)?.get(methodName);
	}

	/**
	 * Returns the injection token to use as an override for the specified parameter if applicable.
	 *
	 * @param type
	 * @param methodName
	 * @param parameterIndex
	 * @returns
	 */
	public getParameterToken(type: Type<any>, methodName: string, parameterIndex: number): InjectionToken | undefined {
		const resolver = this.parameterTokens.get(type)?.get(methodName)?.get(parameterIndex);

		if (typeof resolver === 'function' && resolver.prototype === undefined) {
			// @ts-ignore
			return resolver();
		}

		return resolver;
	}

	/**
	 * Returns the context for the specified parameter or `undefined` if not set.
	 *
	 * @param type
	 * @param methodName
	 * @param parameterIndex
	 * @returns
	 */
	public getParameterContext(type: Type<any>, methodName: string, parameterIndex: number): any {
		return this.parameterContexts.get(type)?.get(methodName)?.get(parameterIndex);
	}

}

/**
 * This is an internal object which stores type information for classes and methods.
 */
export const registry = new ContainerRegistry();
