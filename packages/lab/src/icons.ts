import { LabIcon } from '@jupyterlab/ui-components';

import RISESvg from '../style/slideshow.svg';
import fullScreenSvg from '../style/fullscreen.svg';

export const RISEIcon = new LabIcon({ name: 'RISE', svgstr: RISESvg });
export const fullScreenIcon = new LabIcon({
  name: 'RISE:fullScreen',
  svgstr: fullScreenSvg
});
