import { htmlPlugin } from "@craftamap/esbuild-plugin-html"
import sveltePlugin from "esbuild-svelte"
import tailwindPlugin from "esbuild-plugin-tailwindcss"
import esbuild from "esbuild"

const ctx = await esbuild.context({
    entryPoints: ["src/main.ts", "src/app.ts", "src/global.css"],
    bundle: true,
    metafile: true,
    charset: "utf8",
    format: "iife",
    external: [
        "fs",
        "path",
        "stream",
        "child_process",
        "events",
        "util",
        "crypto",
    ],
    outdir: "app",
    loader: { ".png": "dataurl" },
    assetNames: "[name]",
    plugins: [
        htmlPlugin({
            files: [
                {
                    filename: "index.html",
                    entryPoints: ["src/app.ts", "src/global.css"],
                    title: "BILL APP 2.0",
                    htmlTemplate: "src/index.html",
                },
            ],
        }),
        sveltePlugin(),
        tailwindPlugin(),
    ],
    //minify: true,
    //mangleProps: /_$/,
})

try {
    await ctx.rebuild()
} catch (e) {
    console.error("Error: ", e)
    process.exit(1)
}

process.exit(0)
