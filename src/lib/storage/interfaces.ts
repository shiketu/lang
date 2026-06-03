export interface BlobRef {
  key: string;
  size: number;
  contentType: string;
}

export interface BlobStorageProvider {
  put(key: string, data: Buffer, contentType: string): Promise<BlobRef>;
  get(key: string): Promise<{ data: Buffer; contentType: string } | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string): string;
  /**
   * Returns a time-limited URL that lets the client fetch the blob directly
   * (e.g. an S3 presigned URL). Implementations without signing (local disk)
   * return null, signalling callers to fall back to streaming via get().
   */
  createSignedUrl(key: string, expiresIn: number): Promise<string | null>;
}

export interface MetadataStore<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  put(item: T): Promise<void>;
  remove(id: string): Promise<boolean>;
}
