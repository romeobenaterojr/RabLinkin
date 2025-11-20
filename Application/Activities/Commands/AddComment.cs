using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using MediatR;
using Persistence;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Commands
{
    public class AddComment
    {
        // Command: represents the data sent from client
        public class Command : IRequest<Result<CommentDTO>>
        {
            public required string Body { get; set; } = string.Empty;
            public required string ActivityId { get; set; }
        }

        // Handler: processes the command
        public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor) : IRequestHandler<Command, Result<CommentDTO>>
        {
            private readonly AppDbContext _context = context;
            private readonly IMapper _mapper = mapper;
            private readonly IUserAccessor _userAccessor = userAccessor;

            public async Task<Result<CommentDTO>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _userAccessor.GetUserAsync();
                if (user == null) return Result<CommentDTO>.Failure("User not found", 404);

                var activity = await _context.Activities
                    .Include(x => x.Comments)
                    .ThenInclude(x => x.User)
                    .FirstOrDefaultAsync(x => x.Id == request.ActivityId, cancellationToken);

                if (activity == null) return Result<CommentDTO>.Failure("Activity not found", 404);

               var comment = new Comment
                {
                    UserId = user.Id,
                    ActivityId = activity.Id,
                    Body = request.Body
                   
                };
                _context.Comments.Add(comment);
                var result = await _context.SaveChangesAsync(cancellationToken) > 0;

                return result
                    ? Result<CommentDTO>.Success(_mapper.Map<CommentDTO>(comment))
                    : Result<CommentDTO>.Failure("Failed to add comment", 400);
            }
        }
    }
}
