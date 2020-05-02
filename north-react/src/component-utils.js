import components from './components';
import compiler from 'north/lib/compiler';

class Utils {
  getUIComponent(component) {
    const name = component.getClassName();
    const Component = components[name];
    if (Component !== undefined) {
      return Component;
    } else if (compiler.isCompiled(compiler.getComponent(name))) {
      const Parent = Object.getPrototypeOf(component.constructor);
      return this.getUIComponent(new Parent());
    } else {
      // The React component wasn't found so check the north layer to see if we can automatically
      // determine the component from any north.
      const ancestorName = compiler.getOldestCompiledAncestor(name);
      const Ancestor = compiler.getComponent(ancestorName);
      return this.getUIComponent(new Ancestor());
    }
  }
}

export default new Utils();
