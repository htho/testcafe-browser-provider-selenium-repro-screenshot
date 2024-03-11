import { fixture, test } from "testcafe";
import { fail, getWindowDevicePixelRatio, getWindowInnerHeight, getWindowInnerWidth, mkValidPath } from "./tools";
import { PNG } from "pngjs";
import {readFileSync} from "fs";
import {join as joinPath} from "path";
import { resizeWindow } from "./resizeWindow";

const npmRunScript = process.env.npm_lifecycle_event ?? fail("test not run via npm run!");

const targetWidth = 800;
const targetHeight = 600;

fixture("screenshot")
    .page("about:blank")
    .clientScripts([
        {content: `document.addEventListener("DOMContentLoaded", () => document.body.style.background = "#ccc");`},
        {content: `document.addEventListener("DOMContentLoaded", () => document.body.style.border = "50px solid #bbb");`},
        // // scrollbars make things more complex
        // {content: `document.addEventListener("DOMContentLoaded", () => document.body.style.overflow = "scroll");`},
    ])
    .beforeEach(async t => {
        // set size to something else so resize is necessary
        await t.resizeWindow(targetWidth*2, targetHeight*2);
    });

test("set screen size", async t => {
    await t.expect(getWindowInnerWidth()).notEql(targetWidth, "Width not expected to be targetWidth yet!");
    await t.expect(getWindowInnerHeight()).notEql(targetHeight, "Height not expected to be targetHeight yet!");
    
    await t.resizeWindow(targetWidth, targetHeight);
    
    await t.expect(getWindowInnerWidth()).eql(targetWidth, "Width not properly set to targetWidth!");
    await t.expect(getWindowInnerHeight()).eql(targetHeight, "Height not properly set to targetHeight!");
});

test("set screen size (userland)", async t => {
    await t.expect(getWindowInnerWidth()).notEql(targetWidth, "Width not expected to be targetWidth yet!");
    await t.expect(getWindowInnerHeight()).notEql(targetHeight, "Height not expected to be targetHeight yet!");
    
    await resizeWindow(targetWidth, targetHeight);
    
    await t.expect(getWindowInnerWidth()).eql(targetWidth, "Width not properly set to targetWidth!");
    await t.expect(getWindowInnerHeight()).eql(targetHeight, "Height not properly set to targetHeight!");
});

test("screenshot size", async t => {
    const currentWidth = await getWindowInnerWidth();
    const currentHeight = await getWindowInnerHeight();

    await t.resizeWindow(targetWidth, targetHeight);

    await t.expect(getWindowInnerWidth()).notEql(currentWidth, "Width did not change!");
    await t.expect(getWindowInnerHeight()).notEql(currentHeight, "Height did not change!");

    const newWidth = await getWindowInnerWidth();
    const newHeight = await getWindowInnerHeight();

    const screenshotPath = `${mkValidPath(npmRunScript)}--${mkValidPath(t.test.name)}`;
    
    await t.takeScreenshot(screenshotPath);

    const devicePixelRatio = await getWindowDevicePixelRatio();
    const expectedWidth = newWidth * devicePixelRatio;
    const expectedHeight = newHeight * devicePixelRatio;

    const png = PNG.sync.read(readFileSync(joinPath("screenshots", `${screenshotPath}.png`)));
    await t.expect(png.width).eql(expectedWidth, "Screenshot does not have the same width as the window!");
    await t.expect(png.height).eql(expectedHeight, "Screenshot does not have the same heigt as the window!");
});
