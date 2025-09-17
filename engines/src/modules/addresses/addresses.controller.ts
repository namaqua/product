import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto, SetDefaultAddressDto } from './dto';
import { Address, AddressType } from './entities/address.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  private readonly logger = new Logger(AddressesController.name);

  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address for an account' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Address created successfully',
  })
  async create(@Body() createAddressDto: CreateAddressDto): Promise<any> {
    this.logger.log(`Creating address with data: ${JSON.stringify(createAddressDto)}`);
    
    const address = await this.addressesService.create(createAddressDto);
    
    // Return standardized response
    return {
      success: true,
      data: {
        item: address,
        message: 'Address created successfully',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get all addresses for an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of addresses',
  })
  async findAllByAccount(@Param('accountId') accountId: string): Promise<any> {
    const addresses = await this.addressesService.findAllByAccount(accountId);
    
    return {
      success: true,
      data: {
        items: addresses,
        meta: {
          totalItems: addresses.length,
          itemCount: addresses.length,
          page: 1,
          totalPages: 1,
          itemsPerPage: addresses.length,
          hasNext: false,
          hasPrevious: false,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('account/:accountId/type/:type')
  @ApiOperation({ summary: 'Get addresses by type for an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiParam({ 
    name: 'type', 
    description: 'Address type',
    enum: AddressType,
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of addresses of specified type',
  })
  async getAddressesByType(
    @Param('accountId') accountId: string,
    @Param('type') type: AddressType,
  ): Promise<any> {
    const addresses = await this.addressesService.getAddressesByType(accountId, type);
    
    return {
      success: true,
      data: {
        items: addresses,
        meta: {
          totalItems: addresses.length,
          itemCount: addresses.length,
          page: 1,
          totalPages: 1,
          itemsPerPage: addresses.length,
          hasNext: false,
          hasPrevious: false,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('account/:accountId/default/:type')
  @ApiOperation({ summary: 'Get the default address of a specific type for an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiParam({ 
    name: 'type', 
    description: 'Address type',
    enum: AddressType,
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Default address of specified type',
  })
  async getDefaultAddress(
    @Param('accountId') accountId: string,
    @Param('type') type: AddressType,
  ): Promise<any> {
    let address = null;
    
    switch(type) {
      case AddressType.HEADQUARTERS:
        address = await this.addressesService.getHeadquartersAddress(accountId);
        break;
      case AddressType.BILLING:
        address = await this.addressesService.getBillingAddress(accountId);
        break;
      case AddressType.SHIPPING:
        address = await this.addressesService.getDefaultShippingAddress(accountId);
        break;
    }
    
    return {
      success: true,
      data: address,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address by ID' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Address details',
  })
  async findOne(@Param('id') id: string): Promise<any> {
    const address = await this.addressesService.findOne(id);
    
    return {
      success: true,
      data: address,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Address updated successfully',
  })
  async update(
    @Param('id') id: string, 
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<any> {
    this.logger.log(`Updating address ${id} with data: ${JSON.stringify(updateAddressDto)}`);
    
    const address = await this.addressesService.update(id, updateAddressDto);
    
    return {
      success: true,
      data: {
        item: address,
        message: 'Address updated successfully',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/set-default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set an address as the default for its type' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Address set as default successfully',
  })
  async setAsDefault(@Param('id') id: string): Promise<any> {
    const address = await this.addressesService.setAsDefault(id);
    
    return {
      success: true,
      data: {
        item: address,
        message: 'Address set as default successfully',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('account/:accountId/clone-hq-to-billing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clone headquarters address as billing address' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Billing address created from headquarters',
  })
  async cloneHQAsBilling(@Param('accountId') accountId: string): Promise<any> {
    const address = await this.addressesService.cloneHQAsBilling(accountId);
    
    return {
      success: true,
      data: {
        item: address,
        message: 'Billing address created from headquarters',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Address validation result',
  })
  async validateAddress(@Param('id') id: string): Promise<any> {
    const address = await this.addressesService.findOne(id);
    const result = await this.addressesService.validateAddress(address);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/track-usage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track usage of an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Usage tracked successfully',
  })
  async trackUsage(@Param('id') id: string): Promise<void> {
    await this.addressesService.trackUsage(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Address deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<any> {
    const address = await this.addressesService.findOne(id);
    await this.addressesService.remove(id);
    
    return {
      success: true,
      data: {
        item: address,
        message: 'Address deleted successfully',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('account/:accountId/migrate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Migrate legacy address data for an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Legacy addresses migrated successfully',
  })
  async migrateLegacyAddresses(
    @Param('accountId') accountId: string,
    @Body() account: any,
  ): Promise<any> {
    await this.addressesService.migrateLegacyAddresses(accountId, account);
    
    return {
      success: true,
      data: {
        message: 'Legacy addresses migrated successfully',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
