export type PresignedUpload = {
  objectKey: string;
  uploadUrl: string;
  expiresAt: Date;
};

export type ObjectStorageAdapter = {
  readonly name: string;
  createPresignedUpload(input: {
    objectKey: string;
    contentType: string;
    maxBytes: number;
  }): Promise<PresignedUpload>;
  buildPublicUrl(objectKey: string): string;
  deleteObject(objectKey: string): Promise<void>;
};
