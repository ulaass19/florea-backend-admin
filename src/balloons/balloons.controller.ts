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
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  BalloonsService,
} from './balloons.service';

import {
  CreateBalloonDto,
} from './dto/create-balloon.dto';

import {
  UpdateBalloonDto,
} from './dto/update-balloon.dto';

@ApiTags('Balloons')
@Controller('balloons')
export class BalloonsController {
  constructor(
    private readonly balloonsService:
      BalloonsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Tüm balonları getir',
  })
  findAll() {
    return this.balloonsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({
    summary:
      'Slug ile balon getir',
  })
  findOne(
    @Param('slug')
    slug: string,
  ) {
    return this.balloonsService.findOne(
      slug,
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(
    JwtAuthGuard,
  )
  @ApiOperation({
    summary:
      'Yeni balon oluştur',
  })
  create(
    @Body()
    dto: CreateBalloonDto,
  ) {
    return this.balloonsService.create(
      dto,
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(
    JwtAuthGuard,
  )
  @ApiOperation({
    summary:
      'Balonu güncelle',
  })
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateBalloonDto,
  ) {
    return this.balloonsService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(
    JwtAuthGuard,
  )
  @ApiOperation({
    summary:
      'Balonu sil',
  })
  remove(
    @Param('id')
    id: string,
  ) {
    return this.balloonsService.remove(
      id,
    );
  }
}