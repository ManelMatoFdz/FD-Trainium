import { init } from "./appFetch";
import * as userService from "./userService";
import * as routineService from "./routineService";
import * as exerciseService from "./exerciseService";
import * as categoryService from "./categoryService";
import * as routineExecutionService from "./routineExecutionService";
import * as feedService from "./feedService";

export { default as NetworkError } from "./NetworkError";

export default { init, userService, routineService, exerciseService, categoryService, routineExecutionService, feedService };

