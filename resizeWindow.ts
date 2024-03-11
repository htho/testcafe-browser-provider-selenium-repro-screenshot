import {ClientFunction, t} from "testcafe";
import { getWindowInnerHeight, getWindowInnerWidth } from "./tools";

/** Error-Correcting userland implementation of `t.resize()`.
 * 
 * @param width 
 * @param height 
 * @returns 
 */
export async function resizeWindow(width: number, height: number): Promise<void> {
	const currentInnerWidth = await getWindowInnerWidth();
	const currentInnerHeight = await getWindowInnerHeight();
	
	const widthShouldChange = currentInnerWidth !== width;
	const heightShouldChange = currentInnerHeight !== height;

	if (!widthShouldChange && !heightShouldChange) return; // nothing to do

	await t.resizeWindow(width, height);

	if (widthShouldChange) await t.expect(getWindowInnerWidth()).notEql(currentInnerWidth, "Width did not change!");
	if (heightShouldChange) await t.expect(getWindowInnerHeight()).notEql(currentInnerHeight, "Height did not change!");
	
	const chromeWidth = width - await getWindowInnerWidth();
	const chromeHeight = height - await getWindowInnerHeight();

	const correctedWidth = width + chromeWidth;
	const correctedHeight = height + chromeHeight;

	await t.resizeWindow(correctedWidth, correctedHeight);

	// const nchromeWidth = width - await getWindowInnerWidth();
	// const nchromeHeight = height - await getWindowInnerHeight();

	// console.log({nchromeWidth, nchromeHeight})
	// if(nchromeWidth === 0 && nchromeHeight === 0) return;

	// const ncorrectedWidth = width + nchromeWidth;
	// const ncorrectedHeight = height + nchromeHeight;

	// await t.resizeWindow(ncorrectedWidth, ncorrectedHeight);
}
