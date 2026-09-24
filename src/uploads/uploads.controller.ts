import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  diskStorage,
} from 'multer';

import {
  extname,
} from 'path';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

function createFileName(
  originalName: string,
) {
  const extension =
    extname(
      originalName,
    ).toLowerCase();

  const uniqueName =
    `${Date.now()}-${Math.round(
      Math.random() *
        1_000_000_000,
    )}`;

  return `${uniqueName}${extension}`;
}

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

function imageFileFilter(
  _request: Express.Request,
  file: Express.Multer.File,
  callback: (
    error: Error | null,
    acceptFile: boolean,
  ) => void,
) {
  if (
    !allowedTypes.includes(
      file.mimetype,
    )
  ) {
    return callback(
      new BadRequestException(
        'Sadece JPG, PNG ve WEBP görseller yüklenebilir.',
      ),
      false,
    );
  }

  callback(
    null,
    true,
  );
}

/**
 * Production'da Render backend adresini,
 * local geliştirmede localhost'u kullanır.
 *
 * Render Environment Variables'a:
 *
 * API_BASE_URL=https://florea-backend-admin.onrender.com
 *
 * ekleyebilirsin.
 */
function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL ||
    'http://localhost:3001'
  ).replace(/\/$/, '');
}

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(
  JwtAuthGuard,
)
@Controller('uploads')
export class UploadsController {
  @Post('image')
  @ApiOperation({
    summary:
      'Ürün görseli yükle',
  })
  @ApiConsumes(
    'multipart/form-data',
  )
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          diskStorage({
            destination:
              './uploads/products',

            filename: (
              _request,
              file,
              callback,
            ) => {
              callback(
                null,
                createFileName(
                  file.originalname,
                ),
              );
            },
          }),

        limits: {
          fileSize:
            5 *
            1024 *
            1024,
        },

        fileFilter:
          imageFileFilter,
      },
    ),
  )
  uploadProductImage(
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Görsel dosyası bulunamadı.',
      );
    }

    return {
      filename:
        file.filename,

      url:
        `${getApiBaseUrl()}/uploads/products/${file.filename}`,
    };
  }

  @Post('balloon-image')
  @ApiOperation({
    summary:
      'Balon görseli yükle',
  })
  @ApiConsumes(
    'multipart/form-data',
  )
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          diskStorage({
            destination:
              './uploads/balloons',

            filename: (
              _request,
              file,
              callback,
            ) => {
              callback(
                null,
                createFileName(
                  file.originalname,
                ),
              );
            },
          }),

        limits: {
          fileSize:
            5 *
            1024 *
            1024,
        },

        fileFilter:
          imageFileFilter,
      },
    ),
  )
  uploadBalloonImage(
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Balon görseli bulunamadı.',
      );
    }

    return {
      filename:
        file.filename,

      url:
        `${getApiBaseUrl()}/uploads/balloons/${file.filename}`,
    };
  }

  @Post('collection-image')
  @ApiOperation({
    summary:
      'Koleksiyon görseli yükle',
  })
  @ApiConsumes(
    'multipart/form-data',
  )
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          diskStorage({
            destination:
              './uploads/collections',

            filename: (
              _request,
              file,
              callback,
            ) => {
              callback(
                null,
                createFileName(
                  file.originalname,
                ),
              );
            },
          }),

        limits: {
          fileSize:
            5 *
            1024 *
            1024,
        },

        fileFilter:
          imageFileFilter,
      },
    ),
  )
  uploadCollectionImage(
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Koleksiyon görseli bulunamadı.',
      );
    }

    return {
      filename:
        file.filename,

      url:
        `${getApiBaseUrl()}/uploads/collections/${file.filename}`,
    };
  }
}
