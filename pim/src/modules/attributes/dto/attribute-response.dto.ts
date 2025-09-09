import { ApiProperty } from '@nestjs/swagger';
import { AttributeType } from '../entities/attribute.entity';

export class AttributeOptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ nullable: true })
  color: string | null;

  @ApiProperty({ nullable: true })
  icon: string | null;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty({ nullable: true })
  metadata: Record<string, any> | null;
}

export class AttributeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ enum: AttributeType })
  type: AttributeType;

  @ApiProperty({ nullable: true })
  groupId: string | null;

  @ApiProperty({ nullable: true })
  groupName?: string;

  @ApiProperty({ type: [AttributeOptionResponseDto], required: false })
  options?: AttributeOptionResponseDto[];

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty()
  isUnique: boolean;

  @ApiProperty({ nullable: true })
  validationRules: any[] | null;

  @ApiProperty({ nullable: true })
  defaultValue: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isVisibleInListing: boolean;

  @ApiProperty()
  isVisibleInDetail: boolean;

  @ApiProperty()
  isComparable: boolean;

  @ApiProperty()
  isSearchable: boolean;

  @ApiProperty()
  isFilterable: boolean;

  @ApiProperty()
  isLocalizable: boolean;

  @ApiProperty({ nullable: true })
  helpText: string | null;

  @ApiProperty({ nullable: true })
  placeholder: string | null;

  @ApiProperty({ nullable: true })
  unit: string | null;

  @ApiProperty({ nullable: true })
  uiConfig: Record<string, any> | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AttributeGroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isCollapsible: boolean;

  @ApiProperty()
  isCollapsedByDefault: boolean;

  @ApiProperty({ nullable: true })
  icon: string | null;

  @ApiProperty({ nullable: true })
  config: Record<string, any> | null;

  @ApiProperty({ type: [AttributeResponseDto], required: false })
  attributes?: AttributeResponseDto[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
