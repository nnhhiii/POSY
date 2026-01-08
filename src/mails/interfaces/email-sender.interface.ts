/**
 * Inline attachment for email (e.g., embedded images)
 */
export interface EmailAttachment {
  /**
   * The Content-ID used to reference this attachment in the HTML (e.g., 'image-1')
   */
  id: string;
  /**
   * The binary content of the attachment
   */
  content: Buffer;
  /**
   * The filename of the attachment
   */
  filename: string;
}

/**
 * Contract for an email sending service.
 *
 * Implementations of this interface should provide a method to send
 * an email to a recipient with a subject and HTML content. This abstraction
 * allows the application to use different email providers (e.g., SMTP, SendGrid)
 * without changing business logic.
 */
export interface EmailSender {
  /**
   * Sends an email to the specified recipient.
   *
   * @param to - The recipient's email address.
   * @param subject - The subject line of the email.
   * @param htmlContent - The HTML content of the email body.
   * @param attachments - Optional inline attachments (e.g., embedded images).
   * @returns Promise that resolves when the email is sent or rejects on failure.
   */
  sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    attachments?: EmailAttachment[],
  ): Promise<void>;
}
