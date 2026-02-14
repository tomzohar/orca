import { UserType } from '../../../users/domain/user-type.enum';

/**
 * DTO representing comment author details
 */
export class CommentAuthorDto {
  id: number;
  name: string;
  type: UserType;

  constructor(id: number, name: string, type: UserType) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}

/**
 * DTO representing a comment with author details
 */
export class CommentResponseDto {
  id: number;
  jobId: number;
  authorId: number;
  author: CommentAuthorDto;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;

  constructor(
    id: number,
    jobId: number,
    authorId: number,
    author: CommentAuthorDto,
    content: string,
    createdAt: Date,
    metadata?: Record<string, any>,
  ) {
    this.id = id;
    this.jobId = jobId;
    this.authorId = authorId;
    this.author = author;
    this.content = content;
    this.metadata = metadata;
    this.createdAt = createdAt.toISOString();
  }
}
