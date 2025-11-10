using System;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Persistence;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Profiles.Commands
{
    public class AddPhoto
    {
        public class Command : IRequest<Result<Photo>>
        {
            public required IFormFile File { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Photo>>
        {
            private readonly IUserAccessor _userAccessor;
            private readonly AppDbContext _context;
            private readonly IPhotoService _photoService;

            public Handler(IUserAccessor userAccessor, AppDbContext context, IPhotoService photoService)
            {
                _userAccessor = userAccessor;
                _context = context;
                _photoService = photoService;
            }

            public async Task<Result<Photo>> Handle(Command request, CancellationToken cancellationToken)
            {
                var uploadResult = await _photoService.UploadPhoto(request.File);

                if (uploadResult == null) 
                    return Result<Photo>.Failure("Failed to upload photo", 400);

                var user = await _userAccessor.GetUserAsync();

                var photo = new Photo
                {
                    Url = uploadResult.Url,
                    PublicId = uploadResult.PublicId,
                    UserId = user.Id
                };

                user.ImageUrl ??= photo.Url;

                _context.Photos.Add(photo);

                var success = await _context.SaveChangesAsync(cancellationToken) > 0;
                return success
                    ? Result<Photo>.Success(photo)
                    : Result<Photo>.Failure("Problem saving photo to DB", 400);
            }
        }
    }
}
