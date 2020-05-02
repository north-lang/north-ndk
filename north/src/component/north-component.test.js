import northComponent from './north-component';

// Note: this is needed so that northComponent has a reference to the compiler
import '../compiler';

it('should build in constructor', () => {
  const component = new northComponent({
    definition: {
      name: 'name',
      component: 'TextField',
      label: 'Name'
    }
  });

  component.setValue('Robert Plant');
  expect(component.getValue()).toEqual('Robert Plant');
});

it('should not preserve class name', () => {
  const component = new northComponent({
    definition: {
      name: 'name',
      component: 'TextField'
    }
  });

  expect(component.getClassName()).toEqual('TextField');
});

it('should set and get compiler', () => {
  const compiler = {};
  const component = new northComponent();
  component._setCompiler(compiler);
  expect(component._getCompiler()).toEqual(compiler);
});

it('should throw if compiler not registered', () => {
  const component = new northComponent();

  // Simulate compiler not being registered
  component._registrar = {};

  expect(() =>
    component.set({
      definition: null
    })
  ).toThrow();
});
