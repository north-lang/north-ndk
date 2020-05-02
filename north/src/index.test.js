import * as north from './index';

it('should bundle', () => {
  north.compiler.newComponent({
    component: 'Form'
  });
});
