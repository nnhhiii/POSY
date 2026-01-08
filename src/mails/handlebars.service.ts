import fs from 'fs/promises';
import Handlebars from 'handlebars';
import path from 'path';
import {
  EmailAttachment,
  TemplateEngine,
  TemplateRenderResult,
} from './interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HandlebarsService implements TemplateEngine {
  /**
   * Render a Handlebars template with the given variables.
   * @param templateName - Template name without extension (e.g. 'forget-password')
   * @param variables - Key/value pairs for template variables
   * @returns Rendered HTML and inline attachments
   */
  async render(
    templateName: string,
    variables: Record<string, string>,
  ): Promise<TemplateRenderResult> {
    try {
      // Resolve template path relative to this file's directory
      const templatePath = path.join(
        __dirname,
        '../mails/templates',
        `${templateName}.hbs`,
      );

      // Read template file asynchronously
      const content = await fs.readFile(templatePath, 'utf-8');

      // Compile and render with Handlebars
      const compiled = Handlebars.compile(content);
      let html = compiled(variables);

      // Collect inline images and replace paths with CID references
      const attachments = await this.collectInlineImages(html);

      // Replace image paths with CID references
      html = this.replaceImagePathsWithCid(html);

      return {
        html,
        attachments,
      };
    } catch (error) {
      throw new Error(
        `Failed to render template '${templateName}': ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Collect inline images referenced in the HTML template
   */
  private async collectInlineImages(html: string): Promise<EmailAttachment[]> {
    const attachments: EmailAttachment[] = [];

    // Find all image references in the format: src="images/[filename].[ext]"
    // Supports various image formats: png, jpg, jpeg, gif, svg, webp
    const imageRegex =
      /src="images\/([^"\s]+\.(?:png|jpg|jpeg|gif|svg|webp))"/gi;
    const matches = html.matchAll(imageRegex);

    const processedImages = new Set<string>();

    for (const match of matches) {
      const filename = match[1]; // e.g., "image21.jpg", "abc.png", etc.

      // Skip if we've already processed this image
      if (processedImages.has(filename)) {
        continue;
      }
      processedImages.add(filename);

      // Read the image file
      const imagePath = path.join(
        __dirname,
        '../mails/templates/images',
        filename,
      );

      try {
        const imageContent = await fs.readFile(imagePath);

        // Extract the CID by removing the file extension
        const id = filename.replace(/\.[^.]+$/, '');

        attachments.push({
          id,
          content: imageContent,
          filename,
        });
      } catch (error) {
        console.warn(`Warning: Could not read image ${filename}:`, error);
      }
    }

    return attachments;
  }

  /**
   * Replace relative image paths with CID references for email clients
   */
  private replaceImagePathsWithCid(html: string): string {
    // Replace src="images/[filename].[ext]" with src="cid:[filename]"
    // Example: src="images/logo.png" → src="cid:logo"
    return html.replace(
      /src="images\/([^"]+)\.(?:png|jpg|jpeg|gif|svg|webp)"/gi,
      'src="cid:$1"',
    );
  }
}
