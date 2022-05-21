import { Delegate } from '@baileyherbert/types';
import { Container } from './Container';
import { ContainerDispatcher } from './ContainerDispatcher';

/**
 * This class is used to provide dependency injection for class methods which have the `@Injectable` decorator applied.
 *
 * This version of the dispatcher is "tied" to a specific method on a target object at construction time.
 *
 * You should not create an instance of this class directly. Instead, use the `container.createDispatcher()` method to
 * spawn a new instance.
 */
export class TiedContainerDispatcher extends ContainerDispatcher {

	/**
	 * Constructs a new `TiedContainerDispatcher` instance.
	 *
	 * @param container The container that this dispatcher was created from.
	 * @param object
	 * @param methodName
	 *
	 * @internal
	 */
	public constructor(container: Container, public object: any, public methodName: string | symbol) {
		super(container);
	}

	/**
	 * Resolves and returns the parameters for the method.
	 *
	 * Generally, you will not call this method yourself and instead you will use the `invoke()` method which calls
	 * and uses this method's return value automatically. But it's public just in case you need it. :)
	 */
	public override resolveParameters(): any[] {
		return super.resolveParameters(this.object, this.methodName as any);
	}

	/**
	 * Invokes the method. The paremeters of the method will be resolved automatically using the parent container and
	 * the dispatcher's custom parameters.
	 */
	public override invoke() {
		const params = this.resolveParameters();
		const fn: Delegate<any> = (this.object as any)[this.methodName];
		return fn.apply(this.object, params);
	}

	/**
	 * Clones the current instance and returns a new instance with the same overrides.
	 */
	public override clone() {
		const instance = new TiedContainerDispatcher(this.container, this.object, this.methodName);

		instance.namedParameters = new Map(this.namedParameters);
		instance.tokenParameters = new Map(this.tokenParameters);
		instance.typedParameters = new Map(this.typedParameters);
		instance.positionalParameters = new Map(this.positionalParameters);

		return instance;
	}

}
