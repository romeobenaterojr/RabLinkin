using Application.Profiles.Commands;
using Application.Profiles.DTOs;
using Application.Profiles.Queries;
using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ProfileController : BaseApiController
    {
        [HttpPost("add-photo")]
        public async Task<ActionResult<Photo>> AddPhoto(AddPhoto.Command command)
        {
            return HandleResult(await Mediator.Send(command));
        }

        [HttpGet("{userId}/photos")]
        public async Task<ActionResult<List<Photo>>> GetPhotosForUser(string userId)
        {
            return HandleResult(await Mediator.Send(new GetProfilePhotos.Query
            {
                UserId = userId
            }));
        }

        [HttpDelete("{photoId}/photos")]
        public async Task<ActionResult<List<Photo>>> DeletePhoto(string photoID)
        {
            return HandleResult(await Mediator.Send(new DeletePhoto.Command
            {
                PhotoId = photoID
            }));
        }

        [HttpPut("{photoId}/setMain")]
        public async Task<ActionResult<List<Photo>>> SetMainPhoto(string photoID)
        {
            return HandleResult(await Mediator.Send(new SetMainPhoto.Command
            {
                PhotoId = photoID
            }));
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<UserProfile>> GetProfile(string userId)
        {
            return HandleResult(await Mediator.Send(new GetProfile.Query { UserId = userId }));
        }
    
    }
}
