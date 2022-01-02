import { ReflectionClass } from '@baileyherbert/reflection';
import { Delegate, Key, Type } from '@baileyherbert/types';
import { Container } from './Container';
import { registry } from './ContainerRegistry';

/**
 * This class is used to provide dependency injection for class methods which have the `@Injectable` decorator applied.
 *
 * This version of the dispatcher is "tied" to a specific method on a target object at construction time.
 *
 * You should not create an instance of this class directly. Instead, use the `container.createDispatcher()` method to
 * spawn a new instance.
 */
export class TiedContainerDispatcher {

	protected namedParameters = new Map<string, any>();
	protected typedParameters = new Map<Type<any>, any>();
	protected positionalParameters = new Map<number, any>();

	/**
	 * Constructs a new `TiedContainerDispatcher` instance.
	 *
	 * @param container The container that this dispatcher was created from.
	 * @param object
	 * @param methodName
	 *
	 * @internal
	 */
	public constructor(public container: Container, public object: any, public methodName: string | symbol) {

	}

	/**
	 * Sets a named parameter for this dispatcher.
	 *
	 * When this dispatcher is used to resolve parameters for a method, if there is a parameter with the same name
	 * that could not be resolved by its type, it will instead be provided the given value.
	 *
	 * @param paramName
	 * @param value
	 */
	public setNamedParameter(paramName: string, value: any) {
		this.namedParameters.set(paramName, value);
	}

	/**
	 * Sets a typed parameter for this dispatcher.
	 *
	 * When this dispatcher is used to resolve parameters for a method, any parameters which match the given type
	 * will use the given instance instead. This effectively overrides the container.
	 *
	 * @param type
	 * @param instance
	 */
	public setTypedParameter<T>(type: Type<T>, instance: T) {
		this.typedParameters.set(type, instance);
	}

	/**
	 * Sets a positional parameter for this dispatcher.
	 *
	 * When this dispatcher is used to resolve parameters for a method, any parameters which match the specified index
	 * position (zero-baesd) will use the given value if they fail to resolve otherwise.
	 *
	 * @param index
	 * @param value
	 */
	public setPositionalParameter(index: number, value: any) {
		this.positionalParameters.set(index, value);
	}

	/**
	 * Resolves and returns the parameters for the given method.
	 *
	 * Generally, you will not call this method yourself and instead you will use the `invoke()` method which calls
	 * and uses this method's return value automatically. But it's public just in case you need it. :)
	 *
	 * @param type
	 * @param methodName
	 */
	public resolveParameters<T>(type: Type<T>, methodName: Key<T>): any[];
	public resolveParameters<T>(object: T, methodName: Key<T>): any[];
	public resolveParameters<T>(objectOrType: Type<T> | T, methodName: string): any[] {
		const type = new ReflectionClass(objectOrType).target;
		const parameters = registry.getMethodParameters(type, methodName);
		const resolved = new Array<any>();

		if (parameters === undefined) {
			throw new Error(
				`The dispatcher couldn't resolve parameters for ${type.name}.${methodName} because no type information is known. ` +
				'Have you added the `@Injectable` decorator to the method?'
			);
		}

		for (const parameter of parameters) {
			const paramType = parameter.getType() as Type<any>;

			if (typeof paramType === 'undefined') {
				if (parameter.hasDefault) {
					resolved.push(undefined);
					continue;
				}

				throw new Error(
					`The dispatcher couldn't resolve the type of the parameter at index ${parameter.index} for ` +
					`${type.name}.${methodName} because it has an undefined type. Please ensure that you've set ` +
					`emitDecoratorMetadata to true in your tsconfig.json file.`
				);
			}

			if (parameter.isKnownType && this.typedParameters.has(paramType)) {
				resolved.push(this.typedParameters.get(paramType));
			}
			else if (parameter.isReflectableType && this.container.isRegistered(paramType, true)) {
				resolved.push(this.container.resolve(paramType));
			}
			else if (this.namedParameters.has(parameter.name)) {
				resolved.push(this.namedParameters.get(parameter.name));
			}
			else if (this.positionalParameters.has(parameter.index)) {
				resolved.push(this.positionalParameters.get(parameter.index));
			}
			else if (parameter.hasDefault) {
				resolved.push(undefined);
			}
			else {
				throw new Error(
					`The dispatcher couldn't resolve a value for the "${parameter.name}" parameter ` +
					`on ${type.name}.${methodName}.`
				);
			}
		}

		return resolved;
	}

	/**
	 * Invokes the method. The paremeters of the method will be resolved automatically using the parent container and
	 * the dispatcher's custom parameters.
	 */
	public invoke() {
		const params = this.resolveParameters(this.object, this.methodName as any);
		const fn: Delegate<any> = (this.object as any)[this.methodName];
		return fn.apply(this.object, params);
	}

}
