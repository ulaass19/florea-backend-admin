import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
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
  memoryStorage,
} from 'multer';

import {
  v2 as cloudinary,
} from 'cloudinary';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

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

function configureCloudinary() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME;

  const apiKey =
    process.env.CLOUDINARY_API_KEY;

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET;

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret
  ) {
    throw new InternalServerErrorException(
      'Cloudinary ayarları eksik.',
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

async function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string,
) {
  configureCloudinary();

  return new Promise<{
    filename: string;
    url: string;
  }>((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder:
            `florea/${folder}`,

          resource_type:
            'image',

          unique_filename:
            true,

          overwrite:
            false,
        },

        (error, result) => {
          if (
            error ||
            !result
          ) {
            console.error(
              'Cloudinary upload error:',
              error,
            );

            reject(
              new InternalServerErrorException(
                'Görsel Cloudinary sistemine yüklenemedi.',
              ),
            );

            return;
          }

          resolve({
            filename:
              result.public_id,

            url:
              result.secure_url,
          });
        },
      );

    uploadStream.end(
      file.buffer,
    );
  });
}

const uploadOptions = {
  storage:
    memoryStorage(),

  limits: {
    fileSize:
      5 *
      1024 *
      1024,
  },

  fileFilter:
    imageFileFilter,
};

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
      uploadOptions,
    ),
  )
  async uploadProductImage(
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Görsel dosyası bulunamadı.',
      );
    }

    return uploadToCloudinary(
      file,
      'products',
    );
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
      uploadOptions,
    ),
  )
  async uploadBalloonImage(
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Balon görseli bulunamadı.',
      );
    }

    return uploadToCloudinary(
      file,
      'balloons',
    );
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
      uploadOptions,
    ),
  )
  async uploadCollectionImage(
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Koleksiyon görseli bulunamadı.',
      );
    }

    return uploadToCloudinary(
      file,
      'collections',
    );
  }
}
