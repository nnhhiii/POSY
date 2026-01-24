import { MeilisearchService } from '../meilisearch.service';
import { Index } from 'meilisearch';
import type { Logger } from 'winston';
import { Page } from '../../../common/interfaces';

/**
 * Base abstract class for MeiliSearch service implementations.
 * Provides common functionality that can be extended for specific entity types.
 *
 * @template T - The document type to be indexed (must be a record/object type)
 */
export abstract class MeilisearchEngineTemplate<T extends Record<string, any>> {
  protected index: Index;

  protected constructor(
    protected readonly indexName: string,
    protected readonly meilisearchService: MeilisearchService,
    protected readonly logger: Logger,
  ) {
    // Initialize a new Index instance with indexName
    this.index = this.meilisearchService.getClient().index(indexName);
  }

  /**
   * Abstract method to get filterable attributes for the entity.
   * Must be implemented by subclasses.
   */
  protected abstract getFilterableAttributes(): string[];

  /**
   * Abstract method to get searchable attributes for the entity.
   * Must be implemented by subclasses.
   */
  protected abstract getSearchableAttributes(): string[];

  /**
   * Abstract method to get sortable attributes for the entity.
   * Must be implemented by subclasses.
   */
  protected abstract getSortableAttributes(): string[];

  /**
   * Clears all documents from the search index.
   * Use with caution - typically only for maintenance or testing.
   *
   * @returns Promise resolving to the deletion task info
   */
  async clearIndex(): Promise<any> {
    await this.ensureIndex();
    this.logger.warn(
      `Clearing all documents from MeiliSearch index: ${this.indexName}`,
    );
    return this.index.deleteAllDocuments();
  }

  /**
   * Deletes a document from the search index.
   * Called after entity deletion from the database.
   *
   * @param documentId - ID of the document to delete from index
   * @returns Promise resolving to the deletion task info
   */
  async deleteDocument(documentId: string): Promise<any> {
    await this.ensureIndex();
    return this.index.deleteDocument(documentId);
  }

  /**
   * Ensures the MeiliSearch index exists and is properly configured.
   * Creates the index if it doesn't exist and sets up searchable/filterable attributes.
   */
  async ensureIndex(): Promise<void> {
    const client = this.meilisearchService.getClient();
    try {
      await client.getIndex(this.indexName);
    } catch {
      // Index doesn't exist, create it
      await client.createIndex(this.indexName, { primaryKey: 'id' });
      this.logger.info(`Created MeiliSearch index: ${this.indexName}`);
    }

    // Configure searchable attributes (fields to search in)
    await this.index.updateSearchableAttributes(this.getSearchableAttributes());

    // Configure filterable attributes (fields to filter by)
    await this.index.updateFilterableAttributes(this.getFilterableAttributes());

    // Configure sortable attributes
    await this.index.updateSortableAttributes(this.getSortableAttributes());
  }

  /**
   * Indexes or updates a single document.
   * Called after entity creation or update in the database.
   *
   * @param document - Document to index
   * @returns Promise resolving to the indexing task info
   */
  async indexDocument(document: T): Promise<any> {
    await this.ensureIndex();
    return this.index.addDocuments([document]);
  }

  /**
   * Indexes multiple documents in bulk.
   * Used for initial indexing or bulk re-indexing operations.
   *
   * @param documents - Array of documents to index
   * @returns Promise resolving to the indexing task info
   */
  async indexDocuments(documents: T[]): Promise<any> {
    await this.ensureIndex();
    this.logger.info(
      `Indexing ${documents.length} documents to MeiliSearch index: ${this.indexName}`,
    );
    return this.index.addDocuments(documents);
  }

  /**
   * Searches documents using MeiliSearch full-text search.
   * Supports pagination, sorting, and filtering.
   *
   * @param q - Search query string
   * @param page - Zero-based page number (default: 0)
   * @param pageSize - Number of results per page (default: 20)
   * @param sort - Array of sort strings in format ["field:asc", "field2:desc"] (optional)
   * @param options - Additional search options (filters, etc.)
   * @returns Promise resolving to search results with pagination metadata
   */
  async searchDocuments(
    q: string,
    page = 0,
    pageSize = 20,
    sort?: string[],
    options?: { filters?: string },
  ): Promise<Page<unknown>> {
    await this.ensureIndex();
    const offset = page * pageSize;
    const limit = pageSize;

    const searchParams: Record<string, unknown> = {
      limit,
      offset,
    };

    if (sort && sort.length > 0) {
      // MeiliSearch expects array of "field:order" format
      searchParams.sort = sort;
    }
    if (options?.filters) {
      searchParams.filter = options.filters;
    }
    const result = await this.index.search(q, searchParams);

    const total = result.estimatedTotalHits ?? 0;
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      items: result.hits,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  async onUpsertDoc(document: any): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.indexDocument(document);
    } catch (e) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `MeiliSearch index upsert failed for document ${document.id}:`,
        e,
      );
    }
  }

  async onDeleteDoc(documentId: string): Promise<void> {
    try {
      await this.deleteDocument(documentId);
    } catch (e) {
      this.logger.error(
        `MeiliSearch index deletion failed for document ${documentId}:`,
        e,
      );
    }
  }
}
