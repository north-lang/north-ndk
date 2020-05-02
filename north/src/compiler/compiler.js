

import components from '../components';
import PropFiller from './prop-filler';
import registrar from './registrar';
import each from 'lodash/each';
import cloneDeep from 'lodash/cloneDeep';

export class Compiler {
  constructor(props) {
    this._components = props.components;
    this._validateOnly = false;
  }

  setValidateOnly(validateOnly) {
    //local validation
    this._validateOnly = validateOnly;
  }

 
  // _compiledComponents = {};

  exists(name) {
    return !!this._components[name];
  }

  getComponent(name) {
    if (this.exists(name)) {
      return this._components[name];
    } else {
      throw new Error('missing component ' + name);
    }
  }

  _compileAnyFactoryProduct(defaultProps) {
  
    if (defaultProps.component === 'Factory') {
      const product = defaultProps.product;
      const properties = defaultProps.properties;
      delete defaultProps.properties;
      defaultProps.product = () => {
        let component = null;
        if (this.isCompiled(product)) {
          // Component is a factory so call produce so that we can wrap the result
          component = product.produce();
        } else {
          // Note: we don't have to clone the product definition as this is done when calling
          // newComponent
          component = this.newComponent(product);
        }

        if (properties) {
          // We need to clone the properties so that each product has its own instance
          const clonedProperties = cloneDeep(properties);
          this._instantiate(clonedProperties);
          component.set(clonedProperties);
        }
        return component;
      };
    }
  }

  _getWrappedComponentClass(name, defaultProps, parentProps, className) {
    const Component = this.getCompiledComponent(name, defaultProps);

    if (this._validateOnly) {
      // We need to mute the events or else there may be listeners that will try to act on a dynamic
      // component that will never be supplied.
      defaultProps = Object.assign({}, defaultProps, {
        muteCreate: true,
        disableSubEvents: true
      });
    }

    const self = this;

    // Create a class that sets the props by default
    class MyComponent extends Component {
   
      _className = className === undefined ? name : className;

      _create(props) {
        // Use the parentProps and props to fill
        const propFiller = new PropFiller(
          Object.assign({}, parentProps, props)
        );

        // Note: fillAll clones the data and this is needed as we will be instantiating pieces of
        // the data below and we want each instance of MyComponent to have its own copy
        defaultProps = propFiller.fillAll(defaultProps);

        self._compileAnyFactoryProduct(defaultProps);

        // Remove these properties as they are no longer needed
        delete defaultProps.component;

        // Instantiate defaultProps. We do this in _create() so that we have a fresh instance of all
        // the child components
        self._instantiate(defaultProps);

        // props may also contain items that need to be instantiated
        self._instantiate(props);

        // The default props and props need to be passed to _create() so that parent has a chance to
        // act on these props. E.G. componentToWrap needs to be set via _create() before any other
        // action is taken.
        const propsAndDefaultProps = Object.assign({}, defaultProps, props);

        super._create(propsAndDefaultProps);

        // Are we wrapping a component? Clear the componentToWrap
        if (defaultProps.componentToWrap) {
          delete defaultProps.componentToWrap;
        }

        
        this.set(defaultProps);
      }
    }

    // Note: we cannot use Class.prototype.name as this is overwritten by minifiers like UglifyJS.
    //
    // Object.defineProperty(MyComponent, 'name', {
    //   value: name,
    //   writable: false
    // });

    return MyComponent;
  }

  // Note: this function is VERY slow so we analyze obj.constructor.name instead
  // isCompiled(obj) {
  //   if (typeof obj === 'object') {
  //     let isCompiled = false;
  //     try {
  //       obj.constructor();
  //     } catch (err) {
  //       isCompiled = true;
  //     }
  //     return isCompiled;
  //   } else {
  //     return true;
  //   }
  // }
  isCompiled(obj) {
    if (typeof obj === 'object') {
      return (
        obj.constructor.name !== 'Object' && obj.constructor.name !== 'Array'
      );
    } else {
      return true;
    }
  }

  getCompiledComponent(name, parentProps) {

    let Component = this.getComponent(name);

    if (this.isCompiled(Component)) {
      return Component;
    } else {
      // Note: we need to pass name to compile() so that the className is set properly
      return this.compile(Component, parentProps, name);
    }
  }

  // The parentProps define values for the template parameters in props and allow us to make pieces
  // of our components dynamic.
  compile(props, parentProps, className) {
    return this._getWrappedComponentClass(
      props.component,
      props,
      parentProps,
      className
    );
  }

  _instantiateComponent(Component, props) {
    return new Component(props);
  }

  _instantiate(props) {
    // Already instantiated? This can occur with wrapped components.
    if (props instanceof components.Component) {
      return props;
    }

    if (props.component === 'Factory') {
      // The definition is for a factory, wrap up the component and defer the instantiation of the
      // child props
      const Component = this.compile(props);
      return new Component();
    }

    // Descend all the way down the tree and then start instantiating on the way up
    each(props, (prop, name) => {
      if (typeof prop === 'object' && prop !== null) {
        props[name] = this._instantiate(prop);
      }
    });

    // Does the object need to be instantiated?
    if (props.component) {
      const Component = this.getCompiledComponent(props.component);
      return this._instantiateComponent(
        Component,
        Object.assign({}, props, { component: undefined })
      );
    } else {
      return props;
    }
  }

  newComponent(props) {
    const Component = this.compile(props);
    return this._instantiateComponent(Component);
  }

  getOldestCompiledAncestor(name) {
    const component = this.getComponent(name);
    if (!this.isCompiled(component)) {
      // Ancestor is still an uncompiled component so go again
      return this.getOldestCompiledAncestor(component.component);
    } else {
      return name;
    }
  }

  registerComponent(name, component) {
    // Reregistration is now allowed as it allows for things like hot reloading of changed
    // definitions.
    //
    // if (this._components[name]) {
    //   throw new Error(`component ${name} already exists`);
    // } else {
    this._components[name] = component;
    // }
  }

  registerComponents(components) {
    each(components, component =>
      this.registerComponent(component.name, component)
    );
  }

  deregisterComponent(name) {
    delete this._components[name];
  }

  createSchemaForm(definition) {
    const component = this.newComponent({
      component: definition.component
    });

    const Form = this._components.Form;
    const schemaForm = new Form();
    component.buildSchemaForm(schemaForm, this);

    // Set the schema so that props can be set at the same layer as the schema
    if (definition.schema) {
      const topSchema = compiler.newComponent(definition.schema);

      // Not required as these values are defaults at the same layer as the schema
      topSchema.setRequired(false);

      schemaForm.copyFields(topSchema);
    }

    return schemaForm;
  }

  validateDefinition(definition) {
    const schemaForm = this.createSchemaForm(definition);

    schemaForm.setValues(definition);
    schemaForm.validate();

    return schemaForm;
  }
}

const compiler = new Compiler({ components });

// Register compiler so that components have access to the compiler at run-time without causing a
// circular dependency
registrar.compiler = compiler;

export default compiler;
