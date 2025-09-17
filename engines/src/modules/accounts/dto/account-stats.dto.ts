import { ApiProperty } from '@nestjs/swagger';

/**
 * Account statistics response DTO
 */
export class AccountStatsResponseDto {
  @ApiProperty({ description: 'Total number of accounts' })
  total: number;

  @ApiProperty({ description: 'Number of active accounts' })
  active: number;

  @ApiProperty({ description: 'Number of inactive accounts' })
  inactive: number;

  @ApiProperty({ description: 'Number of pending verification accounts' })
  pendingVerification: number;

  @ApiProperty({ description: 'Number of verified accounts' })
  verified: number;

  @ApiProperty({ description: 'Number of blacklisted accounts' })
  blacklisted: number;

  @ApiProperty({ description: 'Breakdown by account type', type: Object })
  byType: Record<string, number>;

  @ApiProperty({ description: 'Breakdown by business size', type: Object })
  bySize: Record<string, number>;

  @ApiProperty({ description: 'Breakdown by industry', type: Object })
  byIndustry: Record<string, number>;

  @ApiProperty({ description: 'Breakdown by ownership type', type: Object })
  byOwnership: Record<string, number>;

  @ApiProperty({ description: 'Number of parent accounts' })
  parentAccounts: number;

  @ApiProperty({ description: 'Number of subsidiary accounts' })
  subsidiaryAccounts: number;

  @ApiProperty({ description: 'Average number of linked users per account' })
  avgLinkedUsers: number;

  @ApiProperty({ description: 'Average number of documents per account' })
  avgDocuments: number;
}
