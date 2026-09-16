import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  CollectionsService,
} from './collections.service';

import {
  CreateCollectionDto,
} from './dto/create-collection.dto';

import {
  UpdateCollectionDto,
} from './dto/update-collection.dto';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
  ) {}

  @Get()
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(':slug')
  findOne(
    @Param('slug')
    slug: string,
  ) {
    return this.collectionsService.findOne(
      slug,
    );
  }

  @Post()
  @UseGuards(
    JwtAuthGuard,
  )
  @ApiBearerAuth()
  create(
    @Body()
    dto: CreateCollectionDto,
  ) {
    return this.collectionsService.create(
      dto,
    );
  }

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
  )
  @ApiBearerAuth()
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
  )
  @ApiBearerAuth()
  remove(
    @Param('id')
    id: string,
  ) {
    return this.collectionsService.remove(
      id,
    );
  }
}