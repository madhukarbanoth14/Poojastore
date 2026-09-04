import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { SamagriScanService } from '../application/samagri-scan.service';
import { SamagriSavedListService } from '../application/samagri-saved-list.service';
import { SamagriPoojariListService } from '../application/samagri-poojari-list.service';
import { SaveSamagriListDto, ScanTextDto } from './dto/scan.dto';

@ApiTags('Samagri Scan')
@Controller({ path: 'samagri-scan', version: '1' })
export class SamagriScanController {
  constructor(
    private readonly scan: SamagriScanService,
    private readonly savedLists: SamagriSavedListService,
    private readonly poojariLists: SamagriPoojariListService,
  ) {}

  @Public()
  @Post('text')
  @ApiOperation({
    summary: 'Match pasted poojari list text to samagri products',
  })
  async scanText(@Body() body: ScanTextDto) {
    const data = await this.scan.scanText(body.text);
    return { success: true, data };
  }

  @Public()
  @Post('image')
  @ApiOperation({
    summary: 'OCR a photo of a poojari list and match samagri products',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
      required: ['image'],
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async scanImage(
    @UploadedFile()
    file?: {
      buffer: Buffer;
      mimetype?: string;
    },
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Upload a photo as the "image" field.');
    }
    const data = await this.scan.scanImage(file.buffer, file.mimetype);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Get('saved-lists')
  @ApiOperation({ summary: 'List my saved poojari samagri lists' })
  async listSaved(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.savedLists.list(user.id);
    return { success: true, data: { items: data } };
  }

  @ApiBearerAuth()
  @Post('saved-lists')
  @ApiOperation({ summary: 'Save a confirmed samagri list for reuse' })
  async saveList(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SaveSamagriListDto,
  ) {
    const data = await this.savedLists.create(user.id, body);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Get('saved-lists/:id')
  @ApiOperation({ summary: 'Load a saved samagri list with live prices' })
  async loadSaved(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.savedLists.hydrate(user.id, id);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Delete('saved-lists/:id')
  @ApiOperation({ summary: 'Delete a saved samagri list' })
  async deleteSaved(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.savedLists.remove(user.id, id);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Get('received-lists')
  @ApiOperation({ summary: 'Samagri lists sent by your poojari' })
  async listReceived(@CurrentUser() user: AuthenticatedUser) {
    const items = await this.poojariLists.listReceived(user.id);
    return { success: true, data: { items } };
  }

  @ApiBearerAuth()
  @Get('received-lists/:id')
  @ApiOperation({ summary: 'Open a poojari samagri list with live prices' })
  async loadReceived(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.poojariLists.hydrateReceived(user.id, id);
    return { success: true, data };
  }
}
