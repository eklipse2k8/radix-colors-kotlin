import * as radixColors from "@radix-ui/colors";
import fs from "fs";
import { helperExtensions } from "./helper.js";
import { headerComment } from "./header-comment.js";

/**
 * This function takes a color string (the value of each Radix Color) and convert it to Swift Color.
 * @param colorString - The value of a Radix Color
 * @return - A script of Swift Color in Swift.
 */
function parseColorString(colorString: string): string {
  // Remove prefix and suffix.
  let parsedString = colorString
    .toString()
    .replace("hsl(", "")
    .replace("hsla(", "")
    .replace(")", "");

  // Remove percentage sign.
  while (parsedString.indexOf("%") !== -1) {
    parsedString = parsedString.replace("%", "");
  }

  // Remove white space.
  while (parsedString.indexOf(" ") !== -1) {
    parsedString = parsedString.replace(" ", "");
  }

  // Split the string into an array.
  const parts = parsedString.split(",");
  const h = Number(parts[0]);
  const s = Number(parts[1]) / 100;
  const l = Number(parts[2]) / 100;
  if (parts.length === 4) {
    const a = Number(parts[3]);
    return `Color.hsl(${h}, ${s.toFixed(3)}, ${l.toFixed(
      3
    )}, ${a.toFixed(3)})`;
  }
  return ` Color.hsl(${h}, ${s.toFixed(3)}, ${l.toFixed(3)})`;
}

const outputDir = "output";
const outputFile = "RadixColors.kt";

function main() {
  // Create the output directory if it does not exist.
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Create a file stream to write the output.
  const logger = fs.createWriteStream(outputDir + "/" + outputFile, {
    // do not keep old text.
    flags: "w",
  });

  // Get all entries from Radix Colors library.
  const radixEntries = Object.entries(radixColors);

  // Write the header comment.
  logger.write(headerComment + "\n");

  logger.write("package com.eklipse2k8.radixcolor\n\n");

  // Write the header of the file.
  logger.write("import androidx.compose.ui.graphics.Color\n\n");

  // Write the main class.
  logger.write("/** [Radix Colors] A gorgeous, accessible color system. */\n");
  logger.write("object RadixColors {\n");
  for (const [name, colors] of radixEntries) {
    const isDarkClass = name.endsWith("Dark") || name.endsWith("DarkA");
    logger.write(`    /** [Radix Colors] Collection: ${name} */\n`);
    logger.write(`    @JVMStatic\n`);
    logger.write(`    val ${name} =\n`);
    logger.write(`        listOf(\n`);
    for (const [colorName, color] of Object.entries(colors)) {
      logger.write(`             ${parseColorString(color)},\n`);
    }
    logger.write("        )\n");
  }
  logger.write("}\n\n");

  // Write the global helper extensions.
  logger.write(helperExtensions);

  logger.end();
  console.log("Done.");
}

main();
