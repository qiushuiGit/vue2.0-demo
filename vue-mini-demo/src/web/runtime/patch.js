import * as nodeOps from './node-ops';
import { createPatchFunction } from '../../core/vdom/patch';
import platformModules from './modules/index';

const modules = platformModules;

export const patch = createPatchFunction({ nodeOps, modules });
