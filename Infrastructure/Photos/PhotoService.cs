using System;
using Application.Interfaces;
using Application.Profiles.DTOs;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Infrastructure.Photos;

public class PhotoService : IPhotoService
{
    private readonly Cloudinary _cloudinary;
    public PhotoService(IOptions<CloudinarySettings> config)
    {
        var account = new Account(
            config.Value.CloudName,
            config.Value.Apikey,
            config.Value.ApiSecret

        );
        _cloudinary = new Cloudinary(account);
    }
    public async Task<string> DeletePhoto(string publicId)
    {
        var deletePArams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deletePArams);

        if (result.Error != null)
        {
            throw new Exception(result.Error.Message);
        }
        return result.Result;
    }

    public async Task<PhotoUploadResult?> UploadPhoto(IFormFile formFile)
    {
        if (formFile.Length > 0)
        {
            await using var stream = formFile.OpenReadStream();

            var UploadParams = new ImageUploadParams
            {
                File = new FileDescription(formFile.FileName, stream),
                // Transformation =  new Transformation().Height(500).Width(500).Crop("file")
                Folder = "Rablinkin2025"

            };
            var uploadResult = await _cloudinary.UploadAsync(UploadParams);
            if (uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);

            }

            return new PhotoUploadResult
            {
                 PublicId = uploadResult.PublicId,
                 Url = uploadResult.SecureUrl.AbsoluteUri
            };

        }

        return null;
    }
}
