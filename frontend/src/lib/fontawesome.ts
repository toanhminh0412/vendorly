import { library } from '@fortawesome/fontawesome-svg-core';
import { config } from '@fortawesome/fontawesome-svg-core';
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faSpinner,
  faHeart,
  faBolt,
  faUser,
  faEnvelope,
  faLock,
  faSignOutAlt,
  faCog,
  faUserCircle,
  faChartLine,
  faUsers,
  faTasks,
  faEdit,
  faShieldAlt,
  faTachometerAlt,
  faRocket,
  faPlus,
  faCodeBranch,
  faSliders,
  faHandPointer,
  faBars
} from '@fortawesome/free-solid-svg-icons';

// Tell Font Awesome to skip adding the CSS automatically since it's being imported above
config.autoAddCss = false;

// Add icons to the library so you can use them throughout your app
library.add(
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faSpinner,
  faHeart,
  faBolt,
  faUser,
  faEnvelope,
  faLock,
  faSignOutAlt,
  faCog,
  faUserCircle,
  faChartLine,
  faUsers,
  faTasks,
  faEdit,
  faShieldAlt,
  faTachometerAlt,
  faRocket,
  faPlus,
  faCodeBranch,
  faSliders,
  faHandPointer,
  faBars
);

export { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 