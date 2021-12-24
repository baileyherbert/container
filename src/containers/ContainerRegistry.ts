import { ReflectionClass, ReflectionMethod, ReflectionParameter } from '@baileyherbert/reflection';
import { Type } from '@baileyherbert/types';

/**
 * This is an internal class which stores type information for classes and methods.
 * @internal
 */
class ContainerRegistry {

	protected classes = new Map<Type<any>, ReflectionParameter<any>[]>();
	protected methods = new Map<Type<any>, Map<string, ReflectionParameter<any>[]>>();

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

}

/**
 * This is an internal object which stores type information for classes and methods.
 * @internal
 */
export const registry = new ContainerRegistry();
